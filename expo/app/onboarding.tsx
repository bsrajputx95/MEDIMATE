import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Heart,
  Ruler,
  Scale,
  Droplet,
  Activity,
  CheckCircle,
  Sparkles,
  Zap,
  Stethoscope,
  Brain,
  Wind,
  Shield,
  ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalConditions: string[];
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const MEDICAL_CONDITIONS = [
  { name: 'Diabetes', icon: Zap, color: '#F59E0B' },
  { name: 'Hypertension', icon: Heart, color: '#EF4444' },
  { name: 'Cancer', icon: Stethoscope, color: '#8B5CF6' },
  { name: 'Heart Disease', icon: Heart, color: '#EF4444' },
  { name: 'Epilepsy', icon: Brain, color: '#6366F1' },
  { name: 'Asthma', icon: Wind, color: '#06B6D4' },
] as const;

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    gender: 'Male',
    age: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    bloodGroup: 'A+',
    medicalConditions: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { completeOnboarding } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progressValue = useSharedValue(0);

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!data.name.trim()) {
          newErrors.name = 'Please enter your name';
        }
        break;
      case 1:
        if (!data.age || parseInt(data.age) < 1 || parseInt(data.age) > 120) {
          newErrors.age = 'Please enter a valid age (1-120)';
        }
        break;
      case 2:
        if (!data.heightFeet || !data.heightInches) {
          newErrors.height = 'Please enter your height';
        }
        if (!data.weight || parseFloat(data.weight) < 1) {
          newErrors.weight = 'Please enter your weight';
        }
        break;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < TOTAL_STEPS - 1) {
      progressValue.value = withSpring((currentStep + 1) / (TOTAL_STEPS - 1));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      progressValue.value = withSpring((currentStep - 1) / (TOTAL_STEPS - 1));
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await completeOnboarding({
        name: data.name,
        gender: data.gender,
        age: parseInt(data.age),
        height: {
          feet: parseInt(data.heightFeet),
          inches: parseInt(data.heightInches),
        },
        weight: parseFloat(data.weight),
        bloodGroup: data.bloodGroup,
        medicalConditions: data.medicalConditions,
      });
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const toggleMedicalCondition = (condition: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition],
    }));
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={FadeInDown.springify()} style={styles.stepContent}>
            <View style={styles.iconHero}>
              <View style={styles.iconCircle}>
                <User size={40} color={COLORS.textInverse} />
              </View>
              <View style={styles.sparkleBadge}>
                <Sparkles size={16} color={COLORS.warning} />
              </View>
            </View>

            <Text style={styles.stepTitle}>Let's get to know you</Text>
            <Text style={styles.stepSubtitle}>
              We'll personalize your health journey based on your profile
            </Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>What's your name?</Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <User size={20} color={errors.name ? COLORS.error : COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  value={data.name}
                  onChangeText={(text) => {
                    setData(prev => ({ ...prev, name: text }));
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  autoFocus
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      data.gender === gender && styles.genderOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setData(prev => ({ ...prev, gender: gender as any }));
                    }}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      data.gender === gender && styles.genderOptionTextSelected,
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={FadeInDown.springify()} style={styles.stepContent}>
            <View style={styles.iconHero}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.success }]}>
                <Activity size={40} color={COLORS.textInverse} />
              </View>
            </View>

            <Text style={styles.stepTitle}>How old are you?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us calculate age-appropriate health metrics
            </Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Your age</Text>
              <View style={[styles.ageInputWrapper, errors.age && styles.inputError]}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="25"
                  placeholderTextColor={COLORS.textMuted}
                  value={data.age}
                  onChangeText={(text) => {
                    setData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }));
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  autoFocus
                />
                <Text style={styles.ageUnit}>years</Text>
              </View>
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.ageVisual}>
              {[{ range: '18-30', label: 'Young Adult' }, { range: '31-50', label: 'Adult' }, { range: '51+', label: 'Senior' }].map((group) => (
                <View key={group.range} style={styles.ageGroup}>
                  <Text style={styles.ageGroupRange}>{group.range}</Text>
                  <Text style={styles.ageGroupLabel}>{group.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInDown.springify()} style={styles.stepContent}>
            <View style={styles.iconHero}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primary }]}>
                <Ruler size={40} color={COLORS.textInverse} />
              </View>
            </View>

            <Text style={styles.stepTitle}>Body Measurements</Text>
            <Text style={styles.stepSubtitle}>
              We'll use this to calculate your BMI and health metrics
            </Text>

            <View style={styles.measurementsGrid}>
              <View style={styles.measurementCard}>
                <Ruler size={24} color={COLORS.primary} />
                <Text style={styles.measurementLabel}>Height</Text>
                <View style={styles.heightInputs}>
                  <View style={[styles.heightInputBox, errors.height && styles.inputError]}>
                    <TextInput
                      style={styles.heightInput}
                      placeholder="5"
                      placeholderTextColor={COLORS.textMuted}
                      value={data.heightFeet}
                      onChangeText={(text) => {
                        setData(prev => ({ ...prev, heightFeet: text.replace(/[^0-9]/g, '') }));
                        if (errors.height) setErrors({ ...errors, height: '' });
                      }}
                      keyboardType="numeric"
                      maxLength={1}
                    />
                    <Text style={styles.heightUnit}>ft</Text>
                  </View>
                  <View style={[styles.heightInputBox, errors.height && styles.inputError]}>
                    <TextInput
                      style={styles.heightInput}
                      placeholder="8"
                      placeholderTextColor={COLORS.textMuted}
                      value={data.heightInches}
                      onChangeText={(text) => {
                        setData(prev => ({ ...prev, heightInches: text.replace(/[^0-9]/g, '') }));
                        if (errors.height) setErrors({ ...errors, height: '' });
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.heightUnit}>in</Text>
                  </View>
                </View>
                {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>

              <View style={styles.measurementCard}>
                <Scale size={24} color={COLORS.success} />
                <Text style={styles.measurementLabel}>Weight</Text>
                <View style={[styles.weightInputBox, errors.weight && styles.inputError]}>
                  <TextInput
                    style={styles.weightInput}
                    placeholder="70"
                    placeholderTextColor={COLORS.textMuted}
                    value={data.weight}
                    onChangeText={(text) => {
                      setData(prev => ({ ...prev, weight: text.replace(/[^0-9.]/g, '') }));
                      if (errors.weight) setErrors({ ...errors, weight: '' });
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.weightUnit}>kg</Text>
                </View>
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInDown.springify()} style={styles.stepContent}>
            <View style={styles.iconHero}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.error }]}>
                <Droplet size={40} color={COLORS.textInverse} />
              </View>
            </View>

            <Text style={styles.stepTitle}>Blood Group</Text>
            <Text style={styles.stepSubtitle}>
              Important for emergency situations and health tracking
            </Text>

            <View style={styles.bloodGroupGrid}>
              {BLOOD_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.bloodGroupOption,
                    data.bloodGroup === group && styles.bloodGroupSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setData(prev => ({ ...prev, bloodGroup: group }));
                  }}
                >
                  <Text style={[
                    styles.bloodGroupText,
                    data.bloodGroup === group && styles.bloodGroupTextSelected,
                  ]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Shield size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Your blood group helps us provide relevant health insights
              </Text>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInDown.springify()} style={styles.stepContent}>
            <View style={styles.iconHero}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.warning }]}>
                <Heart size={40} color={COLORS.textInverse} />
              </View>
            </View>

            <Text style={styles.stepTitle}>Medical Conditions</Text>
            <Text style={styles.stepSubtitle}>
              Select any conditions that apply (optional)
            </Text>

            <ScrollView style={styles.conditionsList} showsVerticalScrollIndicator={false}>
              {MEDICAL_CONDITIONS.map((condition) => {
                const IconComponent = condition.icon;
                const isSelected = data.medicalConditions.includes(condition.name);
                return (
                  <TouchableOpacity
                    key={condition.name}
                    style={[
                      styles.conditionOption,
                      isSelected && styles.conditionSelected,
                    ]}
                    onPress={() => toggleMedicalCondition(condition.name)}
                  >
                    <View style={styles.conditionLeft}>
                      <View style={[
                        styles.conditionIconBox,
                        { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${condition.color}15` },
                      ]}>
                        <IconComponent size={20} color={condition.color} />
                      </View>
                      <Text style={[
                        styles.conditionName,
                        isSelected && styles.conditionNameSelected,
                      ]}>
                        {condition.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle size={20} color={COLORS.textInverse} />
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.conditionOption,
                  styles.noneOption,
                  data.medicalConditions.length === 0 && styles.conditionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setData(prev => ({ ...prev, medicalConditions: [] }));
                }}
              >
                <Text style={[
                  styles.conditionName,
                  data.medicalConditions.length === 0 && styles.conditionNameSelected,
                ]}>
                  None of the above
                </Text>
                {data.medicalConditions.length === 0 && (
                  <CheckCircle size={20} color={COLORS.textInverse} />
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const FormContainer = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={[styles.formContainer, styles.webFormContainer]}>
          {children}
        </View>
      );
    }
    return (
      <BlurView intensity={20} tint="light" style={styles.formContainer}>
        {children}
      </BlurView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, '#4F46E5', '#3730A3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Progress Header */}
          <View style={[styles.progressHeader, { paddingTop: insets.top + SPACING[4] }]}>
            <TouchableOpacity
              style={[styles.backButton, currentStep === 0 && styles.backButtonHidden]}
              onPress={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={24} color={COLORS.textInverse} />
            </TouchableOpacity>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>

            <Text style={styles.stepIndicator}>
              {currentStep + 1}/{TOTAL_STEPS}
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormContainer>
              {renderStepContent()}
            </FormContainer>
          </ScrollView>

          {/* Navigation Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING[4] }]}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goToNextStep}
              activeOpacity={0.9}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === TOTAL_STEPS - 1 ? 'Get Started' : 'Continue'}
              </Text>
              {currentStep < TOTAL_STEPS - 1 ? (
                <ArrowRight size={20} color={COLORS.primary} />
              ) : (
                <CheckCircle size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[4],
    gap: SPACING[4],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonHidden: {
    opacity: 0,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.textInverse,
    borderRadius: RADIUS.full,
  },
  stepIndicator: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
    minWidth: 40,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[5],
  },
  formContainer: {
    flex: 1,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  webFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  stepContent: {
    padding: SPACING[6],
    alignItems: 'center',
  },
  iconHero: {
    position: 'relative',
    marginBottom: SPACING[6],
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: RADIUS['2xl'],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warningMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  stepTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING[2],
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
    lineHeight: 22,
  },
  inputSection: {
    width: '100%',
    marginBottom: SPACING[5],
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING[3],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorMuted,
  },
  inputIcon: {
    marginRight: SPACING[3],
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING[4],
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING[2],
    marginLeft: SPACING[1],
  },
  genderOptions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  genderOptionTextSelected: {
    color: COLORS.textInverse,
  },
  ageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[5],
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  ageInput: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING[3],
    minWidth: 80,
    textAlign: 'center',
  },
  ageUnit: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginLeft: SPACING[2],
    fontWeight: FONT_WEIGHTS.medium,
  },
  ageVisual: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING[6],
    paddingTop: SPACING[5],
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ageGroup: {
    alignItems: 'center',
  },
  ageGroupRange: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING[1],
  },
  ageGroupLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  measurementsGrid: {
    width: '100%',
    gap: SPACING[4],
  },
  measurementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  measurementLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING[2],
    marginBottom: SPACING[3],
  },
  heightInputs: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  heightInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  heightInput: {
    flex: 1,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING[3],
    textAlign: 'center',
  },
  heightUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  weightInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  weightInput: {
    flex: 1,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING[3],
    textAlign: 'center',
  },
  weightUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[5],
  },
  bloodGroupOption: {
    width: (width - SPACING[5] * 2 - SPACING[3] * 3) / 4,
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  bloodGroupSelected: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  bloodGroupText: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
  },
  bloodGroupTextSelected: {
    color: COLORS.textInverse,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    gap: SPACING[3],
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  conditionsList: {
    width: '100%',
    maxHeight: 320,
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[3],
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  conditionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  conditionName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  conditionNameSelected: {
    color: COLORS.textInverse,
  },
  noneOption: {
    justifyContent: 'center',
    marginTop: SPACING[2],
  },
  footer: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textInverse,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING[4],
    gap: SPACING[2],
    ...SHADOWS.lg,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
});
