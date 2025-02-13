import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  Upload,
  Type,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Utensils,
  Zap,
  Leaf,
  X,
} from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { SectionHeader, ProgressBar, Badge } from '@/components/ui';
import { API_BASE_URL } from '@/constants/api';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface FoodAnalysis {
  foodName: string;
  nutrition: NutritionInfo;
  healthScore: number;
  benefits: string[];
  concerns: string[];
  recommendations: string[];
}

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export default function FoodScanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState<boolean>(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);

  const mealTypes: { type: MealType; label: string; icon: string; time: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅', time: '6:00 - 10:00 AM' },
    { type: 'lunch', label: 'Lunch', icon: '☀️', time: '12:00 - 2:00 PM' },
    { type: 'snack', label: 'Snack', icon: '🍎', time: 'Anytime' },
    { type: 'dinner', label: 'Dinner', icon: '🌙', time: '6:00 - 9:00 PM' },
  ];

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
          console.log('📸 Photo captured:', photo.uri);
        }
      } catch (error) {
        console.error('❌ Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        console.log('🖼️ Image selected from gallery');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const analyzeFood = async () => {
    if (!capturedImage && !textDescription.trim()) {
      Alert.alert('Missing Information', 'Please provide either an image or description of the food.');
      return;
    }

    setIsAnalyzing(true);
    console.log('🔍 Starting food analysis with Perplexity API...');

    try {
      let requestBody: any = {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert with access to current nutritional databases. Analyze the food and provide detailed nutritional information in JSON format. 
            
            Return ONLY a valid JSON object with this exact structure:
            {
              "foodName": "string",
              "nutrition": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "fiber": number,
                "sugar": number,
                "sodium": number
              },
              "healthScore": number (1-100),
              "benefits": ["string", "string"],
              "concerns": ["string", "string"],
              "recommendations": ["string", "string"]
            }
            
            Provide realistic nutritional values for a typical serving size. Health score should reflect overall nutritional value. Use current nutritional data and research.`
          }
        ]
      };

      if (capturedImage) {
        // For image analysis, convert image to base64 if needed
        let imageData = capturedImage;
        if (capturedImage.startsWith('file://')) {
          // Convert file URI to base64
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
        
        requestBody.messages.push({
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this food image for detailed nutritional content and provide health insights.' },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        });
      } else {
        requestBody.messages.push({
          role: 'user',
          content: `Analyze this food description for detailed nutritional content: ${textDescription}`
        });
      }

      console.log('📡 Sending request to food analysis API...');
      const response = await fetch(`${API_BASE_URL}/api/food/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage || undefined,
          description: textDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Perplexity API error:', response.status, errorText);
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🤖 Perplexity Response:', data);
      
      const completion = data.choices?.[0]?.message?.content;
      if (!completion) {
        throw new Error('No completion received from Perplexity API');
      }
      
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : completion;
        const analysisData = JSON.parse(jsonString);
        setAnalysisResult(analysisData);
        console.log('✅ Food analysis completed:', analysisData);
      } catch (parseError) {
        console.error('❌ Error parsing analysis result:', parseError);
        console.log('Raw completion:', completion);
        throw new Error('Failed to parse analysis result');
      }
    } catch (error) {
      console.error('❌ Error analyzing food:', error);
      Alert.alert('Analysis Failed', 'Unable to analyze the food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveFoodEntry = () => {
    if (!selectedMealType || !analysisResult) return;
    
    console.log('💾 Saving food entry:', {
      mealType: selectedMealType,
      food: analysisResult.foodName,
      nutrition: analysisResult.nutrition,
      timestamp: new Date().toISOString(),
    });
    
    Alert.alert(
      'Food Saved!',
      `${analysisResult.foodName} has been added to your ${selectedMealType} log.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setTextDescription('');
    setAnalysisResult(null);
    setSelectedMealType(null);
    setShowMealTypeModal(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContainer}>
          <Camera size={64} color={COLORS.primary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan food items for nutritional analysis.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraBackButton}
                onPress={() => setShowCamera(false)}
              >
                <ArrowLeft size={24} color={COLORS.textInverse} />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan Food</Text>
              <TouchableOpacity
                style={styles.cameraFlipButton}
                onPress={() => setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'))}
              >
                <Camera size={24} color={COLORS.textInverse} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraGuide}>
              <View style={styles.cameraFrame} />
              <Text style={styles.cameraGuideText}>Position food within the frame</Text>
            </View>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Food Scanner',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { fontWeight: FONT_WEIGHTS.bold, color: COLORS.textPrimary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {!analysisResult ? (
          <>
            {/* Input Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How would you like to add food?</Text>
              
              <View style={styles.inputOptionsContainer}>
                <TouchableOpacity 
                  style={styles.inputOption}
                  onPress={() => setShowCamera(true)}
                >
                  <View style={styles.inputOptionIcon}>
                    <Camera size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.inputOptionTitle}>Take Photo</Text>
                  <Text style={styles.inputOptionSubtitle}>Capture food with camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.inputOption}
                  onPress={pickImage}
                >
                  <View style={styles.inputOptionIcon}>
                    <Upload size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.inputOptionTitle}>Upload Image</Text>
                  <Text style={styles.inputOptionSubtitle}>Select from gallery</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <View style={styles.textInputContainer}>
                <View style={styles.textInputHeader}>
                  <Type size={20} color={COLORS.primary} />
                  <Text style={styles.textInputTitle}>Describe Your Food</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
                  placeholderTextColor={COLORS.textMuted}
                  value={textDescription}
                  onChangeText={setTextDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Preview */}
            {capturedImage && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Food Image</Text>
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setCapturedImage(null)}
                  >
                    <X size={16} color={COLORS.textInverse} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Analyze Button */}
            {(capturedImage || textDescription.trim()) && (
              <View style={styles.section}>
                <TouchableOpacity 
                  style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                  onPress={analyzeFood}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.textInverse} style={{ marginRight: 8 }} />
                      <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Zap size={20} color={COLORS.textInverse} style={{ marginRight: 8 }} />
                      <Text style={styles.analyzeButtonText}>Analyze Food</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <View style={styles.section}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{analysisResult.foodName}</Text>
                <View style={styles.healthScoreBadge}>
                  <Text style={styles.healthScoreText}>{analysisResult.healthScore}/100</Text>
                </View>
              </View>
              
              {capturedImage && (
                <Image source={{ uri: capturedImage }} style={styles.resultImage} />
              )}
            </View>
            
            {/* Nutrition Facts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.calories} kcal</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.protein}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Carbohydrates</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.carbs}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.fat}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fiber</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.fiber}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Sugar</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.sugar}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Sodium</Text>
                  <Text style={styles.nutritionValue}>{analysisResult.nutrition.sodium}mg</Text>
                </View>
              </View>
            </View>
            
            {/* Health Benefits */}
            {analysisResult.benefits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Benefits</Text>
                <View style={styles.benefitsCard}>
                  {analysisResult.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <CheckCircle size={16} color={COLORS.success} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Health Concerns */}
            {analysisResult.concerns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Considerations</Text>
                <View style={styles.concernsCard}>
                  {analysisResult.concerns.map((concern, index) => (
                    <View key={index} style={styles.concernItem}>
                      <AlertTriangle size={16} color={COLORS.warning} />
                      <Text style={styles.concernText}>{concern}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <View style={styles.recommendationsCard}>
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Leaf size={16} color={COLORS.primary} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Action Buttons */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.addToMealButton}
                onPress={() => setShowMealTypeModal(true)}
              >
                <Utensils size={20} color={COLORS.textInverse} style={{ marginRight: 8 }} />
                <Text style={styles.addToMealButtonText}>Add to Meal Log</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.scanAnotherButton}
                onPress={resetScanner}
              >
                <Text style={styles.scanAnotherButtonText}>Scan Another Food</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Meal Type Selection Modal */}
      <Modal
        visible={showMealTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMealTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Meal Type</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowMealTypeModal(false)}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealTypeOptions}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal.type}
                  style={[
                    styles.mealTypeOption,
                    selectedMealType === meal.type && styles.mealTypeOptionSelected
                  ]}
                  onPress={() => setSelectedMealType(meal.type)}
                >
                  <View style={styles.mealTypeInfo}>
                    <Text style={styles.mealTypeEmoji}>{meal.icon}</Text>
                    <View style={styles.mealTypeDetails}>
                      <Text style={styles.mealTypeLabel}>{meal.label}</Text>
                      <Text style={styles.mealTypeTime}>{meal.time}</Text>
                    </View>
                  </View>
                  {selectedMealType === meal.type && (
                    <CheckCircle size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.confirmMealButton,
                !selectedMealType && styles.confirmMealButtonDisabled
              ]}
              onPress={saveFoodEntry}
              disabled={!selectedMealType}
            >
              <Text style={styles.confirmMealButtonText}>Add to {selectedMealType || 'Meal'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    gap: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['3xl'],
    gap: SPACING['2xl'],
  },
  permissionTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  permissionButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  headerBackButton: {
    padding: SPACING.sm,
    marginLeft: -8,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING['2xl'],
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputOptionsContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  inputOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  inputOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputOptionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputOptionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingHorizontal: SPACING.lg,
  },
  textInputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  textInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  textInputTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  textInput: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  healthScoreBadge: {
    backgroundColor: COLORS.successMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  healthScoreText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.success,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  nutritionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderMuted,
  },
  nutritionLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  nutritionValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  benefitsCard: {
    backgroundColor: COLORS.successMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#166534',
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
  },
  concernsCard: {
    backgroundColor: COLORS.warningMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  concernText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  recommendationText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#581C87',
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
  },
  addToMealButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addToMealButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  scanAnotherButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scanAnotherButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING['3xl'],
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  cameraBackButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  cameraFlipButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  cameraFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: COLORS.textInverse,
    borderRadius: RADIUS.xl,
    backgroundColor: 'transparent',
  },
  cameraGuideText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  cameraControls: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textInverse,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  mealTypeOptions: {
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  mealTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeOptionSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeEmoji: {
    fontSize: FONT_SIZES['2xl'],
    marginRight: SPACING.lg,
  },
  mealTypeDetails: {
    flex: 1,
  },
  mealTypeLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mealTypeTime: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  confirmMealButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  confirmMealButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  confirmMealButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
});