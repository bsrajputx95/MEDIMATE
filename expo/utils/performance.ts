import { useMemo, useCallback, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

// Debounce hook for search inputs and other frequent operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}

// Throttle hook for scroll events and other high-frequency operations
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        // Schedule for remaining time
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}

// Memoize expensive computations
export function useMemoizedSelector<T, R>(
  selector: (input: T) => R,
  input: T,
  deps: any[] = []
): R {
  return useMemo(() => selector(input), [input, ...deps]);
}

// Run callback after interactions complete (for smoother animations)
export function useRunAfterInteractions() {
  return useCallback((callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  }, []);
}

// Lazy load hook for components
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null; load: () => void } {
  const dataRef = useRef<T | null>(null);
  const loadingRef = useRef(false);
  const errorRef = useRef<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(() => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    loader()
      .then((data) => {
        if (mountedRef.current) {
          dataRef.current = data;
          errorRef.current = null;
        }
      })
      .catch((error) => {
        if (mountedRef.current) {
          errorRef.current = error;
        }
      })
      .finally(() => {
        if (mountedRef.current) {
          loadingRef.current = false;
        }
      });
  }, deps);

  return {
    data: dataRef.current,
    loading: loadingRef.current,
    error: errorRef.current,
    load,
  };
}

// Batch updates for better performance
export function useBatchUpdates() {
  const queueRef = useRef<(() => void)[]>([]);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    InteractionManager.runAfterInteractions(() => {
      const updates = queueRef.current;
      queueRef.current = [];
      
      updates.forEach(update => update());
      isProcessingRef.current = false;

      if (queueRef.current.length > 0) {
        processQueue();
      }
    });
  }, []);

  const addToQueue = useCallback((update: () => void) => {
    queueRef.current.push(update);
    processQueue();
  }, [processQueue]);

  return addToQueue;
}

// Prevent memory leaks by cleaning up on unmount
export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return cleanup;
  }, []);
}

// Track component render count for debugging
export function useRenderCount(componentName: string) {
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  if (__DEV__) {
    console.log(`${componentName} render count: ${renderCountRef.current}`);
  }
}

// Optimize list rendering
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string
) {
  return useMemo(() => {
    return items.map((item, index) => ({
      item,
      key: keyExtractor(item, index),
      index,
    }));
  }, [items, keyExtractor]);
}

// Image caching helper
const imageCache = new Map<string, { uri: string; timestamp: number }>();

export function getCachedImage(uri: string, maxAge: number = 24 * 60 * 60 * 1000): string {
  const cached = imageCache.get(uri);
  const now = Date.now();

  if (cached && now - cached.timestamp < maxAge) {
    return cached.uri;
  }

  imageCache.set(uri, { uri, timestamp: now });
  return uri;
}

// Clear image cache
export function clearImageCache() {
  imageCache.clear();
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void) {
  if (__DEV__) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
}

// Async performance monitoring
export async function measureAsyncPerformance(name: string, fn: () => Promise<void>) {
  if (__DEV__) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  } else {
    await fn();
  }
}
