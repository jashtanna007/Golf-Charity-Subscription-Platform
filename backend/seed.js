require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FIRST_NAMES = ["James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella"];
const LAST_NAMES = ["O'Brien", "Patel", "Kim", "Garcia", "Müller", "Singh", "Thompson", "Chen", "Williams", "Rossi"];

function randomScore() {
  return Math.floor(Math.random() * (42 - 18 + 1)) + 18;
}

function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split("T")[0];
}

async function seed() {
  console.log("🌱 Seeding database...\n");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  for (let i = 0; i < 10; i++) {
    const fullName = `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`;
    const email = `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase().replace(/[^a-z]/g, "")}@test.com`;

    console.log(`👤 Creating user: ${fullName} (${email})`);

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    let userId;

    if (existingUser) {
      console.log(`   ⚠️  User already exists, skipping creation`);
      userId = existingUser.id;
    } else {
      const { data: user, error } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
          role: "user",
          charity_percentage: 10 + Math.floor(Math.random() * 15),
        })
        .select("id")
        .single();

      if (error) {
        console.error(`   ❌ Failed to create user: ${error.message}`);
        continue;
      }
      userId = user.id;
    }

    const numScores = Math.floor(Math.random() * 4) + 2;
    const scores = [];

    for (let j = 0; j < numScores; j++) {
      scores.push({
        user_id: userId,
        score: randomScore(),
        played_date: randomDate(60),
      });
    }

    const { error: scoreError } = await supabase
      .from("scores")
      .insert(scores);

    if (scoreError) {
      console.error(`   ❌ Failed to insert scores: ${scoreError.message}`);
    } else {
      console.log(`   ✅ Added ${numScores} scores: [${scores.map(s => s.score).join(", ")}]`);
    }
  }

  console.log("\n🎉 Seeding complete! All 10 players created with random scores.");
  console.log("   Password for all test users: Password123!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
