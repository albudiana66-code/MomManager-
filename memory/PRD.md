# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app called 'MomManager 2026' for working mothers. AI-driven assistance is the core.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 and GPT-4o (vision) via emergentintegrations with Emergent LLM Key
- **Auth**: Google OAuth via Emergent

## What's Been Implemented
- [x] Dynamic Day/Night theme system (SettingsContext)
- [x] Dashboard: AI chat modal via pink bar
- [x] Kitchen: AI Food Scanner + meal planning
- [x] Kids: Stories, activities, milestones, School Lunch Box AI
- [x] Organize: checklist, budget, receipts
- [x] Settings: £9.99/£79.99 prices, theme toggle
- [x] Self-Care: workouts, nutrition, physical profile
- [x] Work/Planner: calendar, meetings, AI Me-Time (beauty, wellness, fun - NO books)
- [x] **AI Skincare Routine**: INLINE on calendar page, skin type selector (normal/uscat/gras/mixt/acneic) + season selector (primavara/vara/toamna/iarna), generates morning/evening routines with products and ingredients
- [x] **Delete buttons FIXED**: Direct delete without ANY confirmation (no window.confirm, no Alert.alert, no inline confirm) across ALL screens
- [x] **Languages**: 12 supported (en, en-US, ro, es, fr, de, it, pt, pl, ru, uk, ar) - each with complete translation file
- [x] Translation files: complete translations for all supported languages

## Delete Implementation Notes (IMPORTANT)
- NO window.confirm (blocks Expo Web)
- NO Alert.alert for confirm (doesn't work on Expo Web)
- NO inline confirm pattern (adds friction)
- ALL deletes call API directly on tap
- Story delete button is OUTSIDE parent TouchableOpacity (prevents event swallowing)
- Kid delete button has padding:10 for proper mobile touch target

## P0/P1/P2 Backlog
### P0
- [ ] Calendar AI Notifications
- [ ] Complete dynamic theme for selfcare.tsx and work.tsx

### P1
- [ ] AI Smart Planner (calendar as AI canvas)
- [ ] Push notifications (Expo Push)

### P2
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint

## Key API Endpoints
- POST /api/selfcare/skincare-routine/generate (skin_type, season, language)
- POST /api/calendar/me-time-suggestions
- POST /api/kids/lunchbox/generate
- DELETE /api/meetings/:id, /api/kids/:id, /api/stories/:id, /api/mealplans/:id, /api/selfcare/workout/:id, /api/receipts/:id
