# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app called 'MomManager 2026' for working mothers. AI-driven assistance is the core.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 and GPT-4o (vision) via emergentintegrations
- **Auth**: Google OAuth via Emergent
- **Company**: SoldOut Digital LTD, support@mommanager.co.uk

## What's Been Implemented
- [x] Dynamic Day/Night theme system
- [x] Dashboard: AI chat (uses "femeie minunată" not "mamă" unless user says they're a mom)
- [x] Kitchen: AI Food Scanner + meal planning
- [x] Kids: Stories, activities, milestones, School Lunch Box AI
- [x] Organize: checklist, budget, receipts
- [x] Settings: £9.99/£79.99 prices, theme toggle
- [x] Self-Care: workouts, nutrition, physical profile
- [x] Work/Planner: calendar, meetings, AI Me-Time (beauty, wellness, fun)
- [x] AI Skincare Routine: Card → modal with vertical skin type selectors + season, auto-generate on tap
- [x] Delete buttons: Direct delete across ALL screens (no confirmations)
- [x] 12 Languages: en, en-US, ro, es, fr, de, it, pt, pl, ru, uk, ar
- [x] Currency/Language modals: Dynamic theme colors (C.bg, C.text) - proper day/night
- [x] Legal: SoldOut Digital LTD + support@mommanager.co.uk in Terms, Privacy, Copyright
- [x] AI Chat: "femeie minunată" by default, "mamă" only if user mentions being a mom

## P0/P1/P2 Backlog
### P0
- [ ] Calendar AI Notifications
- [ ] Complete dynamic theme for selfcare.tsx

### P1
- [ ] AI Smart Planner (calendar as AI canvas)
- [ ] Push notifications (Expo Push)

### P2
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
