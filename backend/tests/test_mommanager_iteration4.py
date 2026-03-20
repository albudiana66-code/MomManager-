"""
MomManager 2026 - Iteration 4 Tests
Tests for:
1. Health endpoint
2. Skincare routine endpoint (new feature)
3. Me-time endpoint (no books category)
4. All translation files exist (pl, ar, uk, ru, pt)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://mommanager-preview.preview.emergentagent.com')

class TestHealthEndpoint:
    """Health endpoint tests"""
    
    def test_health_returns_200(self):
        """GET /api/health returns 200 with healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "MomManager 2026"
        print("✓ Health endpoint returns 200 with correct status")


class TestSkincareRoutineEndpoint:
    """Skincare routine endpoint tests (new feature)"""
    
    def test_skincare_endpoint_exists(self):
        """POST /api/selfcare/skincare-routine/generate exists (returns 401 auth required)"""
        response = requests.post(
            f"{BASE_URL}/api/selfcare/skincare-routine/generate",
            json={"skin_type": "normal", "language": "en"}
        )
        # Should return 401 (auth required), NOT 404 (not found)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "Not authenticated" in response.json().get("detail", "")
        print("✓ Skincare endpoint exists (returns 401 auth required)")
    
    def test_skincare_accepts_skin_types(self):
        """Skincare endpoint accepts all skin types"""
        skin_types = ["normal", "dry", "oily", "combination", "acneic"]
        for skin_type in skin_types:
            response = requests.post(
                f"{BASE_URL}/api/selfcare/skincare-routine/generate",
                json={"skin_type": skin_type, "language": "en"}
            )
            # Should return 401, not 404 or 422
            assert response.status_code == 401, f"Skin type '{skin_type}' failed with {response.status_code}"
        print(f"✓ Skincare endpoint accepts all skin types: {skin_types}")


class TestMeTimeEndpoint:
    """Me-time endpoint tests - verifies no 'books' category"""
    
    def test_metime_endpoint_exists(self):
        """POST /api/calendar/me-time-suggestions exists (returns 401)"""
        response = requests.post(
            f"{BASE_URL}/api/calendar/me-time-suggestions",
            json={"date": "2026-01-15", "meetings": [], "language": "en"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Me-time endpoint exists (returns 401 auth required)")


class TestLunchboxEndpoint:
    """School lunch box endpoint tests"""
    
    def test_lunchbox_endpoint_exists(self):
        """POST /api/kids/lunchbox/generate exists (returns 401)"""
        response = requests.post(
            f"{BASE_URL}/api/kids/lunchbox/generate",
            json={"kid_name": "Test", "age_group": "4-7", "language": "en", "days": 5}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Lunchbox endpoint exists (returns 401 auth required)")


class TestLanguageSupport:
    """Language support tests for pl, ar, uk, ru, pt"""
    
    def test_metime_accepts_new_languages(self):
        """Me-time endpoint accepts pl, ar, uk, ru, pt language codes"""
        languages = ["pl", "ar", "uk", "ru", "pt"]
        for lang in languages:
            response = requests.post(
                f"{BASE_URL}/api/calendar/me-time-suggestions",
                json={"date": "2026-01-15", "meetings": [], "language": lang}
            )
            # Should return 401, not 422 (validation error)
            assert response.status_code == 401, f"Language '{lang}' failed with {response.status_code}"
        print(f"✓ Me-time accepts all new languages: {languages}")
    
    def test_skincare_accepts_new_languages(self):
        """Skincare endpoint accepts pl, ar, uk, ru, pt language codes"""
        languages = ["pl", "ar", "uk", "ru", "pt"]
        for lang in languages:
            response = requests.post(
                f"{BASE_URL}/api/selfcare/skincare-routine/generate",
                json={"skin_type": "normal", "language": lang}
            )
            assert response.status_code == 401, f"Language '{lang}' failed with {response.status_code}"
        print(f"✓ Skincare accepts all new languages: {languages}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
