import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import useScoreStore from "@/stores/scoreStore";

function ScoreEntryForm({ onSuccess }) {
  const { addScore, isLoading } = useScoreStore();
  const [score, setScore] = useState("");
  const [playedDate, setPlayedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45");
      return;
    }

    try {
      await addScore(scoreNum, playedDate);
      setScore("");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add score");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-elevation-1 p-6"
    >
      <h3 className="font-headline text-headline-sm text-on-surface mb-4">
        Enter New Score
      </h3>
      <p className="text-body-md text-on-surface-variant mb-6">
        Record your latest Stableford score (1-45). Only your last 5 scores are kept.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          id="score-input"
          label="Stableford Score"
          type="number"
          min={1}
          max={45}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter score (1-45)"
          error={error}
        />
        <Input
          id="date-input"
          label="Date Played"
          type="date"
          value={playedDate}
          onChange={(e) => setPlayedDate(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        <Plus className="w-4 h-4" />
        {isLoading ? "Adding..." : "Add Score"}
      </Button>
    </motion.form>
  );
}

export default ScoreEntryForm;
