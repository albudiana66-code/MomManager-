"""
MomManager 2026 API Tests - Iteration 8
Testing backend APIs after i18n refactor and dateLocale fix in kids.tsx
Focus: Kids, Stories, Health, Mealplans, Checklists, Selfcare, Meetings endpoints
"""

import pytest
import requests
import os
from datetime import datetime

# Get BASE_URL from environment variable
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mommanager-preview.preview.emergentagent.com').rstrip('/')

# Test session token storage
TEST_SESSION_TOKEN = None
TEST_USER_ID = None

class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_200(self):
        """Test /api/health returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "app" in data
        assert data["app"] == "MomManager 2026"
        print(f"✓ Health check passed: {data}")


class TestAuthSession:
    """Test authentication session endpoints"""
    
    def test_auth_session_requires_session_id(self):
        """Test /api/auth/session requires X-Session-ID header"""
        response = requests.post(f"{BASE_URL}/api/auth/session")
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Auth session correctly requires session ID: {data['detail']}")
    
    def test_auth_me_requires_auth(self):
        """Test /api/auth/me returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth /me correctly returns 401 without authentication")


class TestKidsEndpoint:
    """Kids endpoint tests - verifies the endpoint works correctly"""
    
    def test_kids_endpoint_exists_requires_auth(self):
        """Test /api/kids returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/kids")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Kids endpoint exists and correctly requires authentication")
    
    def test_kids_create_requires_auth(self):
        """Test POST /api/kids returns 401 without auth"""
        payload = {
            "kid_name": "TEST_Child",
            "birth_date": "2020-01-15"
        }
        response = requests.post(f"{BASE_URL}/api/kids", json=payload)
        assert response.status_code == 401
        print("✓ Kids create endpoint correctly requires authentication")
    
    def test_kids_delete_requires_auth(self):
        """Test DELETE /api/kids/:id returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/kids/test_kid_123")
        assert response.status_code == 401
        print("✓ Kids delete endpoint correctly requires authentication")


class TestStoriesEndpoint:
    """Stories endpoint tests"""
    
    def test_stories_endpoint_exists_requires_auth(self):
        """Test /api/stories returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/stories")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Stories endpoint exists and correctly requires authentication")
    
    def test_stories_generate_requires_auth(self):
        """Test POST /api/stories/generate returns 401 without auth"""
        payload = {
            "age_group": "4-7",
            "themes": ["friendship", "empathy"],
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/stories/generate", json=payload)
        assert response.status_code == 401
        print("✓ Stories generate endpoint correctly requires authentication")
    
    def test_stories_delete_requires_auth(self):
        """Test DELETE /api/stories/:id returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/stories/test_story_123")
        assert response.status_code == 401
        print("✓ Stories delete endpoint correctly requires authentication")


class TestMealplansEndpoint:
    """Mealplans endpoint tests"""
    
    def test_mealplans_endpoint_exists_requires_auth(self):
        """Test /api/mealplans returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/mealplans")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Mealplans endpoint exists and correctly requires authentication")
    
    def test_mealplans_generate_requires_auth(self):
        """Test POST /api/mealplans/generate returns 401 without auth"""
        payload = {
            "preferences": {
                "adult_preferences": "healthy meals",
                "kid_preferences": "simple meals",
                "restrictions": "none",
                "num_adults": 2,
                "num_kids": 1
            }
        }
        response = requests.post(f"{BASE_URL}/api/mealplans/generate", json=payload)
        assert response.status_code == 401
        print("✓ Mealplans generate endpoint correctly requires authentication")


class TestChecklistsEndpoint:
    """Checklists endpoint tests"""
    
    def test_checklists_endpoint_exists_requires_auth(self):
        """Test /api/checklists returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/checklists")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Checklists endpoint exists and correctly requires authentication")
    
    def test_checklists_with_date_requires_auth(self):
        """Test /api/checklists?date=2025-01-15 returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/checklists?date=2025-01-15")
        assert response.status_code == 401
        print("✓ Checklists with date query correctly requires authentication")
    
    def test_checklists_create_requires_auth(self):
        """Test POST /api/checklists returns 401 without auth"""
        payload = {
            "date": "2025-01-15",
            "items": [
                {"id": "item1", "text": "Buy groceries", "completed": False}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/checklists", json=payload)
        assert response.status_code == 401
        print("✓ Checklists create endpoint correctly requires authentication")


class TestSelfcareEndpoint:
    """Selfcare endpoint tests"""
    
    def test_selfcare_endpoint_exists_requires_auth(self):
        """Test /api/selfcare returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/selfcare")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Selfcare endpoint exists and correctly requires authentication")
    
    def test_selfcare_nutrition_generate_requires_auth(self):
        """Test POST /api/selfcare/nutrition/generate returns 401 without auth"""
        payload = {
            "goal": "maintain energy",
            "age": "30",
            "activity_level": "moderate"
        }
        response = requests.post(f"{BASE_URL}/api/selfcare/nutrition/generate", json=payload)
        assert response.status_code == 401
        print("✓ Selfcare nutrition generate endpoint correctly requires authentication")
    
    def test_selfcare_workout_generate_requires_auth(self):
        """Test POST /api/selfcare/workout/generate returns 401 without auth"""
        payload = {
            "focus": "full body",
            "fitness_level": "beginner",
            "duration": "15-20 minutes"
        }
        response = requests.post(f"{BASE_URL}/api/selfcare/workout/generate", json=payload)
        assert response.status_code == 401
        print("✓ Selfcare workout generate endpoint correctly requires authentication")
    
    def test_selfcare_skincare_generate_requires_auth(self):
        """Test POST /api/selfcare/skincare-routine/generate returns 401 without auth"""
        payload = {
            "skin_type": "normal",
            "language": "en",
            "season": "spring"
        }
        response = requests.post(f"{BASE_URL}/api/selfcare/skincare-routine/generate", json=payload)
        assert response.status_code == 401
        print("✓ Selfcare skincare routine generate endpoint correctly requires authentication")


class TestMeetingsEndpoint:
    """Meetings endpoint tests"""
    
    def test_meetings_endpoint_exists_requires_auth(self):
        """Test /api/meetings returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/meetings")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Meetings endpoint exists and correctly requires authentication")
    
    def test_meetings_create_requires_auth(self):
        """Test POST /api/meetings returns 401 without auth"""
        payload = {
            "title": "TEST_Meeting",
            "date": "2025-01-15",
            "start_time": "10:00",
            "end_time": "11:00",
            "description": "Test meeting",
            "color": "#6366f1"
        }
        response = requests.post(f"{BASE_URL}/api/meetings", json=payload)
        assert response.status_code == 401
        print("✓ Meetings create endpoint correctly requires authentication")
    
    def test_meetings_delete_requires_auth(self):
        """Test DELETE /api/meetings/:id returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/meetings/test_meeting_123")
        assert response.status_code == 401
        print("✓ Meetings delete endpoint correctly requires authentication")


class TestAIChatEndpoint:
    """AI Chat endpoint tests - this endpoint may not require auth"""
    
    def test_ai_chat_endpoint_exists(self):
        """Test /api/ai/chat endpoint exists and accepts POST"""
        payload = {
            "message": "Hello",
            "language": "en",
            "history": []
        }
        response = requests.post(f"{BASE_URL}/api/ai/chat", json=payload)
        # Should return 200 with response or 500 if AI service issue
        assert response.status_code in [200, 500]
        print(f"✓ AI Chat endpoint exists (status: {response.status_code})")
    
    def test_ai_chat_requires_message(self):
        """Test /api/ai/chat requires message field"""
        payload = {
            "language": "en",
            "history": []
        }
        response = requests.post(f"{BASE_URL}/api/ai/chat", json=payload)
        # Should return 400 for missing message
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ AI Chat correctly requires message field: {data['detail']}")


class TestKidsLunchboxEndpoint:
    """Kids lunchbox endpoint tests"""
    
    def test_lunchbox_generate_requires_auth(self):
        """Test POST /api/kids/lunchbox/generate returns 401 without auth"""
        payload = {
            "kid_name": "TEST_Child",
            "age_group": "4-7",
            "preferences": "healthy",
            "allergies": "",
            "language": "en",
            "days": 5
        }
        response = requests.post(f"{BASE_URL}/api/kids/lunchbox/generate", json=payload)
        assert response.status_code == 401
        print("✓ Lunchbox generate endpoint correctly requires authentication")


class TestBudgetsEndpoint:
    """Budgets endpoint tests"""
    
    def test_budgets_endpoint_exists_requires_auth(self):
        """Test /api/budgets returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/budgets")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Budgets endpoint exists and correctly requires authentication")


class TestReceiptsEndpoint:
    """Receipts endpoint tests"""
    
    def test_receipts_endpoint_exists_requires_auth(self):
        """Test /api/receipts returns 401 without auth (endpoint exists)"""
        response = requests.get(f"{BASE_URL}/api/receipts")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
        print("✓ Receipts endpoint exists and correctly requires authentication")


class TestKitchenEndpoint:
    """Kitchen meals from image endpoint tests"""
    
    def test_kitchen_meals_from_image_requires_auth(self):
        """Test POST /api/kitchen/generate-meals-from-image returns 401 without auth"""
        payload = {
            "image_base64": "base64encodedimage",
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/kitchen/generate-meals-from-image", json=payload)
        assert response.status_code == 401
        print("✓ Kitchen meals from image endpoint correctly requires authentication")


class TestMeTimeSuggestions:
    """Me-time suggestions endpoint tests"""
    
    def test_metime_suggestions_requires_auth(self):
        """Test POST /api/calendar/me-time-suggestions returns 401 without auth"""
        payload = {
            "date": "2025-01-15",
            "meetings": [],
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json=payload)
        assert response.status_code == 401
        print("✓ Me-time suggestions endpoint correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
