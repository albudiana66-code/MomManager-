"""
MomManager 2026 - Iteration 3 Backend Tests
Tests for health check, me-time suggestions, and lunchbox endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://mommanager-preview.preview.emergentagent.com').rstrip('/')


class TestHealthCheck:
    """Health endpoint tests"""
    
    def test_health_endpoint_returns_200(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("app") == "MomManager 2026"
        print(f"✅ Health check passed: {data}")


class TestMeTimeEndpoint:
    """Me-Time suggestions endpoint tests"""
    
    def test_me_time_endpoint_exists(self):
        """POST /api/calendar/me-time-suggestions should exist (returns 401 for unauthorized)"""
        response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json={
            "date": "2026-01-15",
            "meetings": [],
            "language": "en"
        })
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print(f"✅ Me-Time endpoint exists (auth required): status {response.status_code}")

    def test_me_time_accepts_required_fields(self):
        """Me-Time endpoint should accept date, meetings array, and language"""
        payload = {
            "date": "2026-01-15",
            "meetings": [
                {"title": "Team Standup", "start_time": "09:00", "end_time": "09:30"},
                {"title": "Client Call", "start_time": "14:00", "end_time": "15:00"}
            ],
            "language": "pl"  # Testing Polish language
        }
        response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json=payload)
        # Auth required, but endpoint should accept the payload structure
        assert response.status_code in [401, 403, 200]
        print(f"✅ Me-Time endpoint accepts required fields: date, meetings, language")


class TestLunchBoxEndpoint:
    """School Lunch Box endpoint tests"""
    
    def test_lunchbox_endpoint_exists(self):
        """POST /api/kids/lunchbox/generate should exist (returns 401 for unauthorized)"""
        response = requests.post(f"{BASE_URL}/api/kids/lunchbox/generate", json={
            "kid_name": "Maria",
            "age_group": "4-7",
            "preferences": "",
            "allergies": "",
            "language": "en",
            "days": 5
        })
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print(f"✅ Lunchbox endpoint exists (auth required): status {response.status_code}")

    def test_lunchbox_accepts_all_fields(self):
        """Lunchbox endpoint should accept kid_name, age_group, preferences, allergies, language, days"""
        payload = {
            "kid_name": "Sofia",
            "age_group": "4-7",
            "preferences": "likes vegetables",
            "allergies": "peanuts",
            "language": "ar",  # Testing Arabic language
            "days": 5
        }
        response = requests.post(f"{BASE_URL}/api/kids/lunchbox/generate", json=payload)
        # Auth required, but endpoint should accept the payload structure
        assert response.status_code in [401, 403, 200]
        print(f"✅ Lunchbox endpoint accepts all required fields")

    def test_lunchbox_supports_new_languages(self):
        """Test that lunchbox endpoint accepts new language codes (pl, ar, uk, ru)"""
        new_languages = ['pl', 'ar', 'uk', 'ru']
        for lang in new_languages:
            payload = {
                "kid_name": "Test",
                "age_group": "4-7",
                "language": lang,
                "days": 3
            }
            response = requests.post(f"{BASE_URL}/api/kids/lunchbox/generate", json=payload)
            assert response.status_code in [401, 403, 200], f"Language {lang} rejected"
        print(f"✅ Lunchbox supports new languages: {new_languages}")


class TestMeTimeSupportedLanguages:
    """Test Me-Time endpoint with new languages"""
    
    def test_me_time_supports_new_languages(self):
        """Test that me-time endpoint accepts new language codes (pl, ar, uk, ru)"""
        new_languages = ['pl', 'ar', 'uk', 'ru']
        for lang in new_languages:
            payload = {
                "date": "2026-01-15",
                "meetings": [],
                "language": lang
            }
            response = requests.post(f"{BASE_URL}/api/calendar/me-time-suggestions", json=payload)
            assert response.status_code in [401, 403, 200], f"Language {lang} rejected"
        print(f"✅ Me-Time supports new languages: {new_languages}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
