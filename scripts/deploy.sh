#!/bin/bash

# MediMate Deployment Script
# This script helps deploy MediMate to Vercel and Expo

set -e

echo "🚀 MediMate Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
check_vercel() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
        npm install -g vercel
    fi
}

# Check if EAS CLI is installed
check_eas() {
    if ! command -v eas &> /dev/null; then
        echo -e "${YELLOW}EAS CLI not found. Installing...${NC}"
        npm install -g eas-cli
    fi
}

# Deploy backend to Vercel
deploy_backend() {
    echo -e "\n${GREEN}📦 Deploying Backend to Vercel...${NC}"
    cd backend
    
    # Check for .env file
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found. Make sure to set environment variables in Vercel dashboard.${NC}"
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    cd ..
    echo -e "${GREEN}✅ Backend deployed!${NC}"
}

# Build frontend for Expo
build_frontend() {
    echo -e "\n${GREEN}📱 Building Frontend for Expo...${NC}"
    cd expo
    
    # Install dependencies
    npm install
    
    # Build for production
    echo -e "${YELLOW}Choose build type:${NC}"
    echo "1) Android APK (Production)"
    echo "2) Android APK (Preview)"
    echo "3) iOS (Production)"
    echo "4) All platforms"
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            eas build --platform android --profile production
            ;;
        2)
            eas build --platform android --profile preview
            ;;
        3)
            eas build --platform ios --profile production
            ;;
        4)
            eas build --platform all --profile production
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    cd ..
    echo -e "${GREEN}✅ Frontend build started!${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "\n${GREEN}🗄️ Running Database Migrations...${NC}"
    cd backend
    
    # Generate migrations
    npm run db:generate
    
    # Push to database
    npm run db:push
    
    cd ..
    echo -e "${GREEN}✅ Database migrations complete!${NC}"
}

# Seed database
seed_database() {
    echo -e "\n${GREEN}🌱 Seeding Database...${NC}"
    cd backend
    npm run db:seed
    cd ..
    echo -e "${GREEN}✅ Database seeded!${NC}"
}

# Main menu
show_menu() {
    echo -e "\n${GREEN}What would you like to do?${NC}"
    echo "1) Deploy Backend to Vercel"
    echo "2) Build Frontend (Expo)"
    echo "3) Run Database Migrations"
    echo "4) Seed Database"
    echo "5) Full Deployment (Backend + Frontend)"
    echo "6) Exit"
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            check_vercel
            deploy_backend
            ;;
        2)
            check_eas
            build_frontend
            ;;
        3)
            run_migrations
            ;;
        4)
            seed_database
            ;;
        5)
            check_vercel
            check_eas
            run_migrations
            seed_database
            deploy_backend
            build_frontend
            ;;
        6)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            show_menu
            ;;
    esac
}

# Run
show_menu
