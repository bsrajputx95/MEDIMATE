import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/design-tokens";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';
    const inStandaloneScreen = ['food-scanner', 'health-buddy', 'modal'].includes(segments[0]);

    console.log('🔄 Navigation check:', {
      segments,
      user: user ? { id: user.id, isGuest: user.isGuest, onboardingCompleted: user.onboardingCompleted } : null,
      inAuthGroup,
      inOnboardingGroup,
      inTabsGroup,
      inStandaloneScreen
    });

    if (!user) {
      // No user - redirect to auth (but allow standalone screens to load first)
      if (!inAuthGroup && !inStandaloneScreen) {
        console.log('🔄 Redirecting to auth - no user');
        router.replace('/auth');
      }
    } else {
      // User exists
      if (!user.onboardingCompleted && !user.isGuest) {
        // User needs onboarding (but allow standalone screens)
        if (!inOnboardingGroup && !inStandaloneScreen) {
          console.log('🔄 Redirecting to onboarding - incomplete');
          router.replace('/onboarding');
        }
      } else {
        // User is ready for main app
        // Only redirect to tabs if user is on auth/onboarding screens
        if (inAuthGroup || inOnboardingGroup) {
          console.log('🔄 Redirecting to tabs - user ready');
          router.replace('/(tabs)');
        }
        // Allow navigation to standalone screens without redirecting
      }
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="food-scanner" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="health-buddy" options={{ headerShown: false, presentation: "modal" }} />
      <OfflineIndicator />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <AssistantProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AssistantProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
