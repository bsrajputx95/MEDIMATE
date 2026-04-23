# MediMate Deployment Guide

This guide covers deploying MediMate to production using Vercel (backend) and Expo (frontend).

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Neon account (for PostgreSQL database)
- Expo account (for mobile app distribution)

---

## Part 1: Database Setup (Neon)

### 1. Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project named "medimate"

### 2. Get Database Connection String

1. Go to your project dashboard
2. Copy the connection string from the "Connection Details" section
3. It should look like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 3. Configure Database

The connection string will be used as `DATABASE_URL` environment variable in Vercel.

---

## Part 2: Backend Deployment (Vercel)

### 1. Prepare Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Select the `backend` directory as the root directory

### 3. Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `JWT_SECRET` | Random 32+ character string | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | Your Vercel URL (e.g., https://medimate-backend.vercel.app) | Production |

### 4. Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your production URL (e.g., `https://medimate-backend.vercel.app`)

### 5. Run Database Migrations

After first deployment, run migrations:

```bash
cd backend

# Set DATABASE_URL in your local .env temporarily
# Then run:
npm run db:migrate
```

Or use Vercel CLI:

```bash
vercel env pull .env.local
npm run db:migrate
```

### 6. Seed Initial Data (Optional)

```bash
npm run db:seed
```

---

## Part 3: Frontend Deployment (Expo)

### 1. Update API URL

Update `expo/.env`:

```env
EXPO_PUBLIC_API_URL=https://your-backend.vercel.app
```

### 2. Install EAS CLI

```bash
npm install -g eas-cli
```

### 3. Login to Expo

```bash
eas login
```

### 4. Configure EAS

Create `expo/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 5. Build for Android (APK)

```bash
cd expo
eas build --platform android --profile production
```

This will:
- Create a production build
- Generate an APK file
- Provide a download link

### 6. Build for iOS (requires Mac)

```bash
eas build --platform ios --profile production
```

### 7. Submit to App Stores (Optional)

For App Store/Play Store distribution:

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

---

## Part 4: Custom Domain (Optional)

### 1. Add Custom Domain in Vercel

1. Go to your Vercel project
2. Settings → Domains
3. Add your domain (e.g., `api.medimate.app`)
4. Configure DNS records as instructed

### 2. Update Frontend API URL

Update `expo/.env` with your custom domain:

```env
EXPO_PUBLIC_API_URL=https://api.medimate.app
```

---

## Part 5: SSL Configuration

Vercel automatically provisions SSL certificates for:
- `*.vercel.app` domains
- Custom domains (via Let's Encrypt)

No additional configuration needed.

---

## Part 6: Monitoring & Logging

### Vercel Logs

1. Go to your Vercel project
2. Click "Deployments"
3. Click on a deployment
4. View "Functions" and "Runtime" logs

### Error Tracking (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/react-native
```

---

## Part 7: CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./backend

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd expo && npm install
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd expo && eas build --platform android --profile production --non-interactive
```

---

## Environment Variables Checklist

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `NEXT_PUBLIC_API_URL` | ✅ | Public API URL for CORS |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend API URL |

---

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon dashboard for connection limits
3. Ensure SSL mode is enabled (`?sslmode=require`)

### Build Failures

1. Check Vercel build logs
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version is compatible (18+)

### API Connection Issues

1. Verify `EXPO_PUBLIC_API_URL` is correct
2. Check CORS settings in backend
3. Test API endpoints with Postman/curl

### Expo Build Issues

1. Run `expo doctor` to check for issues
2. Clear cache: `npx expo start -c`
3. Check EAS build logs

---

## Production Checklist

- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] Backend deployed to Vercel
- [ ] API endpoints tested
- [ ] Frontend API URL updated
- [ ] Mobile app built
- [ ] Tested on physical device
- [ ] Custom domain configured (optional)
- [ ] SSL working
- [ ] Error tracking enabled (optional)
- [ ] CI/CD pipeline set up (optional)

---

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
