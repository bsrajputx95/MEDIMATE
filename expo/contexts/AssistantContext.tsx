import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';

interface AssistantContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  speakScreenDescription: () => void;
  isSpeaking: boolean;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

interface AssistantProviderProps {
  children: React.ReactNode;
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('Home');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const getScreenDescription = useCallback((screen: string): string => {
    switch (screen.toLowerCase()) {
      case 'home':
      case 'index':
        return 'Welcome to your Health Dashboard! Here you can see your daily overview including steps, heart rate, water intake, and calories. You can scan food for instant nutrition analysis, chat with health experts, track your meals throughout the day, and view your personalized health report with recommendations and tips.';
      
      case 'cura':
        return 'Welcome to CURA, your medical management hub! Here you can view your upcoming appointments, access test reports and lab results, manage your medications and prescriptions, find doctors and specialists, and track your treatment plans and medical history.';
      
      case 'healthyics':
        return 'Welcome to Healthyics, your nutrition and fitness analytics center! Here you can track detailed nutrition information, view fitness trends and progress charts, analyze your eating patterns, set and monitor health goals, and get insights into your wellness journey.';
      
      case 'medtalk':
        return 'Welcome to MedTalk, your health community platform! Here you can join health discussions and support groups, ask questions to medical experts, participate in health challenges, share your wellness journey, and connect with others on similar health paths.';
      
      case 'profile':
        return 'Welcome to your Profile section! Here you can view and edit your personal information, manage your health goals and preferences, review your medical history, adjust app settings and notifications, and track your overall health progress and achievements.';
      
      default:
        return `You are currently on the ${screen} screen. This section contains various health-related features and information to help you manage your wellness journey.`;
    }
  }, []);

  const speakScreenDescription = useCallback(async () => {
    if (isSpeaking) {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
      setIsSpeaking(false);
      return;
    }

    console.log('🤖 Current screen:', currentScreen);
    const description = getScreenDescription(currentScreen);
    console.log('🤖 Description:', description.substring(0, 100) + '...');
    
    if (Platform.OS === 'web') {
      // Web fallback - show alert with description
      Alert.alert(
        '🤖 Health Assistant',
        description,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      // Native speech synthesis
      setIsSpeaking(true);
      
      try {
        await Speech.speak(description, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,

          onStart: () => {
            console.log('🤖 Assistant started speaking');
          },
          onDone: () => {
            console.log('🤖 Assistant finished speaking');
            setIsSpeaking(false);
          },
          onStopped: () => {
            console.log('🤖 Assistant stopped speaking');
            setIsSpeaking(false);
          },
          onError: (error: any) => {
            console.error('🤖 Assistant speech error:', error);
            setIsSpeaking(false);
            // Fallback to alert on error
            Alert.alert(
              '🤖 Health Assistant',
              description,
              [{ text: 'OK', style: 'default' }]
            );
          },
        });
      } catch (error) {
        console.error('🤖 Speech synthesis error:', error);
        setIsSpeaking(false);
        // Fallback to alert
        Alert.alert(
          '🤖 Health Assistant',
          description,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  }, [currentScreen, isSpeaking, getScreenDescription]);

  const value: AssistantContextType = {
    currentScreen,
    setCurrentScreen,
    speakScreenDescription,
    isSpeaking,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};