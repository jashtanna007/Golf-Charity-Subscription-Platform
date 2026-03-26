import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Trophy, Heart, CreditCard, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import ScoreEntryForm from "@/components/shared/ScoreEntryForm";
import DrawResultCard from "@/components/shared/DrawResultCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import useAuthStore from "@/stores/authStore";
import useScoreStore from "@/stores/scoreStore";
import useSubscriptionStore from "@/stores/subscriptionStore";
import useDrawStore from "@/stores/drawStore";
import { formatDate, formatCurrency, getSubscriptionStatusColor } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";

function Dashboard() {
  const { user } = useAuthStore();
  const { scores, fetchScores } = useScoreStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const { draws, currentDraw, fetchDraws, fetchCurrentDraw } = useDrawStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifyBanner, setVerifyBanner] = useState(null);

  useEffect(() => {
    fetchScores();
    fetchSubscription();
    fetchDraws();
    fetchCurrentDraw();
  }, []);

  const averageScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
    : "—";

  return (
    <div className="page-container">
      {verifyBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
            verifyBanner.type === "success"
              ? "bg-primary-container text-on-primary-container"
              : verifyBanner.type === "error"
              ? "bg-error-container text-on-error-container"
              : "bg-surface-container text-on-surface"
          }`}
        >
          {verifyBanner.type === "loading" && (
            <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin shrink-0" />
          )}
          {verifyBanner.type === "success" && <CheckCircle className="w-5 h-5 shrink-0" />}
          <p className="text-body-md font-medium">{verifyBanner.message}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-1">
          Welcome back, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Here's your performance overview and upcoming draws.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Target}
          label="Average Score"
          value={averageScore}
          subtext={`${scores.length}/5 scores recorded`}
        />
        <StatsCard
          icon={Trophy}
          label="Draws Entered"
          value={draws.filter(d => d.status !== "pending").length}
          subtext="All-time participation"
        />
        <StatsCard
          icon={Heart}
          label="Charity Impact"
          value={`${user?.charity_percentage || 10}%`}
          subtext="Of your subscription"
        />
        <StatsCard
          icon={CreditCard}
          label="Subscription"
          value={
            <Badge className="mt-1" variant={subscription?.status === "active" ? "success" : "warning"}>
              {subscription?.status || "Inactive"}
            </Badge>
          }
          subtext={subscription ? `${subscription.plan_type} plan` : "No active plan"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ScoreEntryForm onSuccess={fetchScores} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-elevation-1 p-6"
        >
          <h3 className="font-headline text-headline-sm text-on-surface mb-4">
            Recent Rounds
          </h3>
          {scores.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No scores recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {scores.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                      <span className="font-headline text-title-md text-on-primary-container">
                        {s.score}
                      </span>
                    </div>
                    <div>
                      <p className="font-label text-label-lg text-on-surface">
                        {s.score} points
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatDate(s.played_date)}
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-elevation-1 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-headline-sm text-on-surface">
              Draw Participation
            </h3>
            <Button variant="tertiary" size="sm" onClick={() => navigate("/draws")}>
              View All
            </Button>
          </div>
          {currentDraw ? (
            <DrawResultCard draw={currentDraw} />
          ) : (
            <p className="text-body-md text-on-surface-variant">No active draw at the moment.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-elevation-1 p-6"
        >
          <h3 className="font-headline text-headline-sm text-on-surface mb-4">
            Your Impact
          </h3>
          <div className="p-4 bg-primary-container/30 rounded-xl mb-4">
            <p className="text-body-lg text-on-surface font-medium">
              🌱 You've contributed to global impact with every round you play.
            </p>
          </div>
          <ProgressBar
            value={user?.charity_percentage || 10}
            max={100}
            label="Charity Contribution"
            showLabel
            variant="primary"
          />
          {subscription && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Next Renewal</span>
                <span className="font-label text-label-lg text-on-surface">
                  {subscription.current_period_end
                    ? formatDate(subscription.current_period_end)
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
