import { Tabs } from "expo-router";
import { Home, Pill, TrendingUp, MessageSquare, User } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import FloatingAssistantBot from "@/components/FloatingAssistantBot";
import { useAssistant } from "@/contexts/AssistantContext";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS, RADIUS } from "@/constants/design-tokens";

export default function TabLayout() {
  const { speakScreenDescription } = useAssistant();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.borderLight,
            paddingBottom: SPACING[3],
            paddingTop: SPACING[2],
            height: 80,
            ...SHADOWS.md,
          },
          tabBarLabelStyle: {
            fontSize: FONT_SIZES.xs,
            fontWeight: FONT_WEIGHTS.semibold,
            marginTop: SPACING[1],
          },
          tabBarItemStyle: {
            gap: SPACING[1],
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <Home size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cura"
          options={{
            title: "CURA",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <Pill size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="healthyics"
          options={{
            title: "Healthyics",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <TrendingUp size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="medtalk"
          options={{
            title: "MedTalk",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <MessageSquare size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <User size={22} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>

      <FloatingAssistantBot onPress={speakScreenDescription} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: COLORS.primaryMuted,
  },
});
