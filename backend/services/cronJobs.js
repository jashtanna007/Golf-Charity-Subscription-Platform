const cron = require("node-cron");
const { executeDraw, notifyDrawParticipants } = require("./drawEngine");
const { supabase } = require("../config/supabase");
const { generateRandomNumbers } = require("./drawEngine");

const initCronJobs = () => {
  cron.schedule("0 0 1 * *", async () => {
    console.log("[CRON] Starting monthly draw execution...");

    try {
      const { data: config } = await supabase
        .from("draws")
        .select("draw_type")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const drawType = config ? config.draw_type : "random";
      const result = await executeDraw(drawType);

      console.log(`[CRON] Draw completed. Winners: ${result.winners.length}`);

      await notifyDrawParticipants(result.drawId);
      console.log("[CRON] All participants notified.");
    } catch (error) {
      console.error("[CRON] Draw execution failed:", error.message);
    }
  });

  cron.schedule("0 0 25 * *", async () => {
    console.log("[CRON] Creating next month's draw entry window...");

    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const drawDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;

      await supabase.from("draws").insert({
        draw_date: drawDate,
        status: "pending",
        draw_type: "random",
      });

      console.log(`[CRON] Draw created for ${drawDate}`);
    } catch (error) {
      console.error("[CRON] Draw creation failed:", error.message);
    }
  });

  console.log("[CRON] Scheduled monthly draw on 1st of each month at midnight");
  console.log("[CRON] Scheduled draw window creation on 25th of each month");
};

module.exports = { initCronJobs };
