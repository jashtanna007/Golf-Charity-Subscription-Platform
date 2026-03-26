import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Medal, Trophy, TrendingUp, Crown, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/scores/leaderboard?range=${timeRange}`);
      setPlayers(data.leaderboard || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200/50";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200/50";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-200/30";
    return "bg-surface-container text-on-surface-variant";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5" strokeWidth={2} />;
    if (rank === 2) return <Medal className="w-5 h-5" strokeWidth={2} />;
    if (rank === 3) return <Trophy className="w-5 h-5" strokeWidth={2} />;
    return <span className="font-headline text-title-md">{rank}</span>;
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-2">
          Leaderboard
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Top golfers ranked by average Stableford score. Play more rounds to climb the ranks.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8"
      >
        {[
          { value: "all", label: "All Time" },
          { value: "month", label: "This Month" },
          { value: "week", label: "This Week" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeRange(opt.value)}
            className={cn(
              "px-5 py-2.5 rounded-full text-body-md font-medium transition-all duration-200",
              timeRange === opt.value
                ? "bg-primary text-white shadow-glow-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {players.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
        >
          {[players[1], players[0], players[2]].map((player, idx) => {
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const isFirst = rank === 1;
            return (
              <motion.div
                key={player.user_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl bg-white shadow-elevation-2 transition-transform hover:scale-105",
                  isFirst && "transform -translate-y-4 shadow-elevation-3"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-3",
                  getRankStyle(rank)
                )}>
                  {getRankIcon(rank)}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mb-2">
                  <span className="font-headline text-title-lg text-on-primary-container">
                    {player.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <p className="font-headline text-title-md text-on-surface text-center truncate w-full">
                  {player.full_name}
                </p>
                <p className="font-headline text-headline-md text-primary mt-1">
                  {Number(player.avg_score).toFixed(1)}
                </p>
                <p className="text-label-sm text-on-surface-variant uppercase">
                  Avg Score
                </p>
                <Badge variant="outline" className="mt-2">
                  {player.total_rounds} round{player.total_rounds !== 1 ? "s" : ""}
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-elevation-1 overflow-hidden"
      >
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low text-label-md text-on-surface-variant uppercase font-label">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Avg Score</div>
          <div className="col-span-2 text-center">Best</div>
          <div className="col-span-2 text-center">Rounds</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : players.length === 0 ? (
          <div className="p-12 text-center">
            <Medal className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" strokeWidth={1} />
            <p className="text-body-lg text-on-surface-variant">No scores recorded yet</p>
            <p className="text-body-md text-on-surface-variant mt-1">
              Be the first to submit a round!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {players.map((player, idx) => {
              const rank = idx + 1;
              return (
                <motion.div
                  key={player.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="col-span-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      getRankStyle(rank)
                    )}>
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </div>
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-headline text-title-md text-on-primary-container">
                        {player.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-label text-label-lg text-on-surface">
                        {player.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-headline text-title-md text-primary">
                      {Number(player.avg_score).toFixed(1)}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-label text-label-lg text-on-surface">
                      {player.best_score || "—"}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="outline">{player.total_rounds}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Leaderboard;
