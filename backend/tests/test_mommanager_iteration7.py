"""
MomManager 2026 - Iteration 7 Backend Tests
Tests for: Health endpoint, API availability
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mommanager-ai.preview.emergentagent.com').rstrip('/')

class TestHealthEndpoint:
    """Test /api/health endpoint"""
    
    def test_health_returns_200(self):
        """GET /api/health should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "MomManager 2026"


class TestCoreEndpoints:
    """Test core API endpoints existence"""
    
    def test_meetings_endpoint_exists(self):
        """GET /api/meetings should exist"""
        response = requests.get(f"{BASE_URL}/api/meetings")
        # Should return 200 or 401 (auth required), not 404
        assert response.status_code in [200, 401]
    
    def test_kids_endpoint_exists(self):
        """GET /api/kids should exist"""
        response = requests.get(f"{BASE_URL}/api/kids")
        assert response.status_code in [200, 401]
    
    def test_stories_endpoint_exists(self):
        """GET /api/stories should exist"""
        response = requests.get(f"{BASE_URL}/api/stories")
        assert response.status_code in [200, 401]
    
    def test_checklists_endpoint_exists(self):
        """GET /api/checklists should exist"""
        response = requests.get(f"{BASE_URL}/api/checklists")
        assert response.status_code in [200, 401]
    
    def test_budgets_endpoint_exists(self):
        """GET /api/budgets should exist"""
        response = requests.get(f"{BASE_URL}/api/budgets")
        assert response.status_code in [200, 401]
    
    def test_receipts_endpoint_exists(self):
        """GET /api/receipts should exist"""
        response = requests.get(f"{BASE_URL}/api/receipts")
        assert response.status_code in [200, 401]


class TestAIEndpoints:
    """Test AI endpoints availability"""
    
    def test_ai_chat_endpoint_exists(self):
        """POST /api/ai/chat should exist"""
        response = requests.post(f"{BASE_URL}/api/ai/chat", json={
            "message": "test",
            "language": "en"
        })
        # Should not return 404
        assert response.status_code != 404
    
    def test_story_generate_endpoint_exists(self):
        """POST /api/stories/generate should exist"""
        response = requests.post(f"{BASE_URL}/api/stories/generate", json={
            "age_group": "1-4",
            "themes": ["joy"],
            "language": "en"
        })
        # Should not return 404
        assert response.status_code != 404
    
    def test_metime_suggestions_endpoint_exists(self):
        """POST /api/calendar/me-time-suggestions should exist"""
        response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json={
            "date": "2026-01-15",
            "meetings": [],
            "language": "en"
        })
        # Should not return 404
        assert response.status_code != 404
    
    def test_skincare_routine_endpoint_exists(self):
        """POST /api/selfcare/skincare-routine/generate should exist"""
        response = requests.post(f"{BASE_URL}/api/selfcare/skincare-routine/generate", json={
            "skin_type": "normal",
            "season": "spring",
            "language": "en"
        })
        # Should not return 404
        assert response.status_code != 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
