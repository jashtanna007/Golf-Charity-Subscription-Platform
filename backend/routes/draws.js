const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");
const { generateRandomNumbers } = require("../services/drawEngine");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(12);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch draws" });
    }

    res.json({ draws });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/current", authenticateToken, async (req, res) => {
  try {
    const { data: draw, error } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.json({ draw: null });
    }

    const { data: entry } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", draw.id)
      .eq("user_id", req.user.id)
      .single();

    res.json({ draw, userEntry: entry || null });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/enter", authenticateToken, async (req, res) => {
  try {
    const { drawId, entryNumbers } = req.body;

    if (!drawId) {
      return res.status(400).json({ error: "Draw ID is required" });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .single();

    if (!subscription) {
      return res.status(403).json({ error: "Active subscription required to enter draws" });
    }

    const { data: draw } = await supabase
      .from("draws")
      .select("status")
      .eq("id", drawId)
      .single();

    if (!draw || draw.status !== "pending") {
      return res.status(400).json({ error: "Draw is not accepting entries" });
    }

    const numbers = entryNumbers && entryNumbers.length === 5
      ? entryNumbers
      : generateRandomNumbers(5, 45);

    const validNumbers = numbers.every((n) => n >= 1 && n <= 45);
    if (!validNumbers || new Set(numbers).size !== 5) {
      return res.status(400).json({ error: "Entry must be 5 unique numbers between 1-45" });
    }

    const { data: entry, error } = await supabase
      .from("draw_entries")
      .insert({
        draw_id: drawId,
        user_id: req.user.id,
        entry_numbers: numbers.sort((a, b) => a - b),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Already entered this draw" });
      }
      return res.status(500).json({ error: "Failed to enter draw" });
    }

    res.status(201).json({ entry });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/results", authenticateToken, async (req, res) => {
  try {
    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!draw) {
      return res.status(404).json({ error: "Draw not found" });
    }

    const { data: winners } = await supabase
      .from("winners")
      .select("*, users(full_name, email)")
      .eq("draw_id", req.params.id);

    const { data: userEntry } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    res.json({ draw, winners: winners || [], userEntry });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
