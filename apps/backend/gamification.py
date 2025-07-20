from database import get_supabase_client
from datetime import datetime

class GamificationService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def get_achievements(self):
        return self.supabase.table("achievements").select("*").execute().data

    def get_user_achievements(self, user_id):
        return self.supabase.table("user_achievements").select("*").eq("user_id", user_id).execute().data

    def get_user_stats(self, user_id):
        user = self.supabase.table("users").select("*").eq("id", user_id).single().execute().data
        logs = self.supabase.table("junk_food_logs").select("*").eq("user_id", user_id).execute().data
        # Add more stats as needed
        return {"user": user, "logs": logs}

    def process_event(self, user_id, event_type, event_data=None):
        achievements = self.get_achievements()
        user_achievements = self.get_user_achievements(user_id)
        unlocked_ids = {ua["achievement_id"] for ua in user_achievements}
        stats = self.get_user_stats(user_id)
        newly_unlocked = []

        for ach in achievements:
            if ach["id"] in unlocked_ids:
                continue
            if self._should_unlock(ach, stats, event_type, event_data):
                self._unlock_achievement(user_id, ach)
                newly_unlocked.append(ach["id"])
        return newly_unlocked

    def _should_unlock(self, ach, stats, event_type, event_data):
        # Example: unlock milestone by log count
        if ach["badge_type"] == "milestone" and ach.get("max_progress") and len(stats["logs"]) >= ach["max_progress"]:
            return True
        # Add more logic for streaks, social, etc.
        return False

    def _unlock_achievement(self, user_id, ach):
        self.supabase.table("user_achievements").insert({
            "user_id": user_id,
            "achievement_id": ach["id"],
            "unlocked_at": datetime.utcnow().isoformat(),
            "progress": ach.get("max_progress", 1)
        }).execute()
        self.award_xp(user_id, ach["xp_reward"], reason=f"Achievement: {ach['badge_name']}")

    def award_xp(self, user_id, amount, reason=""):
        user = self.supabase.table("users").select("xp").eq("id", user_id).single().execute().data
        new_xp = (user["xp"] if user else 0) + amount
        new_level = self.calculate_level(new_xp)
        self.supabase.table("users").update({"xp": new_xp, "level": new_level}).eq("id", user_id).execute()

    def calculate_level(self, xp):
        level = 1
        xp_needed = 100
        while xp >= xp_needed:
            level += 1
            xp_needed = int(xp_needed * 1.2)
        return level 