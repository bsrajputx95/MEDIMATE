import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { API_BASE_URL } from '@/constants/api';
import {
  Send,
  Bot,
  User,
  Heart,
  Sparkles,
  MessageCircle,
} from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const HEALTH_BUDDY_SYSTEM_PROMPT = `You are a friendly and knowledgeable health buddy AI assistant. Your role is to:

1. Provide helpful health and wellness advice
2. Answer questions about nutrition, exercise, mental health, and general wellness
3. Offer encouragement and motivation for healthy lifestyle choices
4. Suggest practical tips for improving health habits
5. Be supportive and understanding about health challenges

Always:
- Be encouraging and positive
- Provide evidence-based information when possible
- Remind users to consult healthcare professionals for serious concerns
- Keep responses conversational and friendly
- Ask follow-up questions to better understand their needs

Never:
- Provide specific medical diagnoses
- Recommend specific medications
- Replace professional medical advice
- Give advice that could be harmful`;

export default function HealthBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! 👋 I'm your Health Buddy! I'm here to help you with any questions about health, nutrition, fitness, or wellness. What would you like to chat about today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: userMessage.text },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Error',
        'Sorry, I had trouble connecting. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!message.isUser && (
          <View style={styles.aiAvatar}>
            <Bot size={16} color={COLORS.textInverse} />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              message.isUser ? styles.userMessageTime : styles.aiMessageTime,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
        
        {message.isUser && (
          <View style={styles.userAvatar}>
            <User size={16} color={COLORS.textInverse} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Health Buddy',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textInverse,
          headerTitleStyle: {
            fontWeight: FONT_WEIGHTS.bold,
          },
          headerRight: () => (
            <View style={styles.headerRight}>
              <Heart size={20} color={COLORS.textInverse} />
              <Sparkles size={16} color={COLORS.textInverse} />
            </View>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderContent}>
            <View style={styles.chatHeaderAvatar}>
              <MessageCircle size={24} color={COLORS.primary} />
            </View>
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatHeaderTitle}>Health Buddy AI</Text>
              <Text style={styles.chatHeaderSubtitle}>Your personal wellness companion</Text>
            </View>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineStatus} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
            <Bot size={16} color={COLORS.textInverse} />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Health Buddy is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me about health, nutrition, fitness..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <Send size={20} color={COLORS.textInverse} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  chatHeader: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  chatHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderText: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  chatHeaderSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statusIndicator: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING['2xl'],
    paddingBottom: SPACING.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SPACING.sm,
  },
  aiMessageBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  messageText: {
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  userMessageText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.medium,
  },
  aiMessageText: {
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  messageTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  userMessageTime: {
    color: COLORS.border,
  },
  aiMessageTime: {
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderBottomLeftRadius: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});