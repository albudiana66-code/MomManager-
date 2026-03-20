# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app 'MomManager 2026' for working mothers with AI-driven assistance.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python) + MongoDB
- **AI**: OpenAI GPT-4o via emergentintegrations
- **Auth**: Google OAuth via Emergent
- **Company**: SoldOut Digital LTD, support@mommanager.co.uk

## Implemented Features
- [x] Dynamic Day/Night theme
- [x] AI Chat (says "femeie minunata" unless user says they're a mom)
- [x] Kitchen: AI Food Scanner + meal planning
- [x] Kids: Stories (translated with t()), activities, milestones, School Lunch Box AI
- [x] Organize: checklist + quick-add (Cleaning, Groceries, Personal Care buttons), budget, receipts
- [x] Settings: 12 languages (en, en-US, ro, es, fr, de, it, pt, pl, ru, uk, ar)
- [x] Language/Currency modals: Dynamic theme, maxHeight 85%
- [x] Self-Care: workouts, nutrition, physical profile, skincare routine
- [x] Work/Planner: calendar, meetings, AI Me-Time, weekend planning DISABLED
- [x] Delete: Direct delete everywhere (no confirmation dialogs)
- [x] Legal: SoldOut Digital LTD + support@mommanager.co.uk
- [x] Full i18n refactor: kids.tsx, selfcare.tsx, kitchen.tsx, organize.tsx - replaced isRo with t()
- [x] All 12 language JSON files updated with translation keys

## Bug Fixes (Latest)
- [x] Fixed Kids section crash: missing `dateLocale` variable in kids.tsx (P0)
- [x] Cleaned unused `isRo` declarations from selfcare.tsx, kitchen.tsx, organize.tsx
- [x] Added missing Italian translation keys (activityDetails, exampleActivity, exampleName)

## P0/P1/P2 Backlog
### P1
- [ ] AI Me-Time Enhancements (time selector, more engaging experience in work.tsx)
- [ ] i18n refactor for remaining files: index.tsx, settings.tsx, legal/terms.tsx, legal/privacy.tsx

### P2
- [ ] AI Calendar Notifications
- [ ] AI Smart Planner
- [ ] Push notifications (Expo Push)
- [ ] Translate content for newer languages (pl, ar, uk, ru)

### P3
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
