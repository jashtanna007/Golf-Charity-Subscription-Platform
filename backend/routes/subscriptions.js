const express = require("express");
const { supabase } = require("../config/supabase");
const { stripe } = require("../config/stripe");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    res.json({ subscription: subscription || null });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create-checkout", authenticateToken, async (req, res) => {
  try {
    const { planType } = req.body;

    if (!["monthly", "yearly"].includes(planType)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    let customerId = req.user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.full_name,
        metadata: { userId: req.user.id },
      });

      customerId = customer.id;

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", req.user.id);
    }

    const priceId =
      planType === "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?cancelled=true`,
      metadata: {
        userId: req.user.id,
        planType,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .single();

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.stripe_subscription_id);

    res.json({ message: "Subscription will cancel at end of current period" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

router.get("/payments", authenticateToken, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    res.json({ payments: payments || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verify", authenticateToken, async (req, res) => {
  try {
    console.log("[VERIFY] Checking subscription for user:", req.user.id);

    let customerId = req.user.stripe_customer_id;

    if (!customerId) {
      console.log("[VERIFY] No Stripe customer ID found");
      return res.status(404).json({ error: "No Stripe customer found. Please subscribe first." });
    }

    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 1,
    });

    const session = sessions.data[0];

    if (!session || session.payment_status !== "paid") {
      console.log("[VERIFY] No paid session found");
      return res.status(404).json({ error: "No completed payment found" });
    }

    console.log("[VERIFY] Found paid session:", session.id, "Subscription:", session.subscription);

    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

    const planType = session.metadata?.planType || "monthly";
    const amount = stripeSubscription.items.data[0]?.price?.unit_amount
      ? stripeSubscription.items.data[0].price.unit_amount / 100
      : planType === "yearly" ? 99.99 : 9.99;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", session.subscription)
      .single();

    if (existingSub) {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: stripeSubscription.current_period_start
            ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
            : new Date().toISOString(),
          current_period_end: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", existingSub.id);

      console.log("[VERIFY] Updated existing subscription to active");
    } else {
      const charityContribution = amount * ((req.user.charity_percentage || 10) / 100);

      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: req.user.id,
          stripe_subscription_id: session.subscription,
          plan_type: planType,
          status: "active",
          amount,
          charity_contribution: charityContribution,
          current_period_start: stripeSubscription.current_period_start
            ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
            : new Date().toISOString(),
          current_period_end: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) {
        console.error("[VERIFY] Insert error:", insertError);
        return res.status(500).json({ error: "Failed to create subscription record: " + insertError.message });
      }
      console.log("[VERIFY] Created new subscription record");
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    res.json({ subscription, verified: true });
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    res.status(500).json({ error: "Verification failed: " + error.message });
  }
});

module.exports = router;
