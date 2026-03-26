import { motion } from "framer-motion";
import { Check, Zap, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";

function SubscriptionCard({ plan, isCurrentPlan, onSubscribe, popular }) {
  const isYearly = plan.type === "yearly";

  return (
    <Card
      hover
      className={cn(
        "relative overflow-hidden",
        popular && "ring-2 ring-primary shadow-glow-primary"
      )}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isYearly ? (
                <Crown className="w-5 h-5 text-secondary" strokeWidth={1.5} />
              ) : (
                <Zap className="w-5 h-5 text-primary" strokeWidth={1.5} />
              )}
              <h3 className="font-headline text-headline-sm text-on-surface">
                {plan.name}
              </h3>
            </div>
            <p className="text-body-md text-on-surface-variant">{plan.description}</p>
          </div>
          {popular && <Badge variant="primary">Popular</Badge>}
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-display-sm text-on-surface">
              {formatCurrency(plan.price)}
            </span>
            <span className="text-body-md text-on-surface-variant">
              /{isYearly ? "year" : "month"}
            </span>
          </div>
          {isYearly && plan.monthlyEquivalent && (
            <p className="text-body-sm text-primary mt-1">
              {formatCurrency(plan.monthlyEquivalent)}/month — Save {plan.savings}%
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center mt-0.5 shrink-0">
                <Check className="w-3 h-3 text-on-primary-container" />
              </div>
              <span className="text-body-md text-on-surface">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Button
          variant={isCurrentPlan ? "secondary" : popular ? "primary" : "outline"}
          size="lg"
          className="w-full"
          disabled={isCurrentPlan}
          onClick={() => onSubscribe?.(plan.type)}
        >
          {isCurrentPlan ? "Current Plan" : `Subscribe ${isYearly ? "Yearly" : "Monthly"}`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SubscriptionCard;
