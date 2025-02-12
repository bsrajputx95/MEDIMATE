import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAssistant } from '@/contexts/AssistantContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Settings,
  Footprints,
  Heart,
  Droplets,
  Flame,
  Camera,
  MessageCircle,
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Bell,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { StatCard, SectionHeader, ProgressBar, Badge, Card, Avatar } from '@/components/ui';
import { useHealthMetrics, useHealthScore, useHealthGoals } from '@/hooks';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkeletonStatCard, SkeletonCard } from '@/components/ui/Skeleton';

interface MealCardProps {
  mealName: string;
  time: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const MealCard: React.FC<MealCardProps> = ({ 
  mealName, 
  time, 
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0 
}) => {
  const getMealIcon = (meal: string) => {
    switch (meal.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'snack': return '🍎';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/food-scanner');
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.mealCardContainer}>
      <View style={styles.mealPill}>
        <Text style={styles.mealEmoji}>{getMealIcon(mealName)}</Text>
        <Text style={styles.mealName}>{mealName}</Text>
        <Text style={styles.mealTime}>{time}</Text>
      </View>
      <Card variant="elevated" padding="lg" style={styles.mealCard} onPress={handlePress}>
        <View style={styles.mealContent}>
          <View style={styles.foodImageSection}>
            <View style={styles.foodImagePlaceholder}>
              <Camera size={28} color={COLORS.primary} />
              <Text style={styles.foodImageText}>Tap to scan food</Text>
            </View>
          </View>
          <View style={styles.mealDetailsSection}>
            <View style={styles.caloriesSection}>
              <Text style={styles.caloriesSectionTitle}>Calories</Text>
              <Text style={styles.caloriesValue}>{calories || '---'} kcal</Text>
            </View>
            <View style={styles.nutritionAnalysisSection}>
              <Text style={styles.nutritionAnalysisTitle}>Macros</Text>
              <View style={styles.nutritionValues}>
                <Text style={styles.nutritionValue}>P: {protein}g</Text>
                <Text style={styles.nutritionValue}>C: {carbs}g</Text>
                <Text style={styles.nutritionValue}>F: {fat}g</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

export default function HealthDashboard() {
  const { setCurrentScreen } = useAssistant();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // API Data Hooks
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useHealthMetrics();
  const { score: healthScore } = useHealthScore();
  const { goals, isLoading: goalsLoading } = useHealthGoals();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Home');
    }, [setCurrentScreen])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refetchMetrics()]);
    setRefreshing(false);
  }, [refetchMetrics]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  // Format steps with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Calculate calorie progress
  const calorieGoal = 2200;
  const caloriesConsumed = metrics?.calories || 1250;
  const calorieProgress = Math.min(100, (caloriesConsumed / calorieGoal) * 100);

  // Sample meals data (would come from API in production)
  const meals = useMemo(() => [
    { name: 'Breakfast', time: '7:00 AM', calories: 450, protein: 24, carbs: 45, fat: 18 },
    { name: 'Lunch', time: '12:30 PM', calories: 620, protein: 35, carbs: 62, fat: 22 },
    { name: 'Snack', time: '4:00 PM', calories: 180, protein: 8, carbs: 20, fat: 8 },
    { name: 'Dinner', time: '7:30 PM', calories: 0, protein: 0, carbs: 0, fat: 0 },
  ], []);

  // Health recommendations based on metrics
  const recommendations = useMemo(() => {
    const recs = {
      add: [] as string[],
      reduce: [] as string[],
    };

    if (metrics) {
      if (metrics.steps < 10000) {
        recs.add.push('Evening walk to reach 10K steps');
      }
      if (metrics.waterIntake < 2.5) {
        recs.add.push('Drink more water - aim for 2.5L');
      }
      if (metrics.sleep < 7) {
        recs.add.push('Aim for 7-8 hours of sleep');
      }
    }

    recs.add.push('Leafy greens - High in iron');
    recs.add.push('Omega-3 fish - Heart health');
    recs.reduce.push('Processed foods - High sodium');
    recs.reduce.push('Sugary drinks - Empty calories');

    return recs;
  }, [metrics]);

  // Tips based on current metrics
  const tips = useMemo(() => {
    const tipsList: string[] = [];
    
    if (metrics) {
      const waterNeeded = (2.5 - metrics.waterIntake).toFixed(1);
      if (parseFloat(waterNeeded) > 0) {
        tipsList.push(`You're ${waterNeeded}L away from your water goal`);
      }
      
      if (metrics.steps >= 8000) {
        tipsList.push('Great job on steps! Evening walk to reach 10K');
      } else {
        tipsList.push(`Keep moving! ${formatNumber(10000 - metrics.steps)} steps to go`);
      }
      
      if (metrics.sleep >= 7) {
        tipsList.push('Great sleep last night! Keep it up');
      } else {
        tipsList.push('Aim for 7-8 hours of sleep tonight');
      }
    }

    return tipsList.length > 0 ? tipsList : [
      'Stay hydrated throughout the day',
      'Take regular breaks from screen time',
      'Practice mindful eating',
    ];
  }, [metrics]);

  const isLoading = metricsLoading || goalsLoading;

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.topBar, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.profileSection}>
          <Avatar name={user?.name || 'Health Tracker'} size="lg" />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>{user?.name || 'Health Tracker'}</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            accessibilityLabel="Notifications"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Bell size={22} color={COLORS.textSecondary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            accessibilityLabel="Settings"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Settings size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer} 
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
        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
          <SectionHeader title="Today's Overview" />
          {isLoading ? (
            <View style={styles.statsGrid}>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <StatCard
                title="Steps"
                value={formatNumber(metrics?.steps || 0)}
                trend={{ value: 12, direction: 'up' }}
                icon={<Footprints size={22} color={COLORS.primary} />}
                color={COLORS.primary}
              />
              <StatCard
                title="Heart Rate"
                value={metrics?.heartRate?.toString() || '--'}
                unit="bpm"
                icon={<Heart size={22} color={COLORS.error} />}
                color={COLORS.error}
              />
              <StatCard
                title="Water"
                value={metrics?.waterIntake?.toFixed(1) || '0.0'}
                unit="L"
                icon={<Droplets size={22} color={COLORS.info} />}
                color={COLORS.info}
              />
              <StatCard
                title="Calories"
                value={formatNumber(metrics?.calories || 0)}
                icon={<Flame size={22} color={COLORS.warning} />}
                color={COLORS.warning}
              />
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsRow}>
            <Card 
              variant="elevated" 
              padding="lg" 
              style={styles.actionCard}
              onPress={() => router.push('/food-scanner')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
                <Camera size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionTitle}>Scan Food</Text>
              <Text style={styles.actionSubtitle}>Instant nutrition analysis</Text>
            </Card>
            <Card 
              variant="elevated" 
              padding="lg" 
              style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
              onPress={() => router.push('/health-buddy')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <MessageCircle size={28} color={COLORS.textInverse} />
              </View>
              <Text style={[styles.actionTitle, { color: COLORS.textInverse }]}>Health Buddy</Text>
              <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>AI health assistant</Text>
            </Card>
          </View>
        </Animated.View>

        {/* Nutrition Tracking */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
          <Card variant="elevated" padding="lg">
            <View style={styles.nutritionHeader}>
              <View style={styles.nutritionTitleRow}>
                <Text style={styles.nutritionTitle}>Nutrition Tracking</Text>
                <Badge label={calorieProgress >= 100 ? 'Goal Met' : 'On Track'} variant={calorieProgress >= 100 ? 'success' : 'info'} />
              </View>
            </View>
            <View style={styles.nutritionSummary}>
              <View style={styles.calorieInfo}>
                <Text style={styles.totalConsumed}>{formatNumber(caloriesConsumed)} kcal</Text>
                <Text style={styles.calorieGoal}>of {formatNumber(calorieGoal)} kcal goal</Text>
                <ProgressBar progress={calorieProgress} color={calorieProgress >= 100 ? COLORS.success : COLORS.primary} height={10} />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <SectionHeader title="Today's Meals" />
          {meals.map((meal) => (
            <MealCard 
              key={meal.name} 
              mealName={meal.name} 
              time={meal.time}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
            />
          ))}
        </View>

        {/* Health Score */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
          <View style={styles.reportTitleContainer}>
            <Brain size={24} color={COLORS.primary} />
            <Text style={styles.reportTitle}>Health Report</Text>
          </View>

          <Card variant="elevated" padding="lg" style={styles.healthScoreCard}>
            <View style={styles.healthScoreHeader}>
              <Text style={styles.healthScoreTitle}>Overall Health Score</Text>
              <View style={styles.healthScoreValue}>
                <Text style={styles.healthScoreNumber}>{healthScore}</Text>
                <Text style={styles.healthScoreMax}>/100</Text>
              </View>
            </View>
            <ProgressBar progress={healthScore} color={healthScore >= 70 ? COLORS.success : healthScore >= 50 ? COLORS.warning : COLORS.error} height={10} />
            <Text style={styles.healthScoreDescription}>
              {healthScore >= 70 
                ? 'Great progress! You\'re on track with your health goals.' 
                : healthScore >= 50 
                  ? 'Good effort! Keep working on your health goals.' 
                  : 'Room for improvement. Focus on the basics.'}
            </Text>
          </Card>

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Card variant="outlined" padding="md" style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.recommendationIcon, { backgroundColor: COLORS.successMuted }]}>
                  <ArrowUp size={16} color={COLORS.success} />
                </View>
                <Text style={styles.recommendationTitle}>Add to Your Diet</Text>
              </View>
              <View style={styles.recommendationItems}>
                {recommendations.add.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <CheckCircle size={14} color={COLORS.success} />
                    <Text style={styles.recommendationText}>{item}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card variant="outlined" padding="md" style={[styles.recommendationCard, { borderLeftColor: COLORS.error }]}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.recommendationIcon, { backgroundColor: COLORS.errorMuted }]}>
                  <ArrowDown size={16} color={COLORS.error} />
                </View>
                <Text style={styles.recommendationTitle}>Consider Reducing</Text>
              </View>
              <View style={styles.recommendationItems}>
                {recommendations.reduce.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <AlertTriangle size={14} color={COLORS.error} />
                    <Text style={styles.recommendationText}>{item}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* Tips Card */}
          <Card variant="filled" padding="lg" style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={20} color={COLORS.warning} />
              <Text style={styles.tipsTitle}>Today's Tips</Text>
            </View>
            <View style={styles.tipsList}>
              {tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          </Card>
        </Animated.View>

        <View style={{ height: SPACING[8] }} />
      </ScrollView>
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[4],
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: SPACING[4],
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  username: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  actionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nutritionHeader: {
    marginBottom: SPACING[4],
  },
  nutritionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  nutritionSummary: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
  },
  calorieInfo: {
    flex: 1,
  },
  totalConsumed: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  calorieGoal: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[3],
  },
  mealsSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
  },
  mealCardContainer: {
    marginBottom: SPACING[5],
  },
  mealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    alignSelf: 'flex-start',
    marginBottom: -SPACING[3],
    marginLeft: SPACING[4],
    zIndex: 1,
    gap: SPACING[2],
    ...SHADOWS.md,
  },
  mealEmoji: {
    fontSize: 14,
  },
  mealName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textInverse,
  },
  mealTime: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  mealCard: {
    marginTop: 0,
  },
  mealContent: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  foodImageSection: {
    flex: 1,
  },
  foodImagePlaceholder: {
    height: 100,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  foodImageText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING[2],
  },
  mealDetailsSection: {
    flex: 1,
    gap: SPACING[3],
  },
  caloriesSection: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: SPACING[3],
    alignItems: 'center',
  },
  caloriesSectionTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[1],
  },
  caloriesValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  nutritionAnalysisSection: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: SPACING[3],
    flex: 1,
  },
  nutritionAnalysisTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[2],
  },
  nutritionValues: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  nutritionValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  reportTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  healthScoreCard: {
    marginBottom: SPACING[4],
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  healthScoreTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  healthScoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  healthScoreNumber: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  healthScoreMax: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginLeft: SPACING[1],
  },
  healthScoreDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING[3],
  },
  recommendationsContainer: {
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  recommendationCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  recommendationIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  recommendationItems: {
    gap: SPACING[2],
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  recommendationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: COLORS.warningMuted,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  tipsTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#92400E',
  },
  tipsList: {
    gap: SPACING[2],
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: '#92400E',
    lineHeight: 20,
  },
});
