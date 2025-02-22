## [2025-02-01 11:45:15] chore: initialize monorepo workspace for mobile and backend
- Staged: README.md, backend/.env.example
## [2025-02-01 13:23:43] chore(expo): configure Expo app manifest, babel, and metro bundler
- Staged: backend/drizzle.config.ts, backend/next-env.d.ts
## [2025-02-02 15:50:48] chore(expo): setup TypeScript configuration and path aliases
- Staged: backend/next.config.js, backend/package-lock.json
## [2025-02-02 17:55:15] chore(expo): configure EAS build profiles and deployment metadata
- Staged: backend/package.json, backend/src/app/api/auth/guest/route.ts
## [2025-02-02 19:28:34] chore(backend): setup Next.js backend with Drizzle ORM configuration
- Staged: backend/src/app/api/auth/login/route.ts, backend/src/app/api/auth/register/route.ts
## [2025-02-03 15:58:18] feat(backend): define Drizzle database schema for users and records
- Staged: backend/src/app/api/chat/route.ts, backend/src/app/api/community/challenges/[id]/join/route.ts
## [2025-02-03 17:44:15] feat(backend): add database seed script and mock data generators
- Staged: backend/src/app/api/community/challenges/route.ts, backend/src/app/api/community/groups/[id]/join/route.ts
## [2025-02-03 19:47:41] feat(backend): implement auth routes with JWT and guest login fallback
- Staged: backend/src/app/api/community/groups/route.ts, backend/src/app/api/community/polls/[id]/vote/route.ts
## [2025-02-04 13:45:53] feat(backend): implement cura appointments and doctor directory APIs
- Staged: backend/src/app/api/community/polls/route.ts, backend/src/app/api/community/posts/[id]/like/route.ts
## [2025-02-04 15:11:23] feat(backend): implement medication tracking and prescription routes
- Staged: backend/src/app/api/community/posts/route.ts, backend/src/app/api/cura/appointments/[id]/route.ts
## [2025-02-05 16:29:15] feat(backend): add test reports and treatment plan endpoints
- Staged: backend/src/app/api/cura/appointments/route.ts, backend/src/app/api/cura/doctors/route.ts
## [2025-02-05 18:53:27] feat(backend): implement food photo analysis API route
- Staged: backend/src/app/api/cura/medications/[id]/route.ts, backend/src/app/api/cura/medications/route.ts
## [2025-02-06 12:28:01] feat(backend): add health metrics logging and goal tracker APIs
- Staged: backend/src/app/api/cura/test-reports/route.ts, backend/src/app/api/cura/treatments/route.ts
## [2025-02-06 14:35:55] feat(backend): implement community posts, challenges, and poll voting APIs
- Staged: backend/src/app/api/food/analyze/route.ts, backend/src/app/api/health/goals/[id]/route.ts
## [2025-02-07 10:51:48] feat(backend): add profile management and onboarding completion routes
- Staged: backend/src/app/api/health/goals/route.ts, backend/src/app/api/health/metrics/route.ts
## [2025-02-07 12:36:39] feat(expo): implement root _layout navigation and theme design tokens
- Staged: backend/src/app/api/health/reports/route.ts, backend/src/app/api/profile/onboarding/route.ts
## [2025-02-07 14:30:24] feat(expo): add tabs navigation for cura, healthyics, medtalk, and profile
- Staged: backend/src/app/api/profile/route.ts, backend/src/db/index.ts
## [2025-02-09 10:12:06] feat(expo): implement Auth screen with guest login support
- Staged: backend/src/db/schema.ts, backend/src/db/seed.ts
## [2025-02-09 12:59:34] feat(expo): implement Onboarding carousel and health profile setup
- Staged: backend/src/lib/auth.ts, backend/src/middleware.ts
## [2025-02-09 14:43:44] feat(cura): add DoctorCard, AppointmentCard, and booking modal
- Staged: backend/tsconfig.json, backend/vercel.json
## [2025-02-10 11:44:50] feat(cura): implement MedicationCard and daily streak tracker
- Staged: docs/API.md, docs/DEPLOYMENT.md
## [2025-02-10 13:56:55] feat(cura): add MedicationReminderSetup and test report visualizer
- Staged: docs/QUICK_DEPLOY.md, docs/USER_GUIDE.md
## [2025-02-11 16:21:11] feat(cura): implement TreatmentPlanCard and prescription list
- Staged: expo/.env.production, expo/LICENSE
## [2025-02-11 18:27:03] feat(health): implement HealthBuddy chat and suggested questions harness
- Staged: expo/README.md, expo/app.json
## [2025-02-12 14:24:16] feat(health): add healthyics dashboard and metrics stat cards
- Staged: expo/app/(tabs)/_layout.tsx, expo/app/(tabs)/cura.tsx
## [2025-02-12 16:16:28] feat(scanner): implement food photo scanner and nutrition breakdown modal
- Staged: expo/app/(tabs)/healthyics.tsx, expo/app/(tabs)/index.tsx
## [2025-02-12 18:50:09] feat(community): add GroupCard, ChallengeCard, and PollCard components
- Staged: expo/app/(tabs)/medtalk.tsx, expo/app/(tabs)/profile.tsx
## [2025-02-12 20:48:57] feat(community): implement PostCard and expert answer card views
- Staged: expo/app/+not-found.tsx, expo/app/_layout.tsx
## [2025-02-13 11:38:43] feat(ui): implement Header, FloatingAssistantBot, and custom TabBar
- Staged: expo/app/auth.tsx, expo/app/food-scanner.tsx
## [2025-02-13 13:39:15] feat(ui): add Avatar, Badge, Button, Card, and Input primitives
- Staged: expo/app/health-buddy.tsx, expo/app/modal.tsx
## [2025-02-14 16:34:33] feat(ui): add Modal, ProgressBar, Skeleton, and LoadingSpinner widgets
- Staged: expo/app/onboarding.tsx, expo/assets/images/adaptive-icon.png
## [2025-02-14 18:41:03] feat(ui): implement FeedbackAnimation and OfflineIndicator banner
- Staged: expo/assets/images/favicon.png, expo/assets/images/icon.png
## [2025-02-14 20:27:07] feat(contexts): setup AssistantContext, AuthContext, and ProfileContext
- Staged: expo/assets/images/splash-icon.png, expo/babel.config.js
## [2025-02-14 22:07:13] feat(hooks): implement useApiData, useRealtimeUpdates, and useHaptic
- Staged: expo/bun.lock, expo/components/ErrorBoundary.tsx
## [2025-02-15 11:20:16] feat(hooks): add useMedicalRecords, useCommunityData, and useTheme
- Staged: expo/components/FloatingAssistantBot.tsx, expo/components/OfflineIndicator.tsx
## [2025-02-15 13:18:00] feat(utils): implement calendarIntegration and notification scheduler
- Staged: expo/components/community/ChallengeCard.tsx, expo/components/community/CreatePollModal.tsx
## [2025-02-15 15:11:08] feat(utils): add offline chatPersistence and settingsPersistence
- Staged: expo/components/community/ExpertAnswerCard.tsx, expo/components/community/GroupCard.tsx
## [2025-02-15 17:55:47] feat(utils): add imageOptimization and lazyLoading helpers
- Staged: expo/components/community/PollCard.tsx, expo/components/community/PostCard.tsx
## [2025-02-16 10:28:23] refactor(backend): optimize lazy DB initialization and fallback logic
- Staged: expo/components/cura/AppointmentBookingModal.tsx, expo/components/cura/AppointmentCard.tsx
## [2025-02-16 12:35:39] refactor(expo): polish tab transitions and haptic feedback timings
- Staged: expo/components/cura/DoctorCard.tsx, expo/components/cura/MedicationCard.tsx
## [2025-02-19 12:37:03] perf(ui): memoize animated list cards in community feed
- Staged: expo/components/cura/MedicationReminderSetup.tsx, expo/components/cura/MedicationStreakTracker.tsx
## [2025-02-19 14:51:54] chore: synchronize manifest and lockfile dependencies
- Staged: expo/components/cura/TestReportCard.tsx, expo/components/cura/TreatmentPlanCard.tsx
## [2025-02-19 16:21:31] perf(ui): memoize animated list cards in community feed
- Staged: expo/components/food/FoodSearchModal.tsx, expo/components/health/SuggestedQuestions.tsx
## [2025-02-20 12:59:22] refactor(hooks): add useMedicalRecords, useCommunityData, and useTheme
- Staged: expo/components/ui/Avatar.tsx, expo/components/ui/Badge.tsx
## [2025-02-20 14:42:15] refactor(backend): implement community posts, challenges, and poll voting APIs
- Staged: expo/components/ui/Button.tsx, expo/components/ui/Card.tsx
## [2025-02-21 16:46:08] refactor(utils): add imageOptimization and lazyLoading helpers
- Staged: expo/components/ui/FeedbackAnimation.tsx, expo/components/ui/FloatingActionButton.tsx
## [2025-02-21 18:34:55] refactor(expo): implement root _layout navigation and theme design tokens
- Staged: expo/components/ui/Header.tsx, expo/components/ui/Input.tsx
## [2025-02-22 13:54:47] refactor(cura): implement MedicationCard and daily streak tracker
- Staged: expo/components/ui/LoadingSpinner.tsx, expo/components/ui/Modal.tsx
## [2025-02-22 15:48:47] chore(expo): setup TypeScript configuration and path aliases
- Staged: expo/components/ui/ProgressBar.tsx, expo/components/ui/Skeleton.tsx
