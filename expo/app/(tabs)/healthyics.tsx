import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  Info,
  Heart,
  User,
  Circle,
  Wind,
  Eye,
  Brain,
  Plus,
  X,
  Leaf,
  Activity,
  Camera,
  MessageCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAssistant } from '@/contexts/AssistantContext';
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
import { BodyPart, AnalysisResult } from '@/types/healthyics';
import { defaultBodyParts, commonNutrientSuggestions, commonLifestyleSuggestions } from '@/constants/healthyics';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, ANIMATION } from '@/constants/design-tokens';
import { SectionHeader, Button, Card, Badge } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';

const { width } = Dimensions.get('window');

interface BodyPartButtonProps {
  bodyPart: BodyPart;
  onPress: () => void;
  index: number;
}

const BodyPartButton: React.FC<BodyPartButtonProps> = ({ bodyPart, onPress, index }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    opacity.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getIcon = (iconName: string) => {
    const iconProps = { size: 28, color: bodyPart.color };
    switch (iconName) {
      case 'heart': return <Heart {...iconProps} />;
      case 'kidney': return <Circle {...iconProps} />;
      case 'bone': return <Circle {...iconProps} />;
      case 'user': return <User {...iconProps} />;
      case 'circle': return <Circle {...iconProps} />;
      case 'wind': return <Wind {...iconProps} />;
      case 'eye': return <Eye {...iconProps} />;
      case 'brain': return <Brain {...iconProps} />;
      default: return <Circle {...iconProps} />;
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={styles.bodyPartButton} 
        onPress={handlePress} 
        accessibilityLabel={`Select ${bodyPart.name}`}
        activeOpacity={0.85}
      >
        <View style={[styles.bodyPartIcon, { backgroundColor: `${bodyPart.color}15` }]}>
          {getIcon(bodyPart.icon)}
        </View>
        <Text style={styles.bodyPartLabel}>{bodyPart.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AddPartButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.bodyPartButton} onPress={handlePress} accessibilityLabel="Add new body part">
      <View style={[styles.bodyPartIcon, { backgroundColor: `${COLORS.primary}15` }]}>
        <Plus size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.bodyPartLabel}>Add Part</Text>
    </TouchableOpacity>
  );
};

export default function HealthyicsScreen() {
  const { setCurrentScreen } = useAssistant();
  const insets = useSafeAreaInsets();
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(defaultBodyParts);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAddPartModal, setShowAddPartModal] = useState<boolean>(false);
  const [newPartName, setNewPartName] = useState<string>('');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('healthyics');
    }, [setCurrentScreen])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleBodyPartPress = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIssueDescription('');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!issueDescription.trim() || !selectedBodyPart) {
      Alert.alert('Missing Information', 'Please describe the issue you are experiencing.');
      return;
    }

    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResult: AnalysisResult = {
        nutrients: commonNutrientSuggestions.slice(0, 3),
        lifestyle: commonLifestyleSuggestions.slice(0, 3)
      };
      setAnalysisResult(mockResult);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Analysis Failed', 'Unable to analyze your issue. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddNewPart = () => {
    if (!newPartName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the body part.');
      return;
    }
    const newPart: BodyPart = {
      id: Date.now().toString(),
      name: newPartName,
      icon: 'circle',
      color: COLORS.primary,
      exampleIssue: 'custom issue'
    };
    setBodyParts(prev => [...prev, newPart]);
    setNewPartName('');
    setShowAddPartModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (analysisResult) {
      setAnalysisResult(null);
    } else if (selectedBodyPart) {
      setSelectedBodyPart(null);
      setIssueDescription('');
    }
  };

  const renderMainScreen = () => (
    <>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Healthyics</Text>
            <Text style={styles.headerSubtitle}>Health Analysis & Insights</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowInfoModal(true);
            }} 
            accessibilityLabel="About Healthyics"
          >
            <Info size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.gridContainer}>
          {/* Health Tools */}
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <SectionHeader title="Health Tools" />
            <View style={styles.toolsContainer}>
              <Card 
                variant="elevated" 
                padding="lg" 
                style={styles.toolCard}
                onPress={() => router.push('/food-scanner')}
              >
                <View style={[styles.toolIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Camera size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.toolTitle}>Food Scanner</Text>
                <Text style={styles.toolSubtitle}>Analyze nutrition & health impact</Text>
                <ChevronRight size={16} color={COLORS.textMuted} style={styles.toolArrow} />
              </Card>

              <Card 
                variant="elevated" 
                padding="lg" 
                style={[styles.toolCard, { backgroundColor: COLORS.successMuted }]}
                onPress={() => router.push('/health-buddy')}
              >
                <View style={[styles.toolIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <MessageCircle size={24} color={COLORS.success} />
                </View>
                <Text style={styles.toolTitle}>Health Buddy</Text>
                <Text style={styles.toolSubtitle}>Chat with AI health assistant</Text>
                <ChevronRight size={16} color={COLORS.textMuted} style={styles.toolArrow} />
              </Card>
            </View>
          </Animated.View>

          {/* Body Parts Grid */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <SectionHeader title="Select Body Part or Health Area" />
            <View style={styles.bodyPartsGrid}>
              {bodyParts.map((bodyPart, index) => (
                <BodyPartButton 
                  key={bodyPart.id} 
                  bodyPart={bodyPart} 
                  onPress={() => handleBodyPartPress(bodyPart)}
                  index={index}
                />
              ))}
              <AddPartButton onPress={() => setShowAddPartModal(true)} />
            </View>
          </Animated.View>

          {/* Info Card */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.infoCardContainer}>
            <Card variant="filled" padding="lg" style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Sparkles size={20} color={COLORS.warning} />
                <Text style={styles.infoCardTitle}>How it works</Text>
              </View>
              <Text style={styles.infoCardText}>
                Select a body part, describe your symptoms, and get personalized suggestions for nutrients and lifestyle adjustments.
              </Text>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );

  const renderIssueScreen = () => (
    <>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Go back">
            <ArrowLeft size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{selectedBodyPart?.name} Issue</Text>
            <Badge label="Analysis" variant="primary" />
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.springify()} style={styles.issueContainer}>
          <Card variant="elevated" padding="lg" style={styles.issueCard}>
            <View style={styles.issueHeader}>
              <View style={[styles.selectedPartIcon, { backgroundColor: `${selectedBodyPart?.color}15` }]}>
                <Heart size={24} color={selectedBodyPart?.color || COLORS.primary} />
              </View>
              <View style={styles.issueHeaderText}>
                <Text style={styles.issueTitle}>Describe Your Issue</Text>
                <Text style={styles.issueSubtitle}>Tell us about your {selectedBodyPart?.name.toLowerCase()} concerns</Text>
              </View>
            </View>

            <Text style={styles.exampleText}>
              Example: "{selectedBodyPart?.exampleIssue}"
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Describe the issue you are having..."
              placeholderTextColor={COLORS.textMuted}
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Button
              variant="primary"
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              loading={isAnalyzing}
              fullWidth
              icon={<Sparkles size={18} color={COLORS.textInverse} />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </Card>
        </Animated.View>
      </ScrollView>
    </>
  );

  const renderAnalysisScreen = () => (
    <>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Go back">
            <ArrowLeft size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Health Suggestions</Text>
            <Badge label="Results" variant="success" />
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.analysisContainer}>
          {/* Nutrient Suggestions */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.suggestionSection}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.suggestionHeaderIcon, { backgroundColor: COLORS.successMuted }]}>
                <Leaf size={20} color={COLORS.success} />
              </View>
              <Text style={styles.suggestionTitle}>Nutrient Deficiency Suggestions</Text>
            </View>
            {analysisResult?.nutrients.map((nutrient: any, index: number) => (
              <Animated.View 
                key={nutrient.id} 
                entering={FadeInDown.delay(150 + index * 50).springify()}
              >
                <Card variant="outlined" padding="md" style={styles.suggestionCard}>
                  <View style={styles.suggestionCardContent}>
                    <View style={[styles.suggestionIcon, { backgroundColor: COLORS.successMuted }]}>
                      <Leaf size={16} color={COLORS.success} />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionName}>{nutrient.name}</Text>
                      <Text style={styles.suggestionDescription}>{nutrient.description}</Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Lifestyle Adjustments */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.suggestionSection}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.suggestionHeaderIcon, { backgroundColor: COLORS.primaryMuted }]}>
                <Activity size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.suggestionTitle}>Daily Life Adjustments</Text>
            </View>
            {analysisResult?.lifestyle.map((lifestyle: any, index: number) => (
              <Animated.View 
                key={lifestyle.id} 
                entering={FadeInDown.delay(350 + index * 50).springify()}
              >
                <Card variant="outlined" padding="md" style={styles.suggestionCard}>
                  <View style={styles.suggestionCardContent}>
                    <View style={[styles.suggestionIcon, { backgroundColor: COLORS.primaryMuted }]}>
                      <Activity size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionName}>{lifestyle.title}</Text>
                      <Text style={styles.suggestionDescription}>{lifestyle.description}</Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <Card variant="filled" padding="md" style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>
                These suggestions are for informational purposes only. Please consult a healthcare professional for medical advice.
              </Text>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      {analysisResult ? renderAnalysisScreen() : selectedBodyPart ? renderIssueScreen() : renderMainScreen()}

      {/* Info Modal */}
      <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowInfoModal(false)}>
          <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Healthyics</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} accessibilityLabel="Close">
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Healthyics helps you understand potential nutrient deficiencies and lifestyle adjustments based on health issues you're experiencing. Select a body part, describe your symptoms, and get personalized suggestions for better health.
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Add Part Modal */}
      <Modal visible={showAddPartModal} transparent animationType="fade" onRequestClose={() => setShowAddPartModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddPartModal(false)}>
          <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Body Part</Text>
              <TouchableOpacity onPress={() => setShowAddPartModal(false)} accessibilityLabel="Close">
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter body part name..."
              placeholderTextColor={COLORS.textMuted}
              value={newPartName}
              onChangeText={setNewPartName}
              autoFocus
            />
            <Button variant="primary" onPress={handleAddNewPart} fullWidth>Add Part</Button>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING[4],
    paddingHorizontal: SPACING[5],
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING[1],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING[2],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING[8],
  },
  gridContainer: {
    padding: SPACING[5],
  },
  toolsContainer: {
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  toolCard: {
    position: 'relative',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  toolTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  toolSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  toolArrow: {
    position: 'absolute',
    right: SPACING[4],
    top: '50%',
    marginTop: -8,
  },
  bodyPartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: SPACING[3],
  },
  bodyPartButton: {
    width: (width - SPACING[5] * 2 - SPACING[3] * 2) / 3,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[3],
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bodyPartIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  bodyPartLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  infoCardContainer: {
    marginTop: SPACING[4],
  },
  infoCard: {
    backgroundColor: COLORS.warningMuted,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[2],
  },
  infoCardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#92400E',
  },
  infoCardText: {
    fontSize: FONT_SIZES.sm,
    color: '#92400E',
    lineHeight: 20,
  },
  issueContainer: {
    padding: SPACING[5],
  },
  issueCard: {
    gap: SPACING[4],
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  selectedPartIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueHeaderText: {
    flex: 1,
  },
  issueTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  issueSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  exampleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING[3],
  },
  textInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  analysisContainer: {
    padding: SPACING[5],
  },
  suggestionSection: {
    marginBottom: SPACING[6],
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  suggestionHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  suggestionCard: {
    marginBottom: SPACING[3],
  },
  suggestionCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  suggestionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: COLORS.surfaceMuted,
    marginTop: SPACING[4],
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  modalText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING[4],
  },
});
