const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { executeDraw, notifyDrawParticipants } = require("../services/drawEngine");
const { sendWinnerVerificationUpdate } = require("../services/emailService");

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get("/stats", async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: activeSubscribers } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { data: payments } = await supabase
      .from("payments")
      .select("amount, charity_contribution")
      .eq("status", "paid");

    const totalRevenue = (payments || []).reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const totalCharityContributions = (payments || []).reduce(
      (sum, p) => sum + parseFloat(p.charity_contribution),
      0
    );

    const { data: draws } = await supabase
      .from("draws")
      .select("total_prize_pool")
      .eq("status", "published");

    const totalPrizePool = (draws || []).reduce(
      (sum, d) => sum + parseFloat(d.total_prize_pool || 0),
      0
    );

    res.json({
      totalUsers,
      activeSubscribers,
      totalRevenue,
      totalCharityContributions,
      totalPrizePool,
      totalDraws: (draws || []).length,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select("id, email, full_name, role, charity_percentage, created_at, subscriptions(status, plan_type)", { count: "exact" });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    res.json({ users, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, email, full_name, role, charity_id, charity_percentage, avatar_url, created_at, subscriptions(*), scores(*)")
      .eq("id", req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/draws/execute", async (req, res) => {
  try {
    const { drawType = "random" } = req.body;

    const result = await executeDraw(drawType);

    res.json({
      message: "Draw executed successfully",
      drawId: result.drawId,
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners.length,
      totalPool: result.totalPool,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute draw" });
  }
});

router.post("/draws/:id/publish", async (req, res) => {
  try {
    const { error } = await supabase
      .from("draws")
      .update({ status: "published" })
      .eq("id", req.params.id)
      .eq("status", "completed");

    if (error) {
      return res.status(500).json({ error: "Failed to publish draw" });
    }

    await notifyDrawParticipants(req.params.id);

    res.json({ message: "Draw published and participants notified" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/draws/simulate", async (req, res) => {
  try {
    const { drawType = "random" } = req.body;

    const winningNumbers =
      drawType === "algorithmic"
        ? [1, 10, 20, 30, 40]
        : Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1).sort(
            (a, b) => a - b
          );

    const { data: pendingDraw } = await supabase
      .from("draws")
      .select("id")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let potentialWinners = { 5: 0, 4: 0, 3: 0 };

    if (pendingDraw) {
      const { data: entries } = await supabase
        .from("draw_entries")
        .select("entry_numbers")
        .eq("draw_id", pendingDraw.id);

      for (const entry of entries || []) {
        const matches = entry.entry_numbers.filter((n) =>
          winningNumbers.includes(n)
        ).length;
        if (matches >= 3) {
          potentialWinners[matches]++;
        }
      }
    }

    res.json({
      simulatedNumbers: winningNumbers,
      drawType,
      potentialWinners,
      totalEntries: potentialWinners[3] + potentialWinners[4] + potentialWinners[5],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/charities", async (req, res) => {
  try {
    const { name, description, category, imageUrl, websiteUrl, featured } = req.body;

    const { data: charity, error } = await supabase
      .from("charities")
      .insert({
        name,
        description,
        category,
        image_url: imageUrl,
        website_url: websiteUrl,
        featured: featured || false,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create charity" });
    }

    res.status(201).json({ charity });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/charities/:id", async (req, res) => {
  try {
    const { name, description, category, imageUrl, websiteUrl, featured } = req.body;

    const { data: charity, error } = await supabase
      .from("charities")
      .update({
        name,
        description,
        category,
        image_url: imageUrl,
        website_url: websiteUrl,
        featured,
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update charity" });
    }

    res.json({ charity });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/charities/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json({ error: "Failed to delete charity" });
    }

    res.json({ message: "Charity deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/winners", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from("winners")
      .select("*, users(full_name, email), draws(draw_date)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data: winners } = await query;

    res.json({ winners: winners || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/winners/:id/verify", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }

    const updates = { verification_status: status };

    if (status === "approved") {
      updates.payment_status = "paid";
      updates.paid_at = new Date().toISOString();
    }

    const { data: winner, error } = await supabase
      .from("winners")
      .update(updates)
      .eq("id", req.params.id)
      .select("*, users(email, full_name)")
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update verification" });
    }

    await sendWinnerVerificationUpdate(
      winner.users.email,
      winner.users.full_name,
      status,
      parseFloat(winner.prize_amount)
    );

    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
