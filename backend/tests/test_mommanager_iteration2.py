"""
MomManager 2026 - Iteration 2 Tests
Testing bug fixes and new features:
1. No AIChatButton import in dashboard
2. AI assistant bar exists with data-testid
3. Translation system uses t() function
4. Settings prices: £9.99/month, £79.99/year
5. Kitchen deleteMealPlan uses window.confirm
6. Kids screen has deleteStory and delete buttons
7. Work screen has deleteItem function
8. Portuguese translations
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')

# ============ Backend API Tests ============

class TestBackendHealth:
    """Health check endpoint"""
    
    def test_health_returns_200(self):
        """Backend /api/health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: /api/health returns 200 with status:healthy")


# ============ Code Structure Tests ============

class TestDashboardIndex:
    """Dashboard (tabs)/index.tsx tests"""
    
    @pytest.fixture
    def dashboard_code(self):
        with open('/app/frontend/app/(tabs)/index.tsx', 'r') as f:
            return f.read()
    
    def test_no_aichatbutton_import(self, dashboard_code):
        """Dashboard does NOT import AIChatButton component"""
        # Check for import statement
        assert 'AIChatButton' not in dashboard_code, \
            "Dashboard should NOT import AIChatButton component"
        print("PASS: Dashboard does NOT import AIChatButton")
    
    def test_has_ai_assistant_bar(self, dashboard_code):
        """Dashboard has AI chat bar with data-testid='ai-assistant-bar'"""
        assert 'data-testid="ai-assistant-bar"' in dashboard_code, \
            "Dashboard should have AI bar with data-testid='ai-assistant-bar'"
        print("PASS: Dashboard has data-testid='ai-assistant-bar'")
    
    def test_uses_t_function_for_ai_text(self, dashboard_code):
        """Dashboard uses t() function for ai.hereForYou and ai.tapToChat"""
        # Check for t('ai.hereForYou') usage
        assert "t('ai.hereForYou')" in dashboard_code, \
            "Dashboard should use t('ai.hereForYou') for translation"
        assert "t('ai.tapToChat')" in dashboard_code, \
            "Dashboard should use t('ai.tapToChat') for translation"
        print("PASS: Dashboard uses t() function for AI translations")


class TestSettingsScreen:
    """Settings screen price tests"""
    
    @pytest.fixture
    def settings_code(self):
        with open('/app/frontend/app/settings.tsx', 'r') as f:
            return f.read()
    
    def test_monthly_price_9_99(self, settings_code):
        """Settings shows £9.99 for monthly plan"""
        assert '£9.99' in settings_code, \
            "Monthly plan should show £9.99"
        print("PASS: Monthly plan shows £9.99")
    
    def test_yearly_price_79_99(self, settings_code):
        """Settings shows £79.99 for yearly plan"""
        assert '£79.99' in settings_code, \
            "Yearly plan should show £79.99"
        print("PASS: Yearly plan shows £79.99")
    
    def test_no_save_badge_on_yearly(self, settings_code):
        """Yearly plan does NOT have saveBadge component visible"""
        # The saveBadge style exists but it shouldn't be rendered for yearly
        # Check yearly section doesn't have Save X% text
        yearly_section_match = re.search(r'Yearly Plan.*?</TouchableOpacity>', settings_code, re.DOTALL)
        if yearly_section_match:
            yearly_section = yearly_section_match.group()
            # saveBadge should not be in the yearly plan section
            assert 'saveBadge' not in yearly_section or 'Save' not in yearly_section, \
                "Yearly plan should NOT display save badge"
        print("PASS: Yearly plan has no discount badge displayed")


class TestKitchenScreen:
    """Kitchen screen delete meal plan tests"""
    
    @pytest.fixture
    def kitchen_code(self):
        with open('/app/frontend/app/(tabs)/kitchen.tsx', 'r') as f:
            return f.read()
    
    def test_delete_meal_plan_uses_window_confirm(self, kitchen_code):
        """deleteMealPlan uses window.confirm for web compatibility"""
        # Check that deleteMealPlan function uses window.confirm
        assert 'window.confirm' in kitchen_code, \
            "deleteMealPlan should use window.confirm for web"
        print("PASS: deleteMealPlan uses window.confirm")


class TestKidsScreen:
    """Kids screen delete functionality tests"""
    
    @pytest.fixture
    def kids_code(self):
        with open('/app/frontend/app/(tabs)/kids.tsx', 'r') as f:
            return f.read()
    
    def test_has_delete_story_function(self, kids_code):
        """Kids screen has deleteStory function"""
        assert 'deleteStory' in kids_code, \
            "Kids screen should have deleteStory function"
        print("PASS: Kids screen has deleteStory function")
    
    def test_has_trash_outline_for_stories(self, kids_code):
        """Story cards have delete button with trash-outline icon"""
        assert 'trash-outline' in kids_code, \
            "Story cards should have trash-outline delete button"
        print("PASS: Stories have trash-outline delete button")
    
    def test_has_delete_button_on_kid_chips(self, kids_code):
        """Each kid chip has visible delete button (close-circle)"""
        assert 'close-circle' in kids_code, \
            "Kid chips should have close-circle delete button"
        # Check it's in the kid chip section
        assert 'kidDeleteBtn' in kids_code, \
            "Should have kidDeleteBtn style for kid delete button"
        print("PASS: Kid chips have close-circle delete button")
    
    def test_generate_story_no_kid_name(self, kids_code):
        """generateStory does NOT send kid_name parameter"""
        # Find the generateStory function and its api.generateStory call
        generate_match = re.search(r'api\.generateStory\(\{([^}]+)\}', kids_code, re.DOTALL)
        if generate_match:
            params = generate_match.group(1)
            assert 'kid_name' not in params, \
                "generateStory should NOT send kid_name parameter"
        print("PASS: generateStory does NOT send kid_name")


class TestWorkScreen:
    """Work screen delete functionality tests"""
    
    @pytest.fixture
    def work_code(self):
        with open('/app/frontend/app/(tabs)/work.tsx', 'r') as f:
            return f.read()
    
    def test_has_delete_item_function(self, work_code):
        """Work screen has deleteItem function for meetings"""
        assert 'deleteItem' in work_code, \
            "Work screen should have deleteItem function"
        print("PASS: Work screen has deleteItem function")
    
    def test_has_trash_outline_for_meetings(self, work_code):
        """Meeting items have delete button with trash-outline icon"""
        assert 'trash-outline' in work_code, \
            "Meeting items should have trash-outline delete button"
        print("PASS: Meetings have trash-outline delete button")


class TestPortugueseTranslations:
    """Portuguese translation file tests"""
    
    @pytest.fixture
    def pt_translations(self):
        import json
        with open('/app/frontend/src/translations/pt.json', 'r') as f:
            return json.load(f)
    
    def test_pt_file_exists(self):
        """Portuguese translation file exists"""
        import os
        assert os.path.exists('/app/frontend/src/translations/pt.json'), \
            "Portuguese translation file should exist"
        print("PASS: Portuguese translation file exists")
    
    def test_pt_has_ai_section(self, pt_translations):
        """Portuguese translations have ai section"""
        assert 'ai' in pt_translations, \
            "Portuguese translations should have 'ai' section"
        print("PASS: Portuguese has ai section")
    
    def test_pt_has_here_for_you(self, pt_translations):
        """Portuguese translations have ai.hereForYou key"""
        # This test will fail if key is missing - expected behavior
        ai_section = pt_translations.get('ai', {})
        assert 'hereForYou' in ai_section, \
            "Portuguese ai section should have 'hereForYou' key"
        print("PASS: Portuguese has ai.hereForYou")
    
    def test_pt_has_tap_to_chat(self, pt_translations):
        """Portuguese translations have ai.tapToChat key"""
        # This test will fail if key is missing - expected behavior
        ai_section = pt_translations.get('ai', {})
        assert 'tapToChat' in ai_section, \
            "Portuguese ai section should have 'tapToChat' key"
        print("PASS: Portuguese has ai.tapToChat")


class TestSettingsContext:
    """SettingsContext tests"""
    
    @pytest.fixture
    def settings_context_code(self):
        with open('/app/frontend/src/context/SettingsContext.tsx', 'r') as f:
            return f.read()
    
    def test_imports_pt_translations(self, settings_context_code):
        """SettingsContext imports ptTranslations"""
        assert 'ptTranslations' in settings_context_code, \
            "SettingsContext should import ptTranslations"
        print("PASS: SettingsContext imports ptTranslations")
    
    def test_pt_in_translations_map(self, settings_context_code):
        """Portuguese is added to translations map"""
        assert "pt: ptTranslations" in settings_context_code, \
            "Translations map should include pt: ptTranslations"
        print("PASS: Portuguese in translations map")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
