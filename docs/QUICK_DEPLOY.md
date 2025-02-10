# Quick Deployment Guide

## Prerequisites

1. **GitHub Account** - For code repository
2. **Vercel Account** - For backend deployment (free tier works)
3. **Neon Account** - For PostgreSQL database (free tier works)
4. **Expo Account** - For mobile app builds

## Step 1: Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project called "medimate"
3. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

## Step 2: Backend Deployment (Vercel)

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/medimate)

### Option B: Manual Deploy

1. Push code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "Add New..." → "Project"

4. Import your repository

5. Set **Root Directory** to `backend`

6. Add Environment Variables:
   - `DATABASE_URL` = Your Neon connection string
   - `JWT_SECRET` = Any random 32+ character string
   - `PERPLEXITY_API_KEY` = Your Perplexity API key (optional, for AI features)

7. Click "Deploy"

8. Wait for deployment to complete (~2 minutes)

9. Note your backend URL: `https://your-project.vercel.app`

## Step 3: Database Migration

After backend is deployed, run migrations:

```bash
cd backend

# Set your Neon DATABASE_URL in .env
echo "DATABASE_URL=your-neon-connection-string" > .env

# Run migrations
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

## Step 4: Frontend Build (Expo)

1. Update `expo/.env.production` with your backend URL:
```env
EXPO_PUBLIC_API_URL=https://your-backend.vercel.app
```

2. Install EAS CLI:
```bash
npm install -g eas-cli
```

3. Login to Expo:
```bash
eas login
```

4. Build the app:
```bash
cd expo
eas build --platform android --profile production
```

5. Download the APK from the Expo dashboard

## Environment Variables

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT tokens (32+ chars) |
| `PERPLEXITY_API_KEY` | ❌ | For AI food analysis |
| `LLM_API_URL` | ❌ | For Health Buddy chat |

### Frontend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | Your Vercel backend URL |

## Testing

1. Test backend health:
```bash
curl https://your-backend.vercel.app/api/health
```

2. Test API endpoints with Postman or curl

3. Install APK on device and test all features

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure `?sslmode=require` is included
- Check Neon dashboard for connection limits

### Build Fails
- Check Vercel build logs
- Verify all dependencies in package.json
- Ensure Node.js 18+ is used

### App Can't Connect to API
- Verify `EXPO_PUBLIC_API_URL` is correct
- Check CORS headers in vercel.json
- Test API with curl/Postman first

## Production Checklist

- [ ] Neon database created
- [ ] Backend deployed to Vercel
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Database seeded
- [ ] Frontend built
- [ ] Tested on device
- [ ] All features working

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Expo Docs: [docs.expo.dev](https://docs.expo.dev)
- Neon Docs: [neon.tech/docs](https://neon.tech/docs)
