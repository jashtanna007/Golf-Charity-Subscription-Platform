const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, charityId } = req.body;

    console.log("[SIGNUP] Attempt:", { email, fullName, charityId });

    if (!email || !password || !fullName) {
      console.log("[SIGNUP] Validation failed: missing fields");
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[SIGNUP] User lookup error:", lookupError);
      return res.status(500).json({ error: "Database error during user lookup: " + lookupError.message });
    }

    if (existingUser) {
      console.log("[SIGNUP] Email already registered:", email);
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        charity_id: charityId || null,
      })
      .select("id, email, full_name, role, charity_id, charity_percentage")
      .single();

    if (error) {
      console.error("[SIGNUP] Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to create user: " + error.message });
    }

    console.log("[SIGNUP] User created successfully:", user.id);
    const tokens = generateTokens(user.id);

    res.status(201).json({ user, ...tokens });
  } catch (error) {
    console.error("[SIGNUP] Unexpected error:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const tokens = generateTokens(user.id);

    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, ...tokens });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const tokens = generateTokens(decoded.userId);

    res.json(tokens);
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const { fullName, avatarUrl, charityId, charityPercentage } = req.body;

    const updates = {};
    if (fullName) updates.full_name = fullName;
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (charityId) updates.charity_id = charityId;
    if (charityPercentage && charityPercentage >= 10) {
      updates.charity_percentage = charityPercentage;
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.user.id)
      .select("id, email, full_name, role, charity_id, charity_percentage, avatar_url")
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", req.user.id)
      .single();

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await supabase
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", req.user.id);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
