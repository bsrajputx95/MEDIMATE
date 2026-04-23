# MediMate - Production-Ready Health & Wellness App

A premium, production-ready health and wellness mobile application built with React Native, Expo, and Next.js backend. Features AI-powered health insights, medication tracking, community features, and nutrition analysis.

## 🚀 Features

### Core Features
- **Health Dashboard** - Real-time health metrics, nutrition tracking, and personalized recommendations
- **CURA** - Medication management, appointment scheduling, test reports, and treatment plans
- **Healthyics** - AI-powered symptom analysis and health insights
- **MedTalk** - Community platform with posts, groups, challenges, and expert Q&A
- **Profile** - Personal health profile, goals, achievements, and settings

### Technical Features
- Premium UI with professional design system
- Skeleton loading states with shimmer animations
- Error boundaries with retry mechanisms
- Offline indicators
- Haptic feedback throughout
- Smooth animations and micro-interactions
- Theme support (light/dark/system)
- Real-time API integration with retry logic

## 📱 Screenshots

| Home | CURA | Healthyics |
|------|------|------------|
| ![Home](docs/screenshots/home.png) | ![CURA](docs/screenshots/cura.png) | ![Healthyics](docs/screenshots/healthyics.png) |

| MedTalk | Profile | Auth |
|---------|---------|------|
| ![MedTalk](docs/screenshots/medtalk.png) | ![Profile](docs/screenshots/profile.png) | ![Auth](docs/screenshots/auth.png) |

## 🛠 Tech Stack

### Frontend (Expo)
- **React Native** with Expo Router
- **TypeScript** for type safety
- **Reanimated 3** for smooth animations
- **TanStack Query** for data fetching
- **React Native Safe Area Context** for responsive layouts
- **Lucide Icons** for beautiful icons
- **Expo Haptics** for feedback

### Backend (Next.js)
- **Next.js 14** with App Router
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon) for data storage
- **Vercel** for deployment

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn or bun
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd MEDIMATEV1-main
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../expo
npm install
```

### 3. Set up environment variables

#### Backend (.env)
Create `backend/.env` file:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

#### Frontend (.env)
Create `expo/.env` file:
```env
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
cd backend

# Generate Drizzle schema
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed initial data
npm run db:seed
```

### 5. Start the development servers

#### Start Backend
```bash
cd backend
npm run dev
```

#### Start Frontend
```bash
cd expo
npm start
```

### 6. Run on device/simulator

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

## 📁 Project Structure

```
MEDIMATEV1-main/
├── backend/                 # Next.js backend
│   ├── src/
│   │   ├── app/api/        # API routes
│   │   ├── db/             # Database schema and config
│   │   └── lib/            # Utilities
│   └── package.json
│
├── expo/                    # Expo frontend
│   ├── app/                # Screens and navigation
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components (Button, Card, etc.)
│   │   ├── cura/          # CURA feature components
│   │   └── community/     # MedTalk components
│   ├── constants/         # Design tokens, theme
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API client, utilities
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
│
└── .kiro/                  # Kiro spec files
    └── specs/
        └── medimate-production-redesign/
```

## 🎨 Design System

### Colors
- **Primary**: #3B82F6 (Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #06B6D4 (Cyan)

### Typography
- Font Family: Inter
- Sizes: xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24), 3xl (30)

### Spacing
- Scale: 0 (0px), 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 7 (28px), 8 (32px)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/guest` - Guest login

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/onboarding` - Complete onboarding

### Health
- `GET /api/health/metrics` - Get health metrics
- `GET /api/health/goals` - Get health goals
- `POST /api/health/goals` - Create goal
- `PUT /api/health/goals/:id` - Update goal

### CURA
- `GET /api/cura/appointments` - Get appointments
- `POST /api/cura/appointments` - Create appointment
- `GET /api/cura/medications` - Get medications
- `GET /api/cura/doctors` - Get doctors
- `GET /api/cura/test-reports` - Get test reports

### Community
- `GET /api/community/posts` - Get posts
- `POST /api/community/posts` - Create post
- `GET /api/community/groups` - Get groups
- `GET /api/community/challenges` - Get challenges

## 🚢 Deployment

### Backend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend (Expo)

1. Update API URL in `expo/.env`:
```env
EXPO_PUBLIC_API_URL="https://your-backend.vercel.app"
```

2. Build for production:
```bash
cd expo
npx expo build:ios   # For iOS
npx expo build:android  # For Android
```

3. Or use EAS Build:
```bash
eas build --platform ios
eas build --platform android
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd expo
npm test
```

## 📝 Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate Drizzle schema
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database

### Frontend
- `npm start` - Start Expo development
- `npm run ios` - Run on iOS
- `npm run android` - Run on Android
- `npm run web` - Run on web

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native framework
- [Vercel](https://vercel.com/) for seamless deployment
- [Neon](https://neon.tech/) for PostgreSQL database
- [Lucide](https://lucide.dev/) for beautiful icons
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for smooth animations

---

Built with ❤️ for better health
