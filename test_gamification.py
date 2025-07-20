#!/usr/bin/env python3
"""
Test script for JunkStop gamification system
Use this to quickly test badge unlocks and progress without waiting days
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"

def login_user():
    """Login and get access token"""
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def test_gamification_endpoints():
    """Test all gamification endpoints"""
    token = login_user()
    if not token:
        print("Failed to login. Please create a test user first.")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🎮 Testing JunkStop Gamification System")
    print("=" * 50)
    
    # 1. Reset user data
    print("\n1. Resetting user gamification data...")
    response = requests.get(f"{BASE_URL}/api/test/gamification/reset-user", headers=headers)
    print(f"Reset result: {response.json()}")
    
    # 2. Test streak achievements
    print("\n2. Testing streak achievements...")
    streak_tests = [1, 3, 7, 30, 100]
    
    for days in streak_tests:
        print(f"\n   Simulating {days} day streak...")
        response = requests.post(
            f"{BASE_URL}/api/test/gamification/simulate-streak", 
            json={"days": days}, 
            headers=headers
        )
        result = response.json()
        print(f"   Result: {result}")
        
        # Check achievements
        achievements_response = requests.get(f"{BASE_URL}/api/achievements", headers=headers)
        if achievements_response.status_code == 200:
            achievements = achievements_response.json()
            unlocked = [a for a in achievements if a.get("unlocked")]
            print(f"   Unlocked achievements: {len(unlocked)}")
            for achievement in unlocked:
                print(f"     - {achievement.get('title', 'Unknown')}")
        
        time.sleep(1)  # Small delay between requests
    
    # 3. Test log milestones
    print("\n3. Testing log milestones...")
    log_tests = [1, 10, 100]
    
    for count in log_tests:
        print(f"\n   Simulating {count} total logs...")
        response = requests.post(
            f"{BASE_URL}/api/test/gamification/simulate-logs", 
            json={"count": count}, 
            headers=headers
        )
        result = response.json()
        print(f"   Result: {result}")
        
        # Check achievements
        achievements_response = requests.get(f"{BASE_URL}/api/achievements", headers=headers)
        if achievements_response.status_code == 200:
            achievements = achievements_response.json()
            unlocked = [a for a in achievements if a.get("unlocked")]
            print(f"   Unlocked achievements: {len(unlocked)}")
            for achievement in unlocked:
                print(f"     - {achievement.get('title', 'Unknown')}")
        
        time.sleep(1)
    
    # 4. Test XP and leveling
    print("\n4. Testing XP and leveling...")
    xp_tests = [50, 100, 200, 500]
    
    for xp in xp_tests:
        print(f"\n   Adding {xp} XP...")
        response = requests.post(
            f"{BASE_URL}/api/test/gamification/add-xp", 
            json={"amount": xp}, 
            headers=headers
        )
        result = response.json()
        print(f"   Result: {result}")
        
        # Check user XP
        xp_response = requests.get(f"{BASE_URL}/api/user/xp", headers=headers)
        if xp_response.status_code == 200:
            xp_data = xp_response.json()
            print(f"   Current XP: {xp_data.get('xp', 0)}, Level: {xp_data.get('level', 1)}")
        
        time.sleep(1)
    
    # 5. Test manual achievement unlock
    print("\n5. Testing manual achievement unlock...")
    achievement_ids = ["first_day", "three_day_streak", "week_warrior"]
    
    for achievement_id in achievement_ids:
        print(f"\n   Manually unlocking achievement: {achievement_id}")
        response = requests.post(
            f"{BASE_URL}/api/test/gamification/unlock-achievement", 
            json={"achievement_id": achievement_id}, 
            headers=headers
        )
        result = response.json()
        print(f"   Result: {result}")
        
        time.sleep(1)
    
    print("\n" + "=" * 50)
    print("✅ Gamification testing complete!")
    print("\n📱 Now check your mobile app to see:")
    print("   - Next Badge Progress section in Progress screen")
    print("   - Updated achievements and progress bars")
    print("   - Level progression and XP")

def create_test_user():
    """Create a test user if it doesn't exist"""
    user_data = {
        "username": "testuser",
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    if response.status_code == 200:
        print("✅ Test user created successfully")
        return True
    elif "already exists" in response.text.lower():
        print("ℹ️  Test user already exists")
        return True
    else:
        print(f"❌ Failed to create test user: {response.text}")
        return False

if __name__ == "__main__":
    print("🚀 JunkStop Gamification Test Script")
    print("This script will test all gamification features quickly")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print("❌ Server is not responding properly")
            exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on localhost:5000")
        exit(1)
    
    # Create test user if needed
    if create_test_user():
        test_gamification_endpoints()
    else:
        print("❌ Cannot proceed without test user") 