import { useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/design-tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryMuted: string;
  secondary: string;
  secondaryMuted: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;
}

interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
}

const THEME_STORAGE_KEY = 'theme_mode';

const lightColors: ThemeColors = {
  background: COLORS.background,
  surface: COLORS.surface,
  surfaceMuted: COLORS.surfaceMuted,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textInverse: COLORS.textInverse,
  border: COLORS.border,
  borderLight: COLORS.borderLight,
  primary: COLORS.primary,
  primaryMuted: COLORS.primaryMuted,
  secondary: COLORS.secondary,
  secondaryMuted: COLORS.secondaryMuted,
  success: COLORS.success,
  successMuted: COLORS.successMuted,
  warning: COLORS.warning,
  warningMuted: COLORS.warningMuted,
  error: COLORS.error,
  errorMuted: COLORS.errorMuted,
  info: COLORS.info,
  infoMuted: COLORS.infoMuted,
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceMuted: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  border: '#475569',
  borderLight: '#334155',
  primary: '#3B82F6',
  primaryMuted: 'rgba(59, 130, 246, 0.15)',
  secondary: '#8B5CF6',
  secondaryMuted: 'rgba(139, 92, 246, 0.15)',
  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#06B6D4',
  infoMuted: 'rgba(6, 182, 212, 0.15)',
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeMode(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine actual theme based on mode
  const getActualTheme = useCallback((): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const actualTheme = getActualTheme();
  const isDark = actualTheme === 'dark';

  const theme: Theme = {
    mode: actualTheme,
    colors: isDark ? darkColors : lightColors,
    isDark,
  };

  // Change theme mode
  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    await setTheme(newMode);
  }, [isDark, setTheme]);

  // Reset to system theme
  const resetToSystemTheme = useCallback(async () => {
    await setTheme('system');
  }, [setTheme]);

  return {
    theme,
    themeMode,
    setTheme,
    toggleTheme,
    resetToSystemTheme,
    isDark,
    isLoading,
  };
}

export type { Theme, ThemeColors };
