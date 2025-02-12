import React from 'react';
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from 'lucide-react-native';
import { COLORS, RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={COLORS.error} />
        </View>
        <Text style={styles.title}>Oops! Page not found</Text>
        <Text style={styles.description}>The page you&apos;re looking for doesn&apos;t exist in our health app.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Dashboard</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING['2xl'],
    backgroundColor: COLORS.background,
  },
  iconContainer: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['3xl'],
  },
  link: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  linkText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
