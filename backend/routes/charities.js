const express = require("express");
const { supabase } = require("../config/supabase");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, featured, search } = req.query;

    let query = supabase.from("charities").select("*");

    if (category) {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: charities, error } = await query.order("name");

    if (error) {
      return res.status(500).json({ error: "Failed to fetch charities" });
    }

    res.json({ charities });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { data: charities } = await supabase
      .from("charities")
      .select("category");

    const categories = [...new Set(charities.map((c) => c.category).filter(Boolean))];

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: charity, error } = await supabase
      .from("charities")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !charity) {
      return res.status(404).json({ error: "Charity not found" });
    }

    res.json({ charity });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const { authenticateToken } = require("../middleware/auth");

router.put("/support", authenticateToken, async (req, res) => {
  try {
    const { charityId } = req.body;

    if (!charityId) {
      return res.status(400).json({ error: "Charity ID is required" });
    }

    const { data: charity } = await supabase
      .from("charities")
      .select("id, name")
      .eq("id", charityId)
      .single();

    if (!charity) {
      return res.status(404).json({ error: "Charity not found" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .update({ charity_id: charityId })
      .eq("id", req.user.id)
      .select("id, email, full_name, charity_id, charity_percentage")
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update charity preference" });
    }

    console.log("[CHARITY] User", user.email, "now supports:", charity.name);

    res.json({ user, charity });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
