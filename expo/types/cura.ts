export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  type: 'consultation' | 'follow-up' | 'checkup' | 'emergency';
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
}

export interface TestReport {
  id: string;
  testName: string;
  testType: 'lab' | 'diagnostic' | 'scan' | 'blood' | 'urine' | 'x-ray' | 'mri' | 'ct';
  date: Date;
  doctorName: string;
  clinic: string;
  status: 'completed' | 'pending' | 'in-progress';
  results?: string;
  fileUrl?: string;
  normalRange?: string;
  value?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
  reminderTimes: string[];
  taken: boolean;
  sideEffects?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  availability: string;
  consultationFee: number;
  profileImage?: string;
  languages: string[];
}

export interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  progress: number;
  milestones: Milestone[];
  prescribedBy: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}