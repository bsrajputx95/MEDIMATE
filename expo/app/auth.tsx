import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, ANIMATION } from '@/constants/design-tokens';
import { Heart, Mail, Lock, User, Sparkles, ArrowRight, Shield } from 'lucide-react-native';
import { Button, Card } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const { login, signup, loginAsGuest } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await loginAsGuest();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Guest login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLogin(!isLogin);
    setErrors({});
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
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING[6] }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View 
              entering={FadeInUp.delay(100).springify()}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconInner}>
                  <Heart size={36} color={COLORS.textInverse} fill={COLORS.textInverse} />
                </View>
                <View style={styles.sparkleContainer}>
                  <Sparkles size={20} color={COLORS.warning} />
                </View>
              </View>
              <Text style={styles.title}>MediMate</Text>
              <Text style={styles.subtitle}>
                Your AI-powered health companion
              </Text>
            </Animated.View>

            {/* Auth Form */}
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <FormContainer>
                <View style={styles.form}>
                  <Text style={styles.formTitle}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </Text>
                  <Text style={styles.formSubtitle}>
                    {isLogin
                      ? 'Sign in to continue your health journey'
                      : 'Join thousands improving their health'}
                  </Text>

                  {/* Name Input (Register only) */}
                  {!isLogin && (
                    <Animated.View entering={FadeInDown.springify()}>
                      <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                        <User size={20} color={errors.name ? COLORS.error : COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Full Name"
                          placeholderTextColor={COLORS.textMuted}
                          value={name}
                          onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors({ ...errors, name: undefined });
                          }}
                          autoCapitalize="words"
                          autoComplete="name"
                        />
                      </View>
                      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </Animated.View>
                  )}

                  {/* Email Input */}
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <Mail size={20} color={errors.email ? COLORS.error : COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  {/* Password Input */}
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <Lock size={20} color={errors.password ? COLORS.error : COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry
                      autoComplete="password"
                    />
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  {/* Forgot Password (Login only) */}
                  {isLogin && (
                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                  )}

                  {/* Auth Button */}
                  <TouchableOpacity
                    style={styles.authButton}
                    onPress={handleAuth}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.textInverse} />
                    ) : (
                      <>
                        <Text style={styles.authButtonText}>
                          {isLogin ? 'Sign In' : 'Create Account'}
                        </Text>
                        <ArrowRight size={18} color={COLORS.textInverse} />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Toggle Mode */}
                  <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                    <Text style={styles.toggleText}>
                      {isLogin
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                      <Text style={styles.toggleLink}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Guest Login */}
                  <TouchableOpacity
                    style={styles.guestButton}
                    onPress={handleGuestLogin}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <Shield size={20} color={COLORS.primary} />
                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                  </TouchableOpacity>
                </View>
              </FormContainer>
            </Animated.View>

            {/* Terms */}
            <Animated.View 
              entering={FadeInUp.delay(300).springify()}
              style={styles.termsContainer}
            >
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING[4],
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: RADIUS['2xl'],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  sparkleContainer: {
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
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textInverse,
    marginBottom: SPACING[2],
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.medium,
  },
  formContainer: {
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  webFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
  },
  form: {
    padding: SPACING[6],
  },
  formTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  formSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[1],
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
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING[4],
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginBottom: SPACING[2],
    marginLeft: SPACING[1],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING[4],
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[2],
    marginTop: SPACING[2],
    ...SHADOWS.md,
  },
  authButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: SPACING[5],
  },
  toggleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  toggleLink: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING[4],
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: SPACING[2],
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  termsContainer: {
    marginTop: SPACING[6],
    paddingHorizontal: SPACING[4],
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
    textDecorationLine: 'underline',
  },
});
