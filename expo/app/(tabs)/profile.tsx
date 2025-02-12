import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAssistant } from '@/contexts/AssistantContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  User,
  Heart,
  Target,
  Award,
  FileText,
  Settings,
  Edit3,
  Phone,
  Weight,
  Ruler,
  Droplet,
  AlertTriangle,
  TrendingUp,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  Pill,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, ANIMATION } from '@/constants/design-tokens';
import { ProgressBar, Badge, Card, StatCard, Avatar, Button } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkeletonStatCard } from '@/components/ui/Skeleton';

type TabType = 'overview' | 'health' | 'goals' | 'records' | 'settings';

export default function ProfileScreen() {
  const { setCurrentScreen } = useAssistant();
  const { profile, isLoading, calculateBMI, getRiskLevel } = useProfile();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Profile');
    }, [setCurrentScreen])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
        }
      },
    ]);
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': 
        return <OverviewTab profile={profile} calculateBMI={calculateBMI} getRiskLevel={getRiskLevel} />;
      case 'health': 
        return <HealthTab profile={profile} />;
      case 'goals': 
        return <GoalsTab profile={profile} />;
      case 'records': 
        return <RecordsTab profile={profile} />;
      case 'settings': 
        return <SettingsTab profile={profile} onLogout={handleLogout} />;
      default: 
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.profileHeader}>
          <Avatar 
            source={profile.personalInfo.profilePhoto} 
            name={profile.personalInfo.name} 
            size="xl" 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.personalInfo.name}</Text>
            <Text style={styles.profileEmail}>{profile.personalInfo.email}</Text>
            <View style={styles.profileBadges}>
              <Badge label={`${profile.personalInfo.age} years`} variant="primary" />
              <Badge label={profile.healthBasics.bloodType} variant="error" />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            accessibilityLabel="Edit profile"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Edit3 size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeIn.delay(100).springify()} style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { key: 'overview', label: 'Overview', Icon: User },
            { key: 'health', label: 'Health', Icon: Heart },
            { key: 'goals', label: 'Goals', Icon: Target },
            { key: 'records', label: 'Records', Icon: FileText },
            { key: 'settings', label: 'Settings', Icon: Settings },
          ].map(({ key, label, Icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.activeTab]}
              onPress={() => handleTabChange(key as TabType)}
              activeOpacity={0.8}
            >
              <Icon size={16} color={activeTab === key ? COLORS.textInverse : COLORS.textSecondary} />
              <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
    </ErrorBoundary>
  );
}

function OverviewTab({ profile, calculateBMI, getRiskLevel }: { profile: any; calculateBMI: () => number; getRiskLevel: (type: 'heart' | 'diabetes' | 'kidney') => string }) {
  const bmi = calculateBMI();
  const heartRisk = getRiskLevel('heart');
  const diabetesRisk = getRiskLevel('diabetes');

  return (
    <View style={styles.tabContent}>
      {/* Quick Stats */}
      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Weight"
            value={profile.vitalsStats.weight}
            unit="lbs"
            icon={<Weight size={20} color={COLORS.primary} />}
            color={COLORS.primary}
          />
          <StatCard
            title="BMI"
            value={bmi.toString()}
            icon={<Ruler size={20} color={COLORS.success} />}
            color={COLORS.success}
          />
          <StatCard
            title="Heart Rate"
            value={profile.vitalsStats.restingHeartRate}
            unit="bpm"
            icon={<Heart size={20} color={COLORS.error} />}
            color={COLORS.error}
          />
          <StatCard
            title="Blood Type"
            value={profile.healthBasics.bloodType}
            icon={<Droplet size={20} color={COLORS.error} />}
            color={COLORS.error}
          />
        </View>
      </Animated.View>

      {/* Risk Assessment */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.riskContainer}>
          <RiskCard title="Heart Disease" level={heartRisk} index={0} />
          <RiskCard title="Diabetes" level={diabetesRisk} index={1} />
        </View>
      </Animated.View>

      {/* Active Goals */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Active Goals</Text>
        {profile.healthGoals.slice(0, 3).map((goal: any, index: number) => (
          <Animated.View 
            key={goal.id} 
            entering={FadeInDown.delay(350 + index * 50).springify()}
          >
            <Card variant="elevated" padding="lg" style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <Target size={18} color={COLORS.primary} />
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                <Text style={[styles.goalProgress, { color: COLORS.primary }]}>{goal.progress}%</Text>
              </View>
              <ProgressBar progress={goal.progress} color={COLORS.primary} height={8} />
              <Text style={styles.goalStats}>{goal.current} / {goal.target} {goal.unit}</Text>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

function HealthTab({ profile }: { profile: any }) {
  return (
    <View style={styles.tabContent}>
      {/* Health Basics */}
      <Animated.View entering={FadeInUp.springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Health Basics</Text>
        <Card variant="elevated" padding="lg">
          <InfoRow icon={Droplet} label="Blood Type" value={profile.healthBasics.bloodType} />
          <InfoRow icon={AlertTriangle} label="Allergies" value={profile.healthBasics.allergies.join(', ') || 'None'} />
          <InfoRow icon={Heart} label="Conditions" value={profile.healthBasics.chronicConditions.join(', ') || 'None'} isLast />
        </Card>
      </Animated.View>

      {/* Current Medications */}
      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Current Medications</Text>
        {profile.healthBasics.medications.map((med: any, index: number) => (
          <Animated.View 
            key={index} 
            entering={FadeInDown.delay(150 + index * 50).springify()}
          >
            <Card variant="elevated" padding="lg" style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationIcon}>
                  <Pill size={20} color={COLORS.primary} />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDetails}>{med.dosage} - {med.frequency}</Text>
                </View>
              </View>
              <Badge label={med.type} variant="primary" />
            </Card>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Latest Lab Results */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Lab Results</Text>
        {profile.vitalsStats.latestLabResults.map((result: any, index: number) => (
          <Animated.View 
            key={index} 
            entering={FadeInDown.delay(250 + index * 50).springify()}
          >
            <Card variant="elevated" padding="lg" style={styles.labResultCard}>
              <View style={styles.labResultHeader}>
                <Text style={styles.labResultTest}>{result.test}</Text>
                <Text style={styles.labResultDate}>{result.date}</Text>
              </View>
              <Text style={[styles.labResultValue, { color: COLORS.primary }]}>{result.value}</Text>
              <Text style={styles.labResultRange}>Normal: {result.normalRange}</Text>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

function GoalsTab({ profile }: { profile: any }) {
  return (
    <View style={styles.tabContent}>
      {/* Health Goals */}
      <Animated.View entering={FadeInUp.springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        {profile.healthGoals.map((goal: any, index: number) => (
          <Animated.View 
            key={goal.id} 
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <Card variant="elevated" padding="lg" style={styles.goalDetailCard}>
              <View style={styles.goalDetailHeader}>
                <View style={styles.goalDetailInfo}>
                  <Text style={styles.goalDetailTitle}>{goal.title}</Text>
                  <Badge label={goal.type} variant="primary" />
                </View>
                <View style={styles.goalDetailProgress}>
                  <Text style={[styles.goalDetailPercentage, { color: COLORS.primary }]}>{goal.progress}%</Text>
                  {goal.isCompleted && <Award size={20} color={COLORS.success} />}
                </View>
              </View>
              <ProgressBar progress={goal.progress} color={COLORS.primary} height={8} />
              <View style={styles.goalDetailStats}>
                <Text style={styles.goalDetailCurrent}>{goal.current} {goal.unit}</Text>
                <Text style={styles.goalDetailTarget}>Target: {goal.target} {goal.unit}</Text>
                <Text style={styles.goalDetailDeadline}>Due: {goal.deadline}</Text>
              </View>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Achievements */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {profile.achievements.map((achievement: any, index: number) => (
            <Animated.View 
              key={achievement.id} 
              entering={FadeInDown.delay(250 + index * 50).springify()}
              style={styles.achievementCardWrapper}
            >
              <Card variant="elevated" padding="lg" style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Award size={28} color={COLORS.warning} />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={styles.achievementDate}>{achievement.unlockedAt}</Text>
              </Card>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function RecordsTab({ profile }: { profile: any }) {
  return (
    <View style={styles.tabContent}>
      <Animated.View entering={FadeInUp.springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Records</Text>
        {profile.medicalRecords.map((record: any, index: number) => (
          <Animated.View 
            key={record.id} 
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <Card variant="elevated" padding="lg" style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.recordIcon}>
                  <FileText size={20} color={COLORS.primary} />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Badge label={record.type} variant="primary" />
                </View>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <Text style={styles.recordDescription}>{record.description}</Text>
              <View style={styles.recordTags}>
                {record.tags.map((tag: string, tagIndex: number) => (
                  <View key={tagIndex} style={styles.recordTag}>
                    <Text style={styles.recordTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

function SettingsTab({ profile, onLogout }: { profile: any; onLogout: () => void }) {
  return (
    <View style={styles.tabContent}>
      {/* Emergency Contact */}
      <Animated.View entering={FadeInUp.springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <Card variant="elevated" padding="lg">
          <InfoRow icon={User} label="Name" value={profile.personalInfo.emergencyContact.name} />
          <InfoRow icon={Heart} label="Relationship" value={profile.personalInfo.emergencyContact.relationship} />
          <InfoRow icon={Phone} label="Phone" value={profile.personalInfo.emergencyContact.phone} isLast />
        </Card>
      </Animated.View>

      {/* Notifications */}
      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="elevated" padding="lg">
          <SettingRow label="Appointments" value={profile.appSettings.notifications.appointments} />
          <SettingRow label="Medications" value={profile.appSettings.notifications.medications} />
          <SettingRow label="Health Alerts" value={profile.appSettings.notifications.healthAlerts} />
          <SettingRow label="Goals" value={profile.appSettings.notifications.goals} isLast />
        </Card>
      </Animated.View>

      {/* App Settings */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Card variant="elevated" padding="lg">
          <InfoRow icon={Settings} label="Language" value={profile.appSettings.language} />
          <InfoRow icon={TrendingUp} label="Font Size" value={profile.appSettings.accessibility.fontSize} />
          <InfoRow icon={Shield} label="High Contrast" value={profile.appSettings.accessibility.highContrast ? 'On' : 'Off'} isLast />
        </Card>
      </Animated.View>

      {/* Logout Button */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
        <Button
          variant="danger"
          onPress={onLogout}
          fullWidth
          icon={<LogOut size={18} color={COLORS.textInverse} />}
        >
          Logout
        </Button>
      </Animated.View>
    </View>
  );
}

function RiskCard({ title, level, index }: { title: string; level: string; index: number }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return COLORS.success;
      case 'Moderate': return COLORS.warning;
      case 'High': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(150 + index * 50).springify()} style={styles.riskCardWrapper}>
      <Card 
        variant="elevated" 
        padding="lg" 
        style={[styles.riskCard, { borderLeftColor: getRiskColor(level) }]}
      >
        <Text style={styles.riskTitle}>{title}</Text>
        <View style={[styles.riskLevelBadge, { backgroundColor: `${getRiskColor(level)}20` }]}>
          <Text style={[styles.riskLevel, { color: getRiskColor(level) }]}>{level}</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

function InfoRow({ icon: Icon, label, value, isLast }: { icon: any; label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Icon size={18} color={COLORS.textSecondary} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingRow({ label, value, isLast }: { label: string; value: boolean; isLast?: boolean }) {
  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING[5],
    paddingHorizontal: SPACING[5],
    ...SHADOWS.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING[4],
  },
  profileName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[2],
  },
  profileBadges: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    gap: SPACING[2],
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING[5],
    paddingBottom: SPACING[8],
  },
  section: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  riskContainer: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  riskCardWrapper: {
    flex: 1,
  },
  riskCard: {
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  riskTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  riskLevelBadge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
  riskLevel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  goalCard: {
    marginBottom: SPACING[3],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  goalTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  goalProgress: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  goalStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING[3],
    minWidth: 90,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: FONT_WEIGHTS.medium,
  },
  medicationCard: {
    marginBottom: SPACING[3],
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  medicationDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  labResultCard: {
    marginBottom: SPACING[3],
  },
  labResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  labResultTest: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  labResultDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  labResultValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING[1],
  },
  labResultRange: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  goalDetailCard: {
    marginBottom: SPACING[3],
  },
  goalDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  goalDetailInfo: {
    flex: 1,
    gap: SPACING[2],
  },
  goalDetailTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  goalDetailProgress: {
    alignItems: 'flex-end',
  },
  goalDetailPercentage: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING[1],
  },
  goalDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[3],
  },
  goalDetailCurrent: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  goalDetailTarget: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  goalDetailDeadline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  achievementCardWrapper: {
    width: (width - SPACING[5] * 2 - SPACING[3]) / 2,
  },
  achievementCard: {
    alignItems: 'center',
  },
  achievementIcon: {
    marginBottom: SPACING[2],
  },
  achievementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING[1],
  },
  achievementDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  recordCard: {
    marginBottom: SPACING[3],
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  recordInfo: {
    flex: 1,
    gap: SPACING[1],
  },
  recordTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  recordDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  recordDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[3],
    lineHeight: 20,
  },
  recordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  recordTag: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
  recordTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: SPACING[1],
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
