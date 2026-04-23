import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Image,
  ImageProps,
  ImageURISource,
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { COLORS } from '@/constants/design-tokens';

// Cache directory for images
const CACHE_DIR = `${FileSystem.cacheDirectory}image-cache/`;

// Image cache to prevent redundant downloads
const memoryCache = new Map<string, string>();

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  fadeInDuration?: number;
  cacheEnabled?: boolean;
  priority?: 'low' | 'normal' | 'high';
  thumbnail?: string;
}

// Ensure cache directory exists
async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

// Generate cache key from URL
async function getCacheKey(url: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    url
  );
}

// Get cached image path
async function getCachedImagePath(url: string): Promise<string | null> {
  // Check memory cache first
  if (memoryCache.has(url)) {
    return memoryCache.get(url)!;
  }

  try {
    await ensureCacheDir();
    const cacheKey = await getCacheKey(url);
    const filePath = `${CACHE_DIR}${cacheKey}`;

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      memoryCache.set(url, filePath);
      return filePath;
    }
  } catch (error) {
    console.warn('Cache check failed:', error);
  }

  return null;
}

// Download and cache image
async function downloadAndCacheImage(url: string): Promise<string> {
  try {
    await ensureCacheDir();
    const cacheKey = await getCacheKey(url);
    const filePath = `${CACHE_DIR}${cacheKey}`;

    const downloadResult = await FileSystem.downloadAsync(url, filePath);
    memoryCache.set(url, downloadResult.uri);
    return downloadResult.uri;
  } catch (error) {
    console.warn('Image download failed:', error);
    throw error;
  }
}

// Clear image cache
export async function clearImageCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR);
    }
    memoryCache.clear();
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

// Get cache size
export async function getCacheSize(): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists && 'size' in dirInfo) {
      return dirInfo.size || 0;
    }
  } catch (error) {
    console.warn('Failed to get cache size:', error);
  }
  return 0;
}

// Optimized Image Component
export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  placeholder,
  errorComponent,
  fadeInDuration = 300,
  cacheEnabled = true,
  priority = 'normal',
  thumbnail,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnail);

  const uri = typeof source === 'object' && 'uri' in source ? source.uri : null;

  useEffect(() => {
    if (!uri) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadImage = async () => {
      try {
        if (cacheEnabled) {
          // Check cache first
          const cachedPath = await getCachedImagePath(uri);
          if (cachedPath && mounted) {
            setImageUri(cachedPath);
            setLoading(false);
            return;
          }

          // Download and cache
          const downloadedPath = await downloadAndCacheImage(uri);
          if (mounted) {
            setImageUri(downloadedPath);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setImageUri(uri);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [uri, cacheEnabled]);

  const handleLoad = (e: any) => {
    setShowThumbnail(false);
    onLoad?.(e);
  };

  const handleError = (e: any) => {
    setError(true);
    setLoading(false);
    onError?.(e);
  };

  // Static image (require)
  if (typeof source === 'number') {
    return (
      <Image
        source={source}
        style={style}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  }

  // Error state
  if (error && errorComponent) {
    return <>{errorComponent}</>;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Thumbnail (blur-up effect) */}
      {showThumbnail && thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={[StyleSheet.absoluteFill, style, styles.thumbnail]}
          blurRadius={10}
        />
      )}

      {/* Main image */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, style]}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Loading placeholder */}
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          {placeholder || (
            <ActivityIndicator 
              size="small" 
              color={COLORS.primary} 
            />
          )}
        </View>
      )}
    </View>
  );
});

// Progressive Image with blur-up effect
export const ProgressiveImage: React.FC<{
  thumbnailSource: { uri: string };
  source: { uri: string };
  style?: any;
}> = memo(({ thumbnailSource, source, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={thumbnailSource}
        style={[StyleSheet.absoluteFill, style, styles.thumbnail]}
        blurRadius={loaded ? 0 : 10}
      />
      <Image
        source={source}
        style={[StyleSheet.absoluteFill, style, { opacity: loaded ? 1 : 0 }]}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </View>
  );
});

// Image preloader utility
export const ImagePreloader = {
  preload: async (urls: string[]): Promise<void> => {
    const promises = urls.map(async (url) => {
      try {
        const cachedPath = await getCachedImagePath(url);
        if (!cachedPath) {
          await downloadAndCacheImage(url);
        }
      } catch (error) {
        console.warn('Preload failed for:', url);
      }
    });

    await Promise.all(promises);
  },

  // Preload critical images (call on app start)
  preloadCritical: async (): Promise<void> => {
    const criticalImages = [
      // Add your critical image URLs here
    ];

    await ImagePreloader.preload(criticalImages);
  },
};

// Image size optimizer
export const getOptimizedImageUrl = (
  originalUrl: string,
  width: number,
  height?: number,
  quality: number = 80
): string => {
  // If using a CDN that supports image transformations
  // This is a placeholder - implement based on your CDN
  
  // For Cloudinary
  if (originalUrl.includes('cloudinary.com')) {
    const transformations = `w_${width},q_${quality}`;
    if (height) {
      return originalUrl.replace('/upload/', `/upload/${transformations},h_${height}/`);
    }
    return originalUrl.replace('/upload/', `/upload/${transformations}/`);
  }

  // For other CDNs, add similar logic
  return originalUrl;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  thumbnail: {
    opacity: 0.5,
  },
});

export default OptimizedImage;
