import { useEffect } from "react";
import { motion } from "framer-motion";
import SubscriptionCard from "@/components/shared/SubscriptionCard";
import useSubscriptionStore from "@/stores/subscriptionStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency, getSubscriptionStatusColor } from "@/lib/utils";

function Subscription() {
  const { subscription, payments, fetchSubscription, fetchPayments, createCheckout, cancelSubscription } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscription();
    fetchPayments();
  }, []);

  const plans = [
    {
      type: "monthly",
      name: "Monthly",
      description: "Perfect for getting started",
      price: 9.99,
      features: [
        "Enter up to 5 scores",
        "Monthly prize draw entry",
        "10% charity contribution",
        "Real-time dashboard",
        "Score analytics",
      ],
    },
    {
      type: "yearly",
      name: "Yearly",
      description: "Best value for committed golfers",
      price: 99.99,
      monthlyEquivalent: 8.33,
      savings: 17,
      features: [
        "Everything in Monthly",
        "Priority draw entry",
        "Increase charity up to 25%",
        "Exclusive yearly bonus draw",
        "Winner verification priority",
        "Early access to new features",
      ],
    },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-4">
          Choose Your Plan
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Elevate your game and support charities with every subscription.
          Secure access to all prize pools and contribute to global impact.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
        {plans.map((plan) => (
          <motion.div
            key={plan.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plan.type === "yearly" ? 0.1 : 0 }}
          >
            <SubscriptionCard
              plan={plan}
              isCurrentPlan={subscription?.plan_type === plan.type && subscription?.status === "active"}
              popular={plan.type === "yearly"}
              onSubscribe={createCheckout}
            />
          </motion.div>
        ))}
      </div>

      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-elevation-1 p-6 mb-6">
            <h3 className="font-headline text-headline-sm text-on-surface mb-4">
              Current Subscription
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase mb-1">Status</p>
                <Badge variant={subscription.status === "active" ? "success" : "warning"}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase mb-1">Plan</p>
                <p className="font-label text-label-lg text-on-surface capitalize">{subscription.plan_type}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase mb-1">Amount</p>
                <p className="font-label text-label-lg text-on-surface">{formatCurrency(subscription.amount)}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase mb-1">Renews</p>
                <p className="font-label text-label-lg text-on-surface">
                  {subscription.current_period_end ? formatDate(subscription.current_period_end) : "—"}
                </p>
              </div>
            </div>
            {subscription.status === "active" && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <Button variant="danger" size="sm" onClick={cancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>

          {payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-elevation-1 p-6">
              <h3 className="font-headline text-headline-sm text-on-surface mb-4">
                Payment History
              </h3>
              <div className="space-y-2">
                {payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
                  >
                    <div>
                      <p className="font-label text-label-lg text-on-surface">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === "paid" ? "success" : "warning"}>
                        {payment.status}
                      </Badge>
                      {payment.charity_contribution > 0 && (
                        <p className="text-body-sm text-primary mt-1">
                          {formatCurrency(payment.charity_contribution)} to charity
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default Subscription;
