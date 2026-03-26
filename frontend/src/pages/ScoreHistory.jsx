import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import useScoreStore from "@/stores/scoreStore";
import ScoreEntryForm from "@/components/shared/ScoreEntryForm";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

function ScoreHistory() {
  const { scores, fetchScores, deleteScore } = useScoreStore();

  useEffect(() => {
    fetchScores();
  }, []);

  const averageScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
    : 0;

  const highestScore = scores.length > 0
    ? Math.max(...scores.map((s) => s.score))
    : 0;

  const lowestScore = scores.length > 0
    ? Math.min(...scores.map((s) => s.score))
    : 0;

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-1">
          Score History
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Your last 5 Stableford scores. New scores automatically replace the oldest.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Average", value: averageScore, icon: TrendingUp, color: "primary" },
          { label: "Highest", value: highestScore, icon: TrendingUp, color: "primary" },
          { label: "Lowest", value: lowestScore, icon: TrendingDown, color: "secondary" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-elevation-1 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
              <span className="font-label text-label-md text-on-surface-variant uppercase">
                {stat.label}
              </span>
            </div>
            <p className="font-headline text-headline-lg text-on-surface">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreEntryForm onSuccess={fetchScores} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-elevation-1 p-6"
        >
          <h3 className="font-headline text-headline-sm text-on-surface mb-4">
            Score Timeline
          </h3>

          {scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-lg text-on-surface-variant">No scores recorded yet</p>
              <p className="text-body-md text-on-surface-variant mt-1">Add your first score to get started</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-48 mb-6 px-2">
                {scores.map((s, idx) => {
                  const heightPercent = (s.score / 45) * 100;
                  return (
                    <motion.div
                      key={s.id}
                      className="flex-1 flex flex-col items-center gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="font-label text-label-lg text-on-surface">
                        {s.score}
                      </span>
                      <div
                        className="w-full rounded-t-lg gradient-primary transition-all duration-500"
                        style={{ height: `${heightPercent}%`, minHeight: "20px" }}
                      />
                      <span className="text-body-sm text-on-surface-variant text-center">
                        {new Date(s.played_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-2">
                {scores.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                        <span className="font-headline text-title-md text-on-primary-container">
                          {s.score}
                        </span>
                      </div>
                      <div>
                        <p className="font-label text-label-lg text-on-surface">
                          {s.score} Stableford points
                        </p>
                        <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(s.played_date)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteScore(s.id)}
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ScoreHistory;
