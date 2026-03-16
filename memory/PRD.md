# MomManager 2026 - Product Requirements Document

## Original Problem Statement
Build a "Modern 2026" mobile app 'MomManager 2026' for working mothers with AI-driven assistance.

## Architecture
- **Frontend**: React Native / Expo (web + mobile)
- **Backend**: FastAPI (Python) + MongoDB
- **AI**: OpenAI GPT-5.2 via emergentintegrations
- **Auth**: Google OAuth via Emergent
- **Company**: SoldOut Digital LTD, support@mommanager.co.uk

## Implemented Features
- [x] Dynamic Day/Night theme
- [x] AI Chat (says "femeie minunată" unless user says they're a mom)
- [x] Kitchen: AI Food Scanner + meal planning
- [x] Kids: Stories (translated with t()), activities, milestones, School Lunch Box AI
- [x] Organize: checklist + **quick-add Cleaning & Shopping buttons**, budget, receipts
- [x] Settings: £9.99/£79.99, 12 languages (en, en-US, ro, es, fr, de, it, pt, pl, ru, uk, ar)
- [x] Language/Currency modals: Dynamic theme (C.bg/C.text), maxHeight 85%
- [x] Self-Care: workouts, nutrition, physical profile
- [x] Work/Planner: calendar, meetings, AI Me-Time, **weekend planning DISABLED**
- [x] AI Skincare Routine: skin type + season selector
- [x] Delete: Direct delete everywhere (no confirmation dialogs)
- [x] Legal: SoldOut Digital LTD + support@mommanager.co.uk
- [x] Translations: All 10 language files updated with kids stories keys

## P0/P1/P2 Backlog
### P0
- [ ] More isRo → t() replacements in selfcare.tsx, work.tsx for complete i18n
- [ ] Calendar AI Notifications

### P1
- [ ] AI Smart Planner
- [ ] Push notifications (Expo Push)

### P2
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
