# MediMate Production Redesign - Design Document

## Overview

Transform MediMate from a hackathon prototype into a production-ready, interview-shocking health & wellness application with premium UI, working backend integration, and professional polish.

---

## High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MediMate App                              │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Expo React Native)                                    │
│  ├── Screens Layer (5 main tabs + modals)                       │
│  ├── Component Library (reusable UI components)                 │
│  ├── State Management (Zustand + React Query)                   │
│  └── API Client (fetch wrapper with auth)                       │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Next.js 15 API Routes)                                │
│  ├── Auth Routes (login, register, guest)                       │
│  ├── Health Routes (metrics, goals, reports)                    │
│  ├── CURA Routes (appointments, medications, doctors)           │
│  ├── Community Routes (posts, groups, challenges)               │
│  └── AI Routes (food analysis, health buddy chat)               │
├─────────────────────────────────────────────────────────────────┤
│  Database (Neon PostgreSQL + Drizzle ORM)                       │
│  ├── Users & Profiles                                            │
│  ├── Health Data (metrics, goals, issues)                       │
│  ├── Medical Data (appointments, medications, reports)          │
│  └── Community Data (posts, groups, challenges)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Design Philosophy

**Core Principles:**
1. **Premium, Not Generic** - Every element feels intentional and crafted
2. **Subtle Sophistication** - Micro-interactions, smooth animations, thoughtful details
3. **Consistent Language** - Unified design tokens across all screens
4. **Professional Polish** - Industry-grade but not over-engineered
5. **Delightful Experience** - Haptic feedback, smooth transitions, responsive UI

**Anti-Patterns to Avoid:**
- Generic AI-generated UI feel
- Inconsistent spacing or typography
- Missing loading/error states
- Jarring transitions
- Cluttered information density

---

## Design Tokens & Theme

### Color System

```typescript
// Premium, modern color palette
export const COLORS = {
  // Primary - Vibrant Indigo (trust, health, technology)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Main
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#059669',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
  },

  // Neutral Palette
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },

  // Background & Surface
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F4F4F5',

  // Text
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  textInverse: '#FFFFFF',

  // Border
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  borderDark: '#D4D4D8',
};
```

### Typography Scale

```typescript
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    sans: 'Inter',           // Primary - clean, modern
    mono: 'JetBrains Mono',  // Code/data display
  },

  // Font Sizes (responsive)
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};
```

### Spacing System

```typescript
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};
```

### Border Radius

```typescript
export const RADIUS = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};
```

### Shadows & Elevation

```typescript
export const SHADOWS = {
  // Subtle shadows for depth
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0.5,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};
```

### Animation Tokens

```typescript
export const ANIMATION = {
  // Durations
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing Curves
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Spring Configs (for react-native-reanimated)
  spring: {
    gentle: { damping: 20, stiffness: 150 },
    bouncy: { damping: 15, stiffness: 180 },
    snappy: { damping: 25, stiffness: 300 },
  },
};
```

---

## Component Library

### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}

// Design Specs:
// - Primary: Solid primary color, white text
// - Secondary: Outlined, primary border and text
// - Ghost: Transparent background, primary text
// - Danger: Solid error color, white text
// - Hover states with subtle scale (1.02)
// - Press states with scale down (0.98)
// - Loading spinner animation
// - Haptic feedback on press
```

### Card Component

```typescript
interface CardProps {
  variant: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onPress?: () => void;
}

// Design Specs:
// - Elevated: White bg + shadow md
// - Outlined: White bg + border
// - Filled: Surface muted bg
// - Subtle hover/press animations
// - Optional press interaction
```

### Input Component

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  multiline?: boolean;
  disabled?: boolean;
}

// Design Specs:
// - Clean, minimal design
// - Floating label animation
// - Error state with red border
// - Focus state with primary border
// - Icon support (left side)
// - Smooth transitions between states
```

### Modal Component

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}

// Design Specs:
// - Backdrop blur effect
// - Slide up animation
// - Rounded top corners
// - Close button in header
// - Smooth enter/exit transitions
```

### Navigation Components

```typescript
// Tab Bar
interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Design Specs:
// - Floating pill-style tabs
// - Active tab: primary bg, white text
// - Inactive: muted bg, secondary text
// - Smooth slide animation on change
// - Haptic feedback

// Header
interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode[];
  transparent?: boolean;
}

// Design Specs:
// - Clean, minimal header
// - Optional transparency for hero sections
// - Back button with animation
// - Action buttons on right
```

### Data Display Components

```typescript
// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon?: React.ReactNode;
  color?: string;
}

// Progress Bar
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
}

// Badge
interface BadgeProps {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

// Avatar
interface AvatarProps {
  source?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

---

## Screen Architecture

### Screen Layout Pattern

```
┌─────────────────────────────────────┐
│          Status Bar                 │
├─────────────────────────────────────┤
│          Header                     │
│  (Title, Actions, Navigation)       │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          Content Area               │
│    (Scrollable, Cards, Lists)       │
│                                     │
│                                     │
├─────────────────────────────────────┤
│          Tab Bar                    │
│    (5 main navigation tabs)         │
└─────────────────────────────────────┘
```

### Navigation Structure

```
Root Stack
├── Auth Stack
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password Screen
├── Onboarding Stack
│   ├── Welcome Screen
│   ├── Profile Setup
│   └── Health Goals Setup
├── Main Tab Navigator
│   ├── Home Tab
│   │   ├── Dashboard
│   │   ├── Food Scanner (modal)
│   │   └── Health Buddy (modal)
│   ├── CURA Tab
│   │   ├── Overview
│   │   ├── Appointments
│   │   ├── Medications
│   │   ├── Test Reports
│   │   ├── Doctors
│   │   └── Treatment Plans
│   ├── Healthyics Tab
│   │   ├── Body Parts Grid
│   │   ├── Symptom Input
│   │   └── Analysis Results
│   ├── MedTalk Tab
│   │   ├── Feed
│   │   ├── Groups
│   │   ├── Challenges
│   │   ├── Experts
│   │   └── Trending
│   └── Profile Tab
│       ├── Overview
│       ├── Health Data
│       ├── Goals
│       ├── Records
│       └── Settings
└── Modal Screens
    ├── Food Scanner
    ├── Health Buddy Chat
    └── Appointment Booking
```

### Screen-by-Screen Design

#### 1. Home Screen (Health Dashboard)

**Layout:**
- Header with greeting, profile avatar, notification bell
- Quick stats grid (4 cards: Steps, Heart Rate, Water, Calories)
- Quick actions row (Scan Food, Health Buddy)
- Nutrition tracking card with progress
- Meal cards (Breakfast, Lunch, Snack, Dinner)
- Health score card with recommendations
- Tips section

**Interactions:**
- Pull-to-refresh for data sync
- Tap stat cards for detailed view
- Tap meal cards to add food
- Swipe to dismiss tips

**Animations:**
- Staggered entrance for cards
- Progress bar animations
- Number counting animation for stats

#### 2. CURA Screen (Medical Management)

**Layout:**
- Header with search, filter, notifications
- Horizontal tab navigation (Overview, Appointments, Tests, Meds, Doctors, Treatments)
- Content varies by tab
- FAB for quick actions

**Interactions:**
- Tab switching with smooth animation
- Swipe between tabs
- Pull-to-refresh
- Long-press for quick actions

**Animations:**
- Tab indicator slide
- Card entrance animations
- FAB scale on press

#### 3. Healthyics Screen (Symptom Analysis)

**Layout:**
- Header with info button
- Health tools row (Food Scanner, Health Buddy)
- Body parts grid (3 columns)
- Symptom input form (when body part selected)
- Analysis results (suggestions cards)

**Interactions:**
- Tap body part to select
- Type symptom description
- Submit for analysis
- View suggestions

**Animations:**
- Grid item scale on press
- Form slide up
- Results fade in

#### 4. MedTalk Screen (Community)

**Layout:**
- Header with create post button
- Search bar
- Horizontal tab bar (Feed, Groups, Challenges, Experts, Trending)
- Content varies by tab
- Create post modal

**Interactions:**
- Like, comment, share posts
- Join/leave groups
- Participate in challenges
- Vote on polls
- Create anonymous posts

**Animations:**
- Like heart animation
- Pull-to-refresh
- Infinite scroll loading

#### 5. Profile Screen

**Layout:**
- Profile header with avatar, name, email
- Horizontal tab bar (Overview, Health, Goals, Records, Settings)
- Content varies by tab
- Logout button

**Interactions:**
- Edit profile
- Toggle settings
- View detailed health data
- Manage goals

**Animations:**
- Tab switching
- Card entrance
- Toggle animations

---

## Data Flow Architecture

### State Management

```typescript
// Global State (Zustand)
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Health Data
  healthMetrics: HealthMetrics | null;
  healthGoals: HealthGoal[];

  // UI State
  activeTab: string;
  isLoading: boolean;
}

// Server State (React Query)
// - All API data cached and managed by React Query
// - Automatic refetching, caching, invalidation
```

### API Integration Pattern

```typescript
// API Client
const api = {
  // Auth
  login: (email, password) => POST('/api/auth/login'),
  register: (email, password, name) => POST('/api/auth/register'),
  guest: () => POST('/api/auth/guest'),

  // Health
  getMetrics: (dateRange) => GET('/api/health/metrics'),
  updateMetrics: (data) => POST('/api/health/metrics'),
  getGoals: () => GET('/api/health/goals'),
  createGoal: (goal) => POST('/api/health/goals'),

  // CURA
  getAppointments: () => GET('/api/cura/appointments'),
  createAppointment: (apt) => POST('/api/cura/appointments'),
  getMedications: () => GET('/api/cura/medications'),
  getDoctors: () => GET('/api/cura/doctors'),

  // Community
  getPosts: () => GET('/api/community/posts'),
  createPost: (post) => POST('/api/community/posts'),
  likePost: (id) => POST(`/api/community/posts/${id}/like`),
};
```

---

## Micro-Interactions & Animations

### Button Interactions
- Scale up (1.02) on hover
- Scale down (0.98) on press
- Haptic feedback (light impact)
- Loading spinner rotation

### Card Interactions
- Subtle lift on hover (shadow increase)
- Scale down (0.99) on press
- Smooth border color transition on focus

### List Interactions
- Staggered entrance animation (50ms delay per item)
- Swipe to delete with red background reveal
- Pull-to-refresh with spinner

### Navigation Transitions
- Tab switch: Slide + fade (250ms)
- Screen push: Slide from right (300ms)
- Modal: Slide up + fade backdrop (300ms)

### Data Loading
- Skeleton screens with shimmer effect
- Progress bars with smooth fill animation
- Number counting animation for stats

### Success/Error Feedback
- Success: Green checkmark scale animation
- Error: Red shake animation
- Toast notifications slide in from top

---

## Responsive Design

### Breakpoints
```typescript
export const BREAKPOINTS = {
  sm: 375,   // iPhone SE
  md: 414,   // iPhone 12/13
  lg: 428,   // iPhone 12/13 Pro Max
  xl: 768,   // iPad Mini
  '2xl': 1024, // iPad Pro
};
```

### Adaptive Layouts
- Cards: 2 columns on phone, 3 on tablet
- Stats grid: 2x2 on phone, 4x1 on tablet
- Navigation: Bottom tabs on phone, side nav on tablet

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for body text)
- Interactive elements have clear focus states
- Error states use both color and icon

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between touch targets

### Screen Reader Support
- All images have alt text
- All buttons have accessibility labels
- Proper heading hierarchy

---

## Performance Considerations

### Image Optimization
- Use expo-image for lazy loading
- Proper image sizing and caching
- Placeholder images during load

### List Virtualization
- Use FlashList for long lists
- Proper item keying
- Optimized re-renders

### Animation Performance
- Use react-native-reanimated for 60fps animations
- Run animations on UI thread
- Avoid animating layout properties

---

## Implementation Priority

### Phase 1: Design System (Week 1)
1. Update design tokens
2. Build core components (Button, Card, Input, Modal)
3. Create navigation components
4. Implement animations

### Phase 2: Screen Redesign (Week 2)
1. Home screen redesign
2. CURA screen redesign
3. Healthyics screen redesign
4. MedTalk screen redesign
5. Profile screen redesign

### Phase 3: Backend Integration (Week 3)
1. Connect all screens to real APIs
2. Implement proper error handling
3. Add loading states
4. Test data flow

### Phase 4: Polish & Deploy (Week 4)
1. Micro-interactions
2. Performance optimization
3. Testing
4. Vercel deployment
