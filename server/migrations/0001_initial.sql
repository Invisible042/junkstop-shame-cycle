-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "display_name" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create junk_food_logs table
CREATE TABLE IF NOT EXISTS "junk_food_logs" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "photo_url" TEXT NOT NULL,
  "guilt_rating" INTEGER NOT NULL,
  "regret_rating" INTEGER NOT NULL,
  "estimated_calories" INTEGER NOT NULL,
  "estimated_cost" DECIMAL(10,2),
  "location" TEXT,
  "ai_message" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create confessions table
CREATE TABLE IF NOT EXISTS "confessions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "text" TEXT NOT NULL,
  "anonymous" TEXT DEFAULT 'true',
  "likes" INTEGER DEFAULT 0,
  "replies" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS "user_streaks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "current_streak" INTEGER DEFAULT 0,
  "best_streak" INTEGER DEFAULT 0,
  "last_junk_food_date" TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_junk_food_logs_user_id" ON "junk_food_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_junk_food_logs_created_at" ON "junk_food_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_confessions_created_at" ON "confessions"("created_at");
CREATE INDEX IF NOT EXISTS "idx_user_streaks_user_id" ON "user_streaks"("user_id");