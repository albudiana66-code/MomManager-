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
- [x] AI Chat (says "femeie minunata" unless user says they're a mom) - ALL languages
- [x] Kitchen: AI Food Scanner + meal planning - language parameter sent
- [x] Kids: Stories, activities, milestones, School Lunch Box AI (more ideas + alternatives)
- [x] Organize: checklist with SEPARATE category cards (Cleaning, Groceries, Personal Care) + budget + receipts
- [x] Settings: 12 languages (en, en-US, ro, es, fr, de, it, pt, pl, ru, uk, ar)
- [x] Language/Currency modals: Dynamic theme, maxHeight 85%
- [x] Self-Care: workouts, nutrition, physical profile, skincare routine
- [x] Work/Planner: calendar, meetings, AI Me-Time, skincare routine - ALL i18n'd
- [x] Delete: Direct delete everywhere
- [x] Legal: SoldOut Digital LTD + support@mommanager.co.uk
- [x] Full i18n: kids.tsx, selfcare.tsx, kitchen.tsx, organize.tsx, work.tsx
- [x] ALL AI endpoints support 12 languages via get_lang_name() helper
- [x] Translation keys for skincare types, seasons, work UI in all language JSON files

## Latest Changes (Mar 22, 2026)
- [x] ALL AI endpoints (10 total) updated: mealplans, kitchen-image, nutrition, workout, workout-ai, strength-meals, stories, lunchbox, me-time, skincare, chat
- [x] Lunch box AI generates more varied ideas with alternative_main per day
- [x] Checklist refactored: 3 separate expandable category cards (cleaning/groceries/personal care)
- [x] work.tsx: 21 hardcoded ro/en strings replaced with t() function
- [x] New translation keys added to all 12 JSON files (work.*, skincare.*)
- [x] kitchen.tsx now sends language.code to meal plan generation
- [x] Removed unused isRo declarations from selfcare.tsx, kitchen.tsx, organize.tsx

## P0/P1/P2 Backlog
### P1
- [ ] Push notifications automate (reamintiri activități)
- [ ] i18n for remaining files: index.tsx, settings.tsx, legal pages
- [ ] Remaining ro/en ternaries in kids.tsx (age groups), selfcare.tsx (workout location/type labels)

### P2
- [ ] AI Calendar Notifications
- [ ] AI Smart Planner
- [ ] Expo Push Notifications setup
- [ ] Translate content for newer languages (pl, ar, uk, ru)

### P3
- [ ] Stripe Payment Integration
- [ ] GDPR Export Data endpoint
