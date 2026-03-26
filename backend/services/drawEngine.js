const { supabase } = require("../config/supabase");
const { sendDrawResults } = require("./emailService");

const generateRandomNumbers = (count, max) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateAlgorithmicNumbers = async (count, max) => {
  const { data: allScores } = await supabase
    .from("scores")
    .select("score");

  if (!allScores || allScores.length === 0) {
    return generateRandomNumbers(count, max);
  }

  const frequency = {};
  allScores.forEach(({ score }) => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  const weighted = [];
  for (let i = 1; i <= max; i++) {
    const freq = frequency[i] || 0;
    const weight = Math.max(1, allScores.length - freq);
    for (let j = 0; j < weight; j++) {
      weighted.push(i);
    }
  }

  const numbers = new Set();
  while (numbers.size < count) {
    const idx = Math.floor(Math.random() * weighted.length);
    numbers.add(weighted[idx]);
  }

  return Array.from(numbers).sort((a, b) => a - b);
};

const calculateMatches = (entryNumbers, winningNumbers) => {
  return entryNumbers.filter((n) => winningNumbers.includes(n)).length;
};

const POOL_DISTRIBUTION = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
};

const executeDraw = async (drawType = "random") => {
  const winningNumbers =
    drawType === "algorithmic"
      ? await generateAlgorithmicNumbers(5, 45)
      : generateRandomNumbers(5, 45);

  const { data: existingDraw } = await supabase
    .from("draws")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let drawId;
  const drawDate = new Date().toISOString().split("T")[0];

  if (existingDraw) {
    drawId = existingDraw.id;
    await supabase
      .from("draws")
      .update({
        winning_numbers: winningNumbers,
        draw_type: drawType,
        status: "completed",
      })
      .eq("id", drawId);
  } else {
    const { data: newDraw } = await supabase
      .from("draws")
      .insert({
        draw_date: drawDate,
        winning_numbers: winningNumbers,
        draw_type: drawType,
        status: "completed",
      })
      .select()
      .single();
    drawId = newDraw.id;
  }

  const { data: entries } = await supabase
    .from("draw_entries")
    .select("id, user_id, entry_numbers")
    .eq("draw_id", drawId);

  if (!entries || entries.length === 0) {
    return { drawId, winningNumbers, winners: [] };
  }

  const { data: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, amount")
    .eq("status", "active");

  const totalPool =
    (activeSubscriptions || []).reduce((sum, sub) => sum + parseFloat(sub.amount), 0) * 0.5;

  const { data: previousDraw } = await supabase
    .from("draws")
    .select("jackpot_rollover")
    .neq("id", drawId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const rollover = previousDraw ? parseFloat(previousDraw.jackpot_rollover || 0) : 0;

  const winnersByTier = { 5: [], 4: [], 3: [] };

  for (const entry of entries) {
    const matchCount = calculateMatches(entry.entry_numbers, winningNumbers);
    if (matchCount >= 3) {
      winnersByTier[matchCount].push(entry);
    }
  }

  const allWinners = [];
  let newRollover = 0;

  for (const tier of [5, 4, 3]) {
    const tierEntries = winnersByTier[tier];
    let tierPool = totalPool * POOL_DISTRIBUTION[tier];

    if (tier === 5) {
      tierPool += rollover;
    }

    if (tierEntries.length === 0) {
      if (tier === 5) {
        newRollover = tierPool;
      }
      continue;
    }

    const prizePerWinner = tierPool / tierEntries.length;

    for (const entry of tierEntries) {
      const { data: winner } = await supabase
        .from("winners")
        .insert({
          draw_id: drawId,
          user_id: entry.user_id,
          match_count: tier.toString(),
          prize_amount: prizePerWinner,
        })
        .select()
        .single();
      allWinners.push(winner);
    }
  }

  await supabase
    .from("draws")
    .update({
      total_prize_pool: totalPool + rollover,
      jackpot_rollover: newRollover,
    })
    .eq("id", drawId);

  return { drawId, winningNumbers, winners: allWinners, totalPool: totalPool + rollover };
};

const notifyDrawParticipants = async (drawId) => {
  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  const { data: entries } = await supabase
    .from("draw_entries")
    .select("user_id")
    .eq("draw_id", drawId);

  const { data: winners } = await supabase
    .from("winners")
    .select("user_id, match_count, prize_amount")
    .eq("draw_id", drawId);

  const winnerUserIds = new Set((winners || []).map((w) => w.user_id));

  for (const entry of entries || []) {
    const { data: user } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", entry.user_id)
      .single();

    if (!user) continue;

    const isWinner = winnerUserIds.has(entry.user_id);
    const winnerRecord = isWinner
      ? winners.find((w) => w.user_id === entry.user_id)
      : null;

    await sendDrawResults(
      user.email,
      user.full_name,
      draw.draw_date,
      isWinner,
      isWinner ? parseInt(winnerRecord.match_count) : 0,
      isWinner ? parseFloat(winnerRecord.prize_amount) : 0
    );
  }
};

module.exports = {
  executeDraw,
  notifyDrawParticipants,
  generateRandomNumbers,
};
