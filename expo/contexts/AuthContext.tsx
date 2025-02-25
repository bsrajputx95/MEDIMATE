import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { setToken, removeToken, authApi, profileApi, ApiError } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  height: { feet: number; inches: number };
  weight: number;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalConditions: string[];
  isGuest: boolean;
  onboardingCompleted: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profile: Omit<UserProfile, 'id' | 'email' | 'isGuest' | 'onboardingCompleted'>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredUser = useCallback(async () => {
    try {
      const profile = await profileApi.get();
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name || '',
          gender: (profile.gender as UserProfile['gender']) || 'Male',
          age: profile.age || 0,
          height: { feet: 0, inches: 0 }, // Will be loaded from profile
          weight: 0,
          bloodGroup: (profile.bloodGroup as UserProfile['bloodGroup']) || 'A+',
          medicalConditions: profile.medicalConditions || [],
          isGuest: profile.isGuest || false,
          onboardingCompleted: !!(profile.name && profile.age && profile.age > 0),
        });
      }
    } catch (error) {
      // No stored session or token expired
      if (ApiError.isUnauthorized(error)) {
        await removeToken();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      await setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || '',
        gender: 'Male',
        age: 0,
        height: { feet: 0, inches: 0 },
        weight: 0,
        bloodGroup: 'A+',
        medicalConditions: [],
        isGuest: false,
        onboardingCompleted: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password, name || '');
      await setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || '',
        gender: 'Male',
        age: 0,
        height: { feet: 0, inches: 0 },
        weight: 0,
        bloodGroup: 'A+',
        medicalConditions: [],
        isGuest: false,
        onboardingCompleted: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.guest();
      await setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || 'Guest',
        gender: 'Male',
        age: 0,
        height: { feet: 0, inches: 0 },
        weight: 0,
        bloodGroup: 'A+',
        medicalConditions: [],
        isGuest: true,
        onboardingCompleted: true, // Guest doesn't need onboarding
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      await removeToken();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profileUpdate: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await profileApi.update({
        name: profileUpdate.name,
        avatar: profileUpdate.avatar,
      });
      setUser(prev => prev ? { ...prev, ...profileUpdate } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [user]);

  const completeOnboarding = useCallback(async (profile: Omit<UserProfile, 'id' | 'email' | 'isGuest' | 'onboardingCompleted'>) => {
    if (!user) return;
    try {
      await profileApi.completeOnboarding({
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        bloodGroup: profile.bloodGroup,
        medicalConditions: profile.medicalConditions,
      });
      setUser(prev => prev ? { ...prev, ...profile, onboardingCompleted: true } : null);
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    await loadStoredUser();
  }, [loadStoredUser]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    loginAsGuest,
    logout,
    updateProfile,
    completeOnboarding,
    refreshProfile,
  }), [user, isLoading, login, signup, loginAsGuest, logout, updateProfile, completeOnboarding, refreshProfile]);
});
