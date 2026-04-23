import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '@/constants/design-tokens';

export function OfflineIndicator() {
  const netInfo = useNetInfo();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    
    if (isOffline) {
      setIsVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  if (!isVisible) return null;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <WifiOff size={16} color={COLORS.textInverse} />
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </Animated.View>
  );
}

export function ConnectionStatus() {
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected && netInfo.isInternetReachable !== false;

  return (
    <View style={styles.statusContainer}>
      {isConnected ? (
        <Wifi size={14} color={COLORS.success} />
      ) : (
        <WifiOff size={14} color={COLORS.error} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
    zIndex: 1000,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textInverse,
  },
  statusContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
