export interface PersonalInfo {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  profilePhoto?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface HealthBasics {
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  chronicConditions: string[];
  riskFactors: {
    smoking: boolean;
    alcohol: 'None' | 'Occasional' | 'Regular' | 'Heavy';
    familyHistory: string[];
  };
  currentDiagnoses: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    type: 'Prescription' | 'Over-the-counter';
  }[];
}

export interface VitalsStats {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    date: string;
  }[];
  restingHeartRate: number;
  weight: number;
  height: { feet: number; inches: number };
  bmi: number;
  latestLabResults: {
    test: string;
    value: string;
    normalRange: string;
    date: string;
  }[];
}

export interface RiskTracker {
  heartRisk: {
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    factors: string[];
  };
  diabetesRisk: {
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    factors: string[];
  };
  kidneyRisk: {
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    factors: string[];
  };
  customRisks: {
    name: string;
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    factors: string[];
  }[];
}

export interface HealthGoal {
  id: string;
  type: 'Steps' | 'Weight' | 'Water' | 'Exercise' | 'Diet' | 'Custom';
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'Fitness' | 'Health' | 'Consistency' | 'Milestone';
}

export interface MedicalRecord {
  id: string;
  type: 'Report' | 'Prescription' | 'Vaccination' | 'Surgery' | 'Other';
  title: string;
  date: string;
  description: string;
  fileUrl?: string;
  tags: string[];
}

export interface AppSettings {
  notifications: {
    appointments: boolean;
    medications: boolean;
    healthAlerts: boolean;
    goals: boolean;
    community: boolean;
  };
  language: string;
  accessibility: {
    fontSize: 'Small' | 'Medium' | 'Large';
    highContrast: boolean;
    voiceOver: boolean;
  };
  privacy: {
    shareData: boolean;
    anonymousAnalytics: boolean;
  };
}

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  healthBasics: HealthBasics;
  vitalsStats: VitalsStats;
  riskTracker: RiskTracker;
  healthGoals: HealthGoal[];
  achievements: Achievement[];
  medicalRecords: MedicalRecord[];
  appSettings: AppSettings;
  isGuest: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}