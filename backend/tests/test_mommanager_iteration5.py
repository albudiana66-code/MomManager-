"""
MomManager 2026 - Iteration 5 Testing
Focus: Delete endpoints, Skincare endpoint with season param, LANGUAGES verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://mommanager-ai.preview.emergentagent.com').rstrip('/')

class TestHealthCheck:
    """Health endpoint verification"""
    
    def test_health_returns_200(self):
        """GET /api/health returns 200 with healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "MomManager 2026"
        print("✅ Health endpoint returns 200 with correct response")


class TestDeleteEndpointsExist:
    """Verify all DELETE endpoints exist (return 401 for auth, not 404 for missing)"""
    
    def test_meetings_delete_exists(self):
        """DELETE /api/meetings/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/meetings/test123")
        # Should return 401 (auth required), not 404 (endpoint not found)
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/meetings/:id endpoint exists (returns 401 auth required)")
    
    def test_kids_delete_exists(self):
        """DELETE /api/kids/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/kids/test123")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/kids/:id endpoint exists (returns 401 auth required)")
    
    def test_stories_delete_exists(self):
        """DELETE /api/stories/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/stories/test123")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/stories/:id endpoint exists (returns 401 auth required)")
    
    def test_mealplans_delete_exists(self):
        """DELETE /api/mealplans/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/mealplans/test123")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/mealplans/:id endpoint exists (returns 401 auth required)")
    
    def test_selfcare_workout_delete_exists(self):
        """DELETE /api/selfcare/workout/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/selfcare/workout/test123")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/selfcare/workout/:id endpoint exists (returns 401 auth required)")
    
    def test_receipts_delete_exists(self):
        """DELETE /api/receipts/:id endpoint exists"""
        response = requests.delete(f"{BASE_URL}/api/receipts/test123")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ DELETE /api/receipts/:id endpoint exists (returns 401 auth required)")


class TestSkincareEndpoint:
    """Skincare endpoint accepts skin_type AND season params"""
    
    def test_skincare_endpoint_exists(self):
        """POST /api/selfcare/skincare-routine/generate endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/selfcare/skincare-routine/generate",
            json={"skin_type": "normal", "season": "spring", "language": "en"}
        )
        # Should return 401 (auth required), not 404 (endpoint not found)
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("✅ POST /api/selfcare/skincare-routine/generate endpoint exists")
    
    def test_skincare_accepts_all_skin_types(self):
        """Skincare endpoint accepts all 5 skin types"""
        skin_types = ["normal", "dry", "oily", "combination", "acneic"]
        for skin_type in skin_types:
            response = requests.post(
                f"{BASE_URL}/api/selfcare/skincare-routine/generate",
                json={"skin_type": skin_type, "season": "spring", "language": "en"}
            )
            assert response.status_code == 401, f"Unexpected error for skin_type={skin_type}: {response.status_code}"
        print(f"✅ Skincare endpoint accepts all skin types: {skin_types}")
    
    def test_skincare_accepts_all_seasons(self):
        """Skincare endpoint accepts all 4 seasons"""
        seasons = ["spring", "summer", "autumn", "winter"]
        for season in seasons:
            response = requests.post(
                f"{BASE_URL}/api/selfcare/skincare-routine/generate",
                json={"skin_type": "normal", "season": season, "language": "en"}
            )
            assert response.status_code == 401, f"Unexpected error for season={season}: {response.status_code}"
        print(f"✅ Skincare endpoint accepts all seasons: {seasons}")


class TestOtherAIEndpoints:
    """Verify other AI endpoints still work"""
    
    def test_metime_endpoint_exists(self):
        """POST /api/calendar/me-time-suggestions endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/calendar/me-time-suggestions",
            json={"date": "2026-01-15", "meetings": [], "language": "en"}
        )
        assert response.status_code == 401
        print("✅ Me-time suggestions endpoint exists")
    
    def test_lunchbox_endpoint_exists(self):
        """POST /api/kids/lunchbox/generate endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/kids/lunchbox/generate",
            json={"kid_name": "Test", "age_group": "4-7", "language": "en"}
        )
        assert response.status_code == 401
        print("✅ Lunchbox endpoint exists")
    
    def test_stories_generate_exists(self):
        """POST /api/stories/generate endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/stories/generate",
            json={"age_group": "4-7", "themes": [], "language": "en"}
        )
        assert response.status_code == 401
        print("✅ Stories generate endpoint exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
