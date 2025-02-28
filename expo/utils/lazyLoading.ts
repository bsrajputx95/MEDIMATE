import React, { lazy, Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/design-tokens';

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

// Lazy load a component with Suspense
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  Fallback: React.FC = LoadingFallback
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<Fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Preload a lazy component
export function preloadComponent<T>(
  importFn: () => Promise<{ default: T }>
): void {
  importFn();
}

// Lazy load with retry logic
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(() => {
    const retry = (retriesLeft: number): Promise<{ default: T }> => {
      return importFn().catch((error) => {
        if (retriesLeft <= 0) {
          throw error;
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(retry(retriesLeft - 1));
          }, 1000);
        });
      });
    };
    return retry(retries);
  });

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Chunk loading utility for code splitting
export const ChunkLoader = {
  // Preload critical chunks
  preloadCritical: () => {
    // Preload commonly used screens
    preloadComponent(() => import('@/app/(tabs)/index'));
    preloadComponent(() => import('@/app/(tabs)/cura'));
  },

  // Preload on app idle
  preloadOnIdle: (importFn: () => Promise<any>) => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        importFn();
      });
    } else {
      setTimeout(() => {
        importFn();
      }, 1000);
    }
  },
};

// Dynamic import with loading state
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let mounted = true;
    setState({ data: null, loading: true, error: null });

    importFn()
      .then((data) => {
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, deps);

  return state;
}

// Screen lazy loading helper
export const LazyScreens = {
  // Auth screens
  Auth: () => lazyLoad(() => import('@/app/auth')),
  Onboarding: () => lazyLoad(() => import('@/app/onboarding')),

  // Tab screens
  Home: () => lazyLoad(() => import('@/app/(tabs)/index')),
  CURA: () => lazyLoad(() => import('@/app/(tabs)/cura')),
  Healthyics: () => lazyLoad(() => import('@/app/(tabs)/healthyics')),
  MedTalk: () => lazyLoad(() => import('@/app/(tabs)/medtalk')),
  Profile: () => lazyLoad(() => import('@/app/(tabs)/profile')),

  // Modal screens
  FoodScanner: () => lazyLoad(() => import('@/app/food-scanner')),
  HealthBuddy: () => lazyLoad(() => import('@/app/health-buddy')),
};
