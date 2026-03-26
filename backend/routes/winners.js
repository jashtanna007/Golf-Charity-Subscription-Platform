const express = require("express");
const multer = require("multer");
const path = require("path");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");
const { sendWinnerVerificationUpdate } = require("../services/emailService");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: winners, error } = await supabase
      .from("winners")
      .select("*, draws(draw_date, winning_numbers)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    res.json({ winners: winners || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/upload-proof", authenticateToken, upload.single("proof"), async (req, res) => {
  try {
    const { winnerId } = req.body;

    if (!winnerId || !req.file) {
      return res.status(400).json({ error: "Winner ID and proof screenshot are required" });
    }

    const { data: winner } = await supabase
      .from("winners")
      .select("user_id")
      .eq("id", winnerId)
      .single();

    if (!winner || winner.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to upload proof for this entry" });
    }

    const proofUrl = `/uploads/${req.file.filename}`;

    const { error } = await supabase
      .from("winners")
      .update({
        proof_screenshot_url: proofUrl,
        verification_status: "pending",
      })
      .eq("id", winnerId);

    if (error) {
      return res.status(500).json({ error: "Failed to upload proof" });
    }

    res.json({ message: "Proof uploaded successfully", proofUrl });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const { data: winners } = await supabase
      .from("winners")
      .select("prize_amount, payment_status")
      .eq("user_id", req.user.id);

    const totalWon = (winners || []).reduce(
      (sum, w) => sum + parseFloat(w.prize_amount),
      0
    );

    const pendingPayments = (winners || []).filter(
      (w) => w.payment_status === "pending"
    ).length;

    const paidPayments = (winners || []).filter(
      (w) => w.payment_status === "paid"
    ).length;

    res.json({
      totalWon,
      totalWins: (winners || []).length,
      pendingPayments,
      paidPayments,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
