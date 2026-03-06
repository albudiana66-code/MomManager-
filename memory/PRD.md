# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app called 'MomManager 2026' for working mothers. The core of the app is AI-driven assistance rather than manual input.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 and GPT-4o (vision) via emergentintegrations with Emergent LLM Key
- **Auth**: Google OAuth via Emergent

## Tech Stack
- Frontend: Expo, React Native, TypeScript, expo-router, expo-linear-gradient, expo-image-picker
- Backend: FastAPI, motor (async MongoDB), emergentintegrations
- Theming: Dynamic Day/Night via SettingsContext (React Context API)

## Core Requirements
1. **Dynamic Day/Night Theme** - Toggle in Settings, affects entire app
2. **AI Stories** (Kids Module) - Age-appropriate stories with fictional characters (1-4, 4-7, 7+)
3. **Enhanced Self-Care** - Physical profile, AI workouts (home/gym), strength meals
4. **Kitchen AI Scanner** - Upload receipt/food photo -> AI analyzes -> meal suggestions
5. **AI Direct Responses** - All AI interactions direct and concise, no unnecessary questions
6. **Subscription Plans** - 7-day free trial ONLY for monthly plan

## What's Been Implemented (as of Feb 2026)
- [x] Dynamic Day/Night theme system (SettingsContext)
- [x] Settings page with theme toggle
- [x] Dashboard with dynamic theme
- [x] Kitchen screen - full rewrite with dynamic theme + AI Food Scanner
- [x] Kids screen - dynamic theme + fictional characters (no kid_name)
- [x] Organize screen - dynamic theme (checklist, budget, receipts)
- [x] Self-Care module (workouts, physical profile, strength meals) - partial theme
- [x] Work/Planner screen - partial theme
- [x] Settings subscription fix (7-day trial monthly only)
- [x] AI prompts updated for directness
- [x] Backend endpoint: POST /api/kitchen/generate-meals-from-image (GPT-4o vision)
- [x] AI Chat with empathetic but direct responses

## Key API Endpoints
- `GET /api/health` - Health check
- `POST /api/kitchen/generate-meals-from-image` - Vision AI food scanner
- `POST /api/stories/generate` - AI story generation (no kid_name)
- `POST /api/selfcare/workout-ai/generate` - AI workout with physical profile
- `POST /api/selfcare/strength-meals/generate` - Strength meal plans
- `POST /api/ai/chat` - AI assistant chat
- CRUD endpoints for: meetings, checklists, budgets, receipts, kids, mealplans

## P0/P1/P2 Backlog
### P0 (Critical)
- [ ] Calendar AI Notifications - AI generates and sends notifications for calendar events
- [ ] Complete dynamic theme for selfcare.tsx (full rewrite, 1661 lines)
- [ ] Complete dynamic theme for work.tsx (full rewrite, 675 lines)

### P1 (Important)
- [ ] AI Smart Planner - Calendar as AI canvas for auto-generated plans
- [ ] Push notifications integration (Expo Push Notifications)

### P2 (Future)
- [ ] Stripe Payment Integration (backend subscription logic)
- [ ] GDPR Export Data endpoint
- [ ] More granular theme customization

## File Structure
```
/app/backend/server.py - All backend endpoints and AI logic
/app/frontend/app/(tabs)/index.tsx - Dashboard (dynamic theme)
/app/frontend/app/(tabs)/kitchen.tsx - Kitchen + Food Scanner (dynamic theme)
/app/frontend/app/(tabs)/kids.tsx - Kids Stories (dynamic theme)
/app/frontend/app/(tabs)/organize.tsx - Checklist/Budget/Receipts (dynamic theme)
/app/frontend/app/(tabs)/selfcare.tsx - Self-Care/Workouts (partial theme)
/app/frontend/app/(tabs)/work.tsx - AI Smart Planner (partial theme)
/app/frontend/app/settings.tsx - Settings with Day/Night toggle (dynamic theme)
/app/frontend/src/context/SettingsContext.tsx - Theme + settings provider
/app/frontend/src/theme/index.ts - Color palettes
/app/frontend/src/utils/api.ts - API client
```
