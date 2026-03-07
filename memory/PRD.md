# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app called 'MomManager 2026' for working mothers. The core of the app is AI-driven assistance rather than manual input.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 and GPT-4o (vision) via emergentintegrations with Emergent LLM Key
- **Auth**: Google OAuth via Emergent

## Core Requirements
1. **Dynamic Day/Night Theme** - Toggle in Settings, affects entire app
2. **AI Stories** (Kids Module) - Age-appropriate stories with fictional characters
3. **Enhanced Self-Care** - Physical profile, AI workouts (home/gym), strength meals
4. **Kitchen AI Scanner** - Upload receipt/food photo -> AI analyzes -> meal suggestions
5. **AI Direct Responses** - All AI interactions direct and concise
6. **Subscription Plans** - £9.99/month (7-day trial), £79.99/year (no discount)
7. **Multilingual** - RO, EN, FR, PT, ES, DE, IT, PL, AR, UK, RU with full translation files
8. **Delete functionality** - All items (meals, stories, meetings, kids) have visible delete buttons - NO window.confirm
9. **AI Chat** - Full chat modal from dashboard pink AI bar (no floating button)
10. **Calendar AI** - AI should help with meeting/task organization
11. **AI Me-Time Suggestions** - Find free calendar slots and suggest self-care activities (categories: beauty, wellness, fun)
12. **School Lunch Box AI** - Generate healthy lunch menus for school children
13. **AI Skincare Routine** - Skin type selector (acneic, normal, gras, mixt, uscat) -> AI generates morning/evening routines with products, ingredients, tips

## What's Been Implemented
- [x] Dynamic Day/Night theme system (SettingsContext)
- [x] Dashboard: AI chat modal via pink bar (floating button REMOVED)
- [x] Kitchen: Full rewrite with dynamic theme + AI Food Scanner
- [x] Kids: Dynamic theme + fictional characters + delete buttons for kids & stories
- [x] Organize: Dynamic theme (checklist, budget, receipts)
- [x] Settings: Theme toggle, £9.99/£79.99 prices, no annual discount
- [x] AI prompts updated for directness (Romanian + English)
- [x] Backend: POST /api/kitchen/generate-meals-from-image (GPT-4o vision)
- [x] Delete functions: Fixed across ALL screens - removed window.confirm, fixed nested TouchableOpacity for stories
- [x] Translation files: pt, pl, ar, uk, ru (complete translations)
- [x] Translation keys use t() instead of isRo ternary
- [x] Self-Care module (workouts, physical profile, strength meals)
- [x] Work/Planner screen with meeting management
- [x] AI Me-Time Suggestions: Backend + Frontend (categories: beauty, wellness, fun - books REMOVED)
- [x] School Lunch Box AI: Backend endpoint + Frontend UI
- [x] AI Skincare Routine: Backend POST /api/selfcare/skincare-routine/generate + Frontend with skin type selector + morning/evening/weekly results modal
- [x] Inline delete confirmation (deleteConfirmId state pattern) instead of window.confirm

## P0/P1/P2 Backlog
### P0 (Critical)
- [ ] Calendar AI Notifications - AI generates notifications for events
- [ ] Complete dynamic theme for selfcare.tsx (full rewrite, large file)
- [ ] Complete dynamic theme for work.tsx (full rewrite)
- [ ] Fix remaining isRo ternaries in kitchen.tsx, kids.tsx, selfcare.tsx, work.tsx

### P1 (Important)
- [ ] AI Smart Planner - Calendar as AI canvas for auto-generated plans
- [ ] Push notifications integration (Expo Push)
- [ ] Add remaining language translations (nl, tr, hi, zh, ja, ko)

### P2 (Future)
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
- [ ] Delete workouts (selfcare) with visible button

## Key API Endpoints
- GET /api/health
- POST /api/auth/google (Google OAuth)
- GET/POST /api/meetings
- DELETE /api/meetings/:id
- GET/POST /api/kids
- DELETE /api/kids/:id
- POST /api/stories/generate
- GET /api/stories
- DELETE /api/stories/:id
- POST /api/kitchen/generate-meals-from-image
- GET /api/mealplans
- DELETE /api/mealplans/:id
- POST /api/calendar/me-time-suggestions
- POST /api/kids/lunchbox/generate
- POST /api/selfcare/skincare-routine/generate (NEW)
- POST /api/selfcare/workout-ai/generate
- POST /api/ai/chat
