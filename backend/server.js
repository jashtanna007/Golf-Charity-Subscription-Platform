require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initCronJobs } = require("./services/cronJobs");

const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/scores");
const drawRoutes = require("./routes/draws");
const charityRoutes = require("./routes/charities");
const subscriptionRoutes = require("./routes/subscriptions");
const winnerRoutes = require("./routes/winners");
const adminRoutes = require("./routes/admin");
const webhookRoutes = require("./routes/webhooks");

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/webhooks/stripe", webhookRoutes);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://golf-charity-subscription-platform-theta-two.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initCronJobs();
});

module.exports = app;
