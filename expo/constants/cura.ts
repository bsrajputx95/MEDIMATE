import { Appointment, TestReport, Medication, Doctor, TreatmentPlan } from '../types/cura';

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    date: new Date(2025, 0, 15, 10, 30),
    time: '10:30 AM',
    type: 'consultation',
    status: 'upcoming',
    location: 'Heart Care Clinic, Room 205',
    notes: 'Follow-up for blood pressure monitoring'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'General Physician',
    date: new Date(2025, 0, 18, 14, 0),
    time: '2:00 PM',
    type: 'checkup',
    status: 'upcoming',
    location: 'City Medical Center'
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Dermatologist',
    date: new Date(2025, 0, 10, 9, 15),
    time: '9:15 AM',
    type: 'consultation',
    status: 'completed',
    location: 'Skin Health Clinic'
  }
];

export const mockTestReports: TestReport[] = [
  {
    id: '1',
    testName: 'Complete Blood Count (CBC)',
    testType: 'blood',
    date: new Date(2025, 0, 8),
    doctorName: 'Dr. Sarah Johnson',
    clinic: 'LabCorp Diagnostics',
    status: 'completed',
    results: 'All values within normal range',
    normalRange: 'WBC: 4.5-11.0, RBC: 4.5-5.9',
    value: 'WBC: 7.2, RBC: 5.1'
  },
  {
    id: '2',
    testName: 'Chest X-Ray',
    testType: 'x-ray',
    date: new Date(2025, 0, 5),
    doctorName: 'Dr. Michael Chen',
    clinic: 'Radiology Associates',
    status: 'completed',
    results: 'Clear lungs, no abnormalities detected'
  },
  {
    id: '3',
    testName: 'Lipid Panel',
    testType: 'blood',
    date: new Date(2025, 0, 12),
    doctorName: 'Dr. Sarah Johnson',
    clinic: 'Quest Diagnostics',
    status: 'pending'
  }
];

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: new Date(2025, 0, 1),
    instructions: 'Take with food in the morning',
    reminderTimes: ['08:00'],
    taken: true
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    prescribedBy: 'Dr. Michael Chen',
    startDate: new Date(2024, 11, 15),
    instructions: 'Take with meals',
    reminderTimes: ['08:00', '20:00'],
    taken: false
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Emily Rodriguez',
    startDate: new Date(2024, 11, 20),
    instructions: 'Take with fatty meal for better absorption',
    reminderTimes: ['12:00'],
    taken: true
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.8,
    experience: '15 years',
    location: 'Heart Care Clinic',
    availability: 'Available today',
    consultationFee: 150,
    languages: ['English', 'Spanish']
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'General Physician',
    rating: 4.9,
    experience: '12 years',
    location: 'City Medical Center',
    availability: 'Next available: Tomorrow',
    consultationFee: 120,
    languages: ['English', 'Mandarin']
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatologist',
    rating: 4.7,
    experience: '10 years',
    location: 'Skin Health Clinic',
    availability: 'Available in 2 days',
    consultationFee: 180,
    languages: ['English', 'Spanish', 'Portuguese']
  }
];

export const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: '1',
    title: 'Hypertension Management',
    description: 'Comprehensive plan to manage blood pressure through medication and lifestyle changes',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 2, 31),
    progress: 65,
    prescribedBy: 'Dr. Sarah Johnson',
    milestones: [
      {
        id: '1',
        title: 'Initial Assessment',
        description: 'Complete medical history and baseline measurements',
        dueDate: new Date(2025, 0, 5),
        completed: true,
        completedDate: new Date(2025, 0, 3)
      },
      {
        id: '2',
        title: 'Medication Adjustment',
        description: 'Review and adjust medication dosage based on response',
        dueDate: new Date(2025, 0, 20),
        completed: true,
        completedDate: new Date(2025, 0, 18)
      },
      {
        id: '3',
        title: 'Lifestyle Counseling',
        description: 'Dietary and exercise recommendations',
        dueDate: new Date(2025, 1, 1),
        completed: false
      }
    ]
  }
];

export const specialties = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedist',
  'Pediatrician',
  'Psychiatrist',
  'Gynecologist',
  'Urologist',
  'Ophthalmologist'
];

export const testTypes = [
  { label: 'Blood Test', value: 'blood', icon: '🩸' },
  { label: 'Urine Test', value: 'urine', icon: '🧪' },
  { label: 'X-Ray', value: 'x-ray', icon: '🦴' },
  { label: 'MRI Scan', value: 'mri', icon: '🧠' },
  { label: 'CT Scan', value: 'ct', icon: '📷' },
  { label: 'Lab Work', value: 'lab', icon: '🔬' },
  { label: 'Diagnostic', value: 'diagnostic', icon: '📋' },
  { label: 'Scan', value: 'scan', icon: '📡' }
];