import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types/chat';

const CHAT_HISTORY_KEY = '@medimate:chat_history';
const MAX_MESSAGES = 100; // Limit stored messages

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

class ChatPersistenceService {
  private static instance: ChatPersistenceService;

  private constructor() {}

  static getInstance(): ChatPersistenceService {
    if (!ChatPersistenceService.instance) {
      ChatPersistenceService.instance = new ChatPersistenceService();
    }
    return ChatPersistenceService.instance;
  }

  // Save a message to history
  async saveMessage(sessionId: string, message: Message): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex >= 0) {
        // Add message to existing session
        sessions[sessionIndex].messages.push(message);
        sessions[sessionIndex].updatedAt = new Date().toISOString();

        // Limit messages per session
        if (sessions[sessionIndex].messages.length > MAX_MESSAGES) {
          sessions[sessionIndex].messages = sessions[sessionIndex].messages.slice(-MAX_MESSAGES);
        }
      } else {
        // Create new session
        sessions.push({
          id: sessionId,
          messages: [message],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  // Save multiple messages at once
  async saveMessages(sessionId: string, messages: Message[]): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex >= 0) {
        sessions[sessionIndex].messages = [
          ...sessions[sessionIndex].messages,
          ...messages,
        ].slice(-MAX_MESSAGES);
        sessions[sessionIndex].updatedAt = new Date().toISOString();
      } else {
        sessions.push({
          id: sessionId,
          messages: messages.slice(-MAX_MESSAGES),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  // Get messages for a session
  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const sessions = await this.getAllSessions();
      const session = sessions.find(s => s.id === sessionId);
      return session?.messages || [];
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  // Get all sessions
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  // Get recent sessions (sorted by last updated)
  async getRecentSessions(limit: number = 10): Promise<ChatSession[]> {
    try {
      const sessions = await this.getAllSessions();
      return sessions
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  }

  // Delete a session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  // Clear all chat history
  async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  // Search messages
  async searchMessages(query: string): Promise<{ session: ChatSession; messages: Message[] }[]> {
    try {
      const sessions = await this.getAllSessions();
      const results: { session: ChatSession; messages: Message[] }[] = [];

      for (const session of sessions) {
        const matchingMessages = session.messages.filter(m =>
          m.text.toLowerCase().includes(query.toLowerCase())
        );
        if (matchingMessages.length > 0) {
          results.push({ session, messages: matchingMessages });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }

  // Export chat history
  async exportHistory(): Promise<string> {
    try {
      const sessions = await this.getAllSessions();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('Failed to export history:', error);
      return '[]';
    }
  }

  // Import chat history
  async importHistory(jsonData: string): Promise<boolean> {
    try {
      const sessions = JSON.parse(jsonData);
      if (Array.isArray(sessions)) {
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }
}

export const chatPersistence = ChatPersistenceService.getInstance();
export default chatPersistence;
