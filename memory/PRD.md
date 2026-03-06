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
7. **Multilingual** - RO, EN, FR, PT, ES, DE, IT with full translation files
8. **Delete functionality** - All items (meals, stories, meetings, kids) have visible delete buttons
9. **AI Chat** - Full chat modal from dashboard pink AI bar (no floating button)
10. **Calendar AI** - AI should help with meeting/task organization

## What's Been Implemented
- [x] Dynamic Day/Night theme system (SettingsContext)
- [x] Dashboard: AI chat modal via pink bar (floating button REMOVED)
- [x] Kitchen: Full rewrite with dynamic theme + AI Food Scanner
- [x] Kids: Dynamic theme + fictional characters + delete buttons for kids & stories
- [x] Organize: Dynamic theme (checklist, budget, receipts)
- [x] Settings: Theme toggle, £9.99/£79.99 prices, no annual discount
- [x] AI prompts updated for directness (Romanian + English)
- [x] Backend: POST /api/kitchen/generate-meals-from-image (GPT-4o vision)
- [x] Delete functions: meal plans (window.confirm on web), stories, meetings, kids
- [x] Portuguese translation file (pt.json)
- [x] Translation keys use t() instead of isRo ternary
- [x] Self-Care module (workouts, physical profile, strength meals) - partial theme
- [x] Work/Planner screen - partial theme + meeting delete buttons

## P0/P1/P2 Backlog
### P0 (Critical)
- [ ] Calendar AI Notifications - AI generates notifications for events
- [ ] Complete dynamic theme for selfcare.tsx (full rewrite, large file)
- [ ] Complete dynamic theme for work.tsx (full rewrite)
- [ ] Fix remaining isRo ternaries in kitchen.tsx, kids.tsx, selfcare.tsx, work.tsx

### P1 (Important)
- [ ] AI Smart Planner - Calendar as AI canvas for auto-generated plans
- [ ] Push notifications integration (Expo Push)
- [ ] Add remaining language translations (nl, pl, ru, uk, tr, ar, hi, zh, ja, ko)

### P2 (Future)
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
- [ ] Delete workouts (selfcare) with visible button
