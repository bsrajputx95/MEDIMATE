import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@medimate:settings';

export interface UserSettings {
  // Notifications
  notificationsEnabled: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  communityUpdates: boolean;
  
  // Privacy
  shareHealthData: boolean;
  shareActivityData: boolean;
  analyticsEnabled: boolean;
  
  // Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
  units: 'metric' | 'imperial';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  
  // Health Goals
  dailyStepGoal: number;
  dailyWaterGoal: number; // in liters
  dailyCalorieGoal: number;
  weeklyExerciseGoal: number; // in minutes
  
  // Reminders
  waterReminderEnabled: boolean;
  waterReminderInterval: number; // in minutes
  exerciseReminderEnabled: boolean;
  exerciseReminderTime: string;
  
  // Accessibility
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
  soundEffects: boolean;
  
  // Data
  lastSyncDate: string | null;
  autoSync: boolean;
  syncOverWifiOnly: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  // Notifications
  notificationsEnabled: true,
  medicationReminders: true,
  appointmentReminders: true,
  healthTips: true,
  communityUpdates: false,
  
  // Privacy
  shareHealthData: false,
  shareActivityData: false,
  analyticsEnabled: true,
  
  // Preferences
  theme: 'system',
  language: 'en',
  units: 'metric',
  dateFormat: 'MM/DD/YYYY',
  
  // Health Goals
  dailyStepGoal: 10000,
  dailyWaterGoal: 2.5,
  dailyCalorieGoal: 2000,
  weeklyExerciseGoal: 150,
  
  // Reminders
  waterReminderEnabled: true,
  waterReminderInterval: 60,
  exerciseReminderEnabled: true,
  exerciseReminderTime: '07:00',
  
  // Accessibility
  fontSize: 'medium',
  hapticFeedback: true,
  soundEffects: true,
  
  // Data
  lastSyncDate: null,
  autoSync: true,
  syncOverWifiOnly: false,
};

class SettingsService {
  private static instance: SettingsService;
  private settings: UserSettings | null = null;
  private listeners: ((settings: UserSettings) => void)[] = [];

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // Load settings from storage
  async loadSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }
      return this.settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
      return this.settings;
    }
  }

  // Get current settings
  getSettings(): UserSettings {
    if (!this.settings) {
      this.loadSettings();
      return { ...DEFAULT_SETTINGS };
    }
    return this.settings;
  }

  // Save settings
  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings!, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  // Update a single setting
  async updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): Promise<void> {
    await this.saveSettings({ [key]: value });
  }

  // Reset to defaults
  async resetToDefaults(): Promise<void> {
    try {
      this.settings = { ...DEFAULT_SETTINGS };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    if (this.settings) {
      this.listeners.forEach(listener => listener(this.settings!));
    }
  }

  // Export settings
  async exportSettings(): Promise<string> {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  // Import settings
  async importSettings(jsonData: string): Promise<boolean> {
    try {
      const settings = JSON.parse(jsonData);
      await this.saveSettings({ ...DEFAULT_SETTINGS, ...settings });
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Get a specific setting
  get<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.getSettings()[key];
  }

  // Check if notifications are enabled
  areNotificationsEnabled(): boolean {
    return this.get('notificationsEnabled');
  }

  // Get health goals
  getHealthGoals() {
    const settings = this.getSettings();
    return {
      steps: settings.dailyStepGoal,
      water: settings.dailyWaterGoal,
      calories: settings.dailyCalorieGoal,
      exercise: settings.weeklyExerciseGoal,
    };
  }

  // Update health goals
  async updateHealthGoals(goals: {
    steps?: number;
    water?: number;
    calories?: number;
    exercise?: number;
  }): Promise<void> {
    const updates: Partial<UserSettings> = {};
    if (goals.steps !== undefined) updates.dailyStepGoal = goals.steps;
    if (goals.water !== undefined) updates.dailyWaterGoal = goals.water;
    if (goals.calories !== undefined) updates.dailyCalorieGoal = goals.calories;
    if (goals.exercise !== undefined) updates.weeklyExerciseGoal = goals.exercise;
    await this.saveSettings(updates);
  }
}

export const settingsService = SettingsService.getInstance();
export default settingsService;
