const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    res.json({ scores });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { score, playedDate } = req.body;

    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: "Score must be between 1 and 45" });
    }

    if (!playedDate) {
      return res.status(400).json({ error: "Played date is required" });
    }

    const { data: newScore, error } = await supabase
      .from("scores")
      .insert({
        user_id: req.user.id,
        score,
        played_date: playedDate,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to add score" });
    }

    const { data: allScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    res.status(201).json({ score: newScore, scores: allScores });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) {
      return res.status(500).json({ error: "Failed to delete score" });
    }

    res.json({ message: "Score deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const range = req.query.range || "all";

    let query = supabase
      .from("scores")
      .select("user_id, score, played_date, users(full_name)");

    if (range === "month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query = query.gte("played_date", startOfMonth.toISOString().split("T")[0]);
    } else if (range === "week") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      query = query.gte("played_date", startOfWeek.toISOString().split("T")[0]);
    }

    const { data: scores, error } = await query;

    if (error) {
      console.error("[LEADERBOARD] Query error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }

    const playerMap = {};
    for (const s of scores) {
      if (!playerMap[s.user_id]) {
        playerMap[s.user_id] = {
          user_id: s.user_id,
          full_name: s.users?.full_name || "Unknown",
          scores: [],
        };
      }
      playerMap[s.user_id].scores.push(s.score);
    }

    const leaderboard = Object.values(playerMap)
      .map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        avg_score: (p.scores.reduce((a, b) => a + b, 0) / p.scores.length),
        best_score: Math.max(...p.scores),
        total_rounds: p.scores.length,
      }))
      .sort((a, b) => b.avg_score - a.avg_score);

    res.json({ leaderboard });
  } catch (error) {
    console.error("[LEADERBOARD] Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
