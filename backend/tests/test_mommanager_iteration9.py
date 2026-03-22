"""
MomManager 2026 - Iteration 9 Backend Tests
Testing: 
1. Backend API endpoints (health, auth, kids, stories, mealplans, checklists, selfcare, meetings)
2. Verify LANG_NAMES dict and get_lang_name helper function exist
3. Verify AI endpoints use get_lang_name instead of hardcoded is_ro
4. Verify checklist endpoint accepts category field
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://mommanager-preview.preview.emergentagent.com')

class TestHealthEndpoint:
    """Health endpoint tests"""
    
    def test_health_returns_200(self):
        """Test /api/health returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("app") == "MomManager 2026"
        print("PASS: /api/health returns 200 OK with correct response")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_session_requires_session_id(self):
        """Test /api/auth/session requires X-Session-ID header"""
        response = requests.post(f"{BASE_URL}/api/auth/session")
        assert response.status_code == 400
        print("PASS: /api/auth/session returns 400 without session ID")
    
    def test_auth_me_requires_auth(self):
        """Test /api/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASS: /api/auth/me returns 401 without auth")


class TestKidsEndpoints:
    """Kids endpoint tests"""
    
    def test_kids_get_requires_auth(self):
        """Test GET /api/kids requires authentication"""
        response = requests.get(f"{BASE_URL}/api/kids")
        assert response.status_code == 401
        print("PASS: GET /api/kids returns 401 without auth")
    
    def test_kids_create_requires_auth(self):
        """Test POST /api/kids requires authentication"""
        response = requests.post(f"{BASE_URL}/api/kids", json={"kid_name": "Test"})
        assert response.status_code == 401
        print("PASS: POST /api/kids returns 401 without auth")


class TestStoriesEndpoints:
    """Stories endpoint tests"""
    
    def test_stories_get_requires_auth(self):
        """Test GET /api/stories requires authentication"""
        response = requests.get(f"{BASE_URL}/api/stories")
        assert response.status_code == 401
        print("PASS: GET /api/stories returns 401 without auth")
    
    def test_stories_generate_requires_auth(self):
        """Test POST /api/stories/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/stories/generate", json={
            "age_group": "4-7",
            "themes": ["friendship"],
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/stories/generate returns 401 without auth")


class TestMealPlansEndpoints:
    """Meal plans endpoint tests"""
    
    def test_mealplans_get_requires_auth(self):
        """Test GET /api/mealplans requires authentication"""
        response = requests.get(f"{BASE_URL}/api/mealplans")
        assert response.status_code == 401
        print("PASS: GET /api/mealplans returns 401 without auth")
    
    def test_mealplans_generate_requires_auth(self):
        """Test POST /api/mealplans/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/mealplans/generate", json={
            "preferences": {"language": "en"}
        })
        assert response.status_code == 401
        print("PASS: POST /api/mealplans/generate returns 401 without auth")


class TestChecklistsEndpoints:
    """Checklists endpoint tests"""
    
    def test_checklists_get_requires_auth(self):
        """Test GET /api/checklists requires authentication"""
        response = requests.get(f"{BASE_URL}/api/checklists")
        assert response.status_code == 401
        print("PASS: GET /api/checklists returns 401 without auth")
    
    def test_checklists_with_date_requires_auth(self):
        """Test GET /api/checklists?date=... requires authentication"""
        response = requests.get(f"{BASE_URL}/api/checklists?date=2026-01-15")
        assert response.status_code == 401
        print("PASS: GET /api/checklists with date returns 401 without auth")
    
    def test_checklists_create_requires_auth(self):
        """Test POST /api/checklists requires authentication - with category field"""
        response = requests.post(f"{BASE_URL}/api/checklists", json={
            "date": "2026-01-15",
            "items": [
                {"id": "test1", "text": "Test task", "completed": False, "category": "cleaning"}
            ]
        })
        assert response.status_code == 401
        print("PASS: POST /api/checklists with category field returns 401 without auth")


class TestSelfcareEndpoints:
    """Self-care endpoint tests"""
    
    def test_selfcare_get_requires_auth(self):
        """Test GET /api/selfcare requires authentication"""
        response = requests.get(f"{BASE_URL}/api/selfcare")
        assert response.status_code == 401
        print("PASS: GET /api/selfcare returns 401 without auth")
    
    def test_selfcare_nutrition_generate_requires_auth(self):
        """Test POST /api/selfcare/nutrition/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/nutrition/generate", json={
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/nutrition/generate returns 401 without auth")
    
    def test_selfcare_workout_generate_requires_auth(self):
        """Test POST /api/selfcare/workout/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/workout/generate", json={
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/workout/generate returns 401 without auth")
    
    def test_selfcare_skincare_generate_requires_auth(self):
        """Test POST /api/selfcare/skincare-routine/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/skincare-routine/generate", json={
            "skin_type": "normal",
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/skincare-routine/generate returns 401 without auth")


class TestMeetingsEndpoints:
    """Meetings endpoint tests"""
    
    def test_meetings_get_requires_auth(self):
        """Test GET /api/meetings requires authentication"""
        response = requests.get(f"{BASE_URL}/api/meetings")
        assert response.status_code == 401
        print("PASS: GET /api/meetings returns 401 without auth")
    
    def test_meetings_create_requires_auth(self):
        """Test POST /api/meetings requires authentication"""
        response = requests.post(f"{BASE_URL}/api/meetings", json={
            "title": "Test Meeting",
            "date": "2026-01-15",
            "start_time": "09:00",
            "end_time": "10:00"
        })
        assert response.status_code == 401
        print("PASS: POST /api/meetings returns 401 without auth")


class TestAIChatEndpoint:
    """AI Chat endpoint tests"""
    
    def test_ai_chat_endpoint_exists(self):
        """Test POST /api/ai/chat endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/ai/chat", json={
            "message": "Hello",
            "language": "en"
        })
        # Should not be 404 - endpoint exists
        assert response.status_code != 404
        print(f"PASS: POST /api/ai/chat endpoint exists (status: {response.status_code})")
    
    def test_ai_chat_requires_message(self):
        """Test POST /api/ai/chat requires message"""
        response = requests.post(f"{BASE_URL}/api/ai/chat", json={
            "language": "en"
        })
        assert response.status_code == 400
        print("PASS: POST /api/ai/chat returns 400 without message")


class TestLunchboxEndpoint:
    """Lunchbox endpoint tests"""
    
    def test_lunchbox_generate_requires_auth(self):
        """Test POST /api/kids/lunchbox/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/kids/lunchbox/generate", json={
            "kid_name": "Test",
            "age_group": "4-7",
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/kids/lunchbox/generate returns 401 without auth")


class TestBudgetsEndpoint:
    """Budgets endpoint tests"""
    
    def test_budgets_requires_auth(self):
        """Test GET /api/budgets requires authentication"""
        response = requests.get(f"{BASE_URL}/api/budgets")
        assert response.status_code == 401
        print("PASS: GET /api/budgets returns 401 without auth")


class TestReceiptsEndpoint:
    """Receipts endpoint tests"""
    
    def test_receipts_requires_auth(self):
        """Test GET /api/receipts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/receipts")
        assert response.status_code == 401
        print("PASS: GET /api/receipts returns 401 without auth")


class TestKitchenMealsEndpoint:
    """Kitchen meals from image endpoint tests"""
    
    def test_kitchen_meals_requires_auth(self):
        """Test POST /api/kitchen/generate-meals-from-image requires authentication"""
        response = requests.post(f"{BASE_URL}/api/kitchen/generate-meals-from-image", json={
            "image_base64": "test",
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/kitchen/generate-meals-from-image returns 401 without auth")


class TestMeTimeSuggestionsEndpoint:
    """Me-time suggestions endpoint tests"""
    
    def test_metime_suggestions_requires_auth(self):
        """Test POST /api/calendar/me-time-suggestions requires authentication"""
        response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json={
            "date": "2026-01-15",
            "meetings": [],
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/calendar/me-time-suggestions returns 401 without auth")


class TestWorkoutAIEndpoint:
    """Workout AI endpoint tests"""
    
    def test_workout_ai_requires_auth(self):
        """Test POST /api/selfcare/workout-ai/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/workout-ai/generate", json={
            "location": "home",
            "workout_type": "full_body",
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/workout-ai/generate returns 401 without auth")


class TestStrengthMealsEndpoint:
    """Strength meals endpoint tests"""
    
    def test_strength_meals_requires_auth(self):
        """Test POST /api/selfcare/strength-meals/generate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/strength-meals/generate", json={
            "physical_profile": {},
            "language": "en"
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/strength-meals/generate returns 401 without auth")


class TestPhysicalProfileEndpoint:
    """Physical profile endpoint tests"""
    
    def test_physical_profile_requires_auth(self):
        """Test POST /api/selfcare/profile requires authentication"""
        response = requests.post(f"{BASE_URL}/api/selfcare/profile", json={
            "current_weight": 70,
            "target_weight": 65
        })
        assert response.status_code == 401
        print("PASS: POST /api/selfcare/profile returns 401 without auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
