const express = require("express");
const { supabase } = require("../config/supabase");
const { stripe } = require("../config/stripe");

const router = express.Router();

const safeDate = (timestamp) => {
  if (!timestamp) return null;
  const d = new Date(timestamp * 1000);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  console.log("[WEBHOOK] Event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const stripeCustomerId = session.customer;
    const customerEmail = session.customer_details?.email || session.customer_email;
    const planType = session.metadata?.planType || "monthly";

    console.log("[WEBHOOK] checkout.session.completed");
    console.log("[WEBHOOK] Stripe Customer ID:", stripeCustomerId);
    console.log("[WEBHOOK] Customer Email:", customerEmail);
    console.log("[WEBHOOK] Subscription ID:", session.subscription);

    let user = null;

    if (stripeCustomerId) {
      console.log("[WEBHOOK] Looking up user by stripe_customer_id:", stripeCustomerId);
      const { data } = await supabase
        .from("users")
        .select("id, email, full_name, charity_id, charity_percentage")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();
      user = data;
    }

    if (!user && customerEmail) {
      console.log("[WEBHOOK] stripe_customer_id lookup failed, falling back to email:", customerEmail);
      const { data } = await supabase
        .from("users")
        .select("id, email, full_name, charity_id, charity_percentage")
        .eq("email", customerEmail)
        .single();
      user = data;
    }

    if (!user) {
      console.error("[WEBHOOK] Could not find user by stripe_customer_id or email. Aborting.");
      return res.json({ received: true });
    }

    console.log("[WEBHOOK] User found:", user.id, user.email, user.full_name);

    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      const amount = stripeSubscription.items?.data?.[0]?.price?.unit_amount
        ? stripeSubscription.items.data[0].price.unit_amount / 100
        : planType === "yearly" ? 99.99 : 9.99;

      const periodStart = safeDate(stripeSubscription.current_period_start) || new Date().toISOString();
      const periodEnd = safeDate(stripeSubscription.current_period_end) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      console.log("[WEBHOOK] Amount:", amount, "Period:", periodStart, "→", periodEnd);

      const { error: subError } = await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_subscription_id: session.subscription,
          plan_type: planType,
          status: "active",
          amount,
          current_period_start: periodStart,
          current_period_end: periodEnd,
        },
        { onConflict: "stripe_subscription_id" }
      );

      if (subError) {
        console.error("[WEBHOOK] Failed to upsert subscriptions table:", subError);
      } else {
        console.log("[WEBHOOK] subscriptions table updated to 'active' for user:", user.id);
      }

      const { error: userError } = await supabase
        .from("users")
        .update({
          subscription_status: "active",
          stripe_customer_id: stripeCustomerId,
        })
        .eq("id", user.id);

      if (userError) {
        console.error("[WEBHOOK] Failed to update users.subscription_status:", userError);
      } else {
        console.log("[WEBHOOK] users.subscription_status set to 'active' for:", user.email);
      }

      const charityContribution = amount * ((user.charity_percentage || 10) / 100);

      await supabase.from("payments").insert({
        user_id: user.id,
        stripe_payment_id: session.payment_intent,
        amount,
        charity_contribution: charityContribution,
        type: "subscription",
        status: "paid",
      });

      console.log("[WEBHOOK] Payment record created. Charity contribution:", charityContribution);

      if (user.charity_id) {
        await supabase.rpc("increment_charity_total", {
          charity_id_input: user.charity_id,
          amount_input: charityContribution,
        });
        console.log("[WEBHOOK] Charity total incremented for charity:", user.charity_id);
      }
    } catch (err) {
      console.error("[WEBHOOK] Error processing checkout.session.completed:", err);
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    if (invoice.billing_reason === "subscription_cycle") {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*, users(id, email, charity_percentage)")
        .eq("stripe_subscription_id", invoice.subscription)
        .single();

      if (subscription) {
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);

        const periodStart = safeDate(stripeSubscription.current_period_start) || new Date().toISOString();
        const periodEnd = safeDate(stripeSubscription.current_period_end) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
          .eq("stripe_subscription_id", invoice.subscription);

        await supabase
          .from("users")
          .update({ subscription_status: "active" })
          .eq("id", subscription.user_id);

        const amount = invoice.amount_paid / 100;
        const charityContribution = amount * ((subscription.users?.charity_percentage || 10) / 100);

        await supabase.from("payments").insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          stripe_payment_id: invoice.payment_intent,
          amount,
          charity_contribution: charityContribution,
          type: "subscription",
          status: "paid",
        });

        console.log("[WEBHOOK] Invoice renewal processed for user:", subscription.user_id);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", sub.id)
      .single();

    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("stripe_subscription_id", sub.id);

    if (subscription) {
      await supabase
        .from("users")
        .update({ subscription_status: "cancelled" })
        .eq("id", subscription.user_id);
    }

    console.log("[WEBHOOK] Subscription cancelled:", sub.id);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", invoice.subscription)
      .single();

    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", invoice.subscription);

    if (subscription) {
      await supabase
        .from("users")
        .update({ subscription_status: "past_due" })
        .eq("id", subscription.user_id);
    }

    console.log("[WEBHOOK] Payment failed for:", invoice.subscription);
  }

  res.json({ received: true });
});

module.exports = router;
