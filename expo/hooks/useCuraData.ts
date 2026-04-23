import { useApi, useMutation, usePaginatedApi } from './useApiData';
import { curaApi } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface Appointment {
  id: string;
  doctorName: string;
  doctorAvatar?: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects?: string[];
  reminderTimes: string[];
  taken: boolean;
}

export interface TestReport {
  id: string;
  testName: string;
  testType: string;
  date: string;
  doctorName: string;
  clinic: string;
  status: 'pending' | 'completed' | 'reviewed';
  results?: string;
  value?: string;
  normalRange?: string;
}

export interface Doctor {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  availability: string;
  consultationFee: number;
  languages: string[];
}

export interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
  }>;
  progress: number;
}

// ============================================================================
// Appointments Hook
// ============================================================================

export function useAppointments() {
  const { data, isLoading, error, refetch } = useApi<Appointment[]>(
    async () => {
      const appointments = await curaApi.getAppointments();
      return appointments.map(apt => ({
        ...apt,
        status: apt.status as Appointment['status'],
      }));
    }
  );

  const createAppointment = useMutation(
    async (params: {
      doctorId: string;
      date: string;
      time: string;
      type: string;
      notes?: string;
    }) => {
      const result = await curaApi.createAppointment(params);
      refetch();
      return result;
    }
  );

  const updateAppointment = useMutation(
    async (params: { id: string; date?: string; time?: string; notes?: string }) => {
      const result = await curaApi.updateAppointment(params.id, params);
      refetch();
      return result;
    }
  );

  const cancelAppointment = useMutation(
    async (params: { id: string }) => {
      await curaApi.cancelAppointment(params.id);
      refetch();
    }
  );

  const upcomingAppointments = data?.filter(apt => apt.status === 'upcoming') || [];
  const pastAppointments = data?.filter(apt => apt.status === 'completed') || [];

  return {
    appointments: data || [],
    upcomingAppointments,
    pastAppointments,
    isLoading,
    error,
    refetch,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
}

// ============================================================================
// Medications Hook
// ============================================================================

export function useMedications() {
  const { data, isLoading, error, refetch } = useApi<Medication[]>(
    async () => {
      const medications = await curaApi.getMedications();
      return medications.map(med => ({
        ...med,
        taken: med.taken || false,
      }));
    }
  );

  const createMedication = useMutation(
    async (params: {
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      instructions: string;
      reminderTimes?: string[];
    }) => {
      const result = await curaApi.createMedication(params);
      refetch();
      return result;
    }
  );

  const updateMedication = useMutation(
    async (params: { id: string; taken?: boolean; reminderTimes?: string[] }) => {
      const result = await curaApi.updateMedication(params.id, params);
      refetch();
      return result;
    }
  );

  const deleteMedication = useMutation(
    async (params: { id: string }) => {
      await curaApi.deleteMedication(params.id);
      refetch();
    }
  );

  const toggleMedicationTaken = useMutation(
    async (params: { id: string; taken: boolean }) => {
      const result = await curaApi.updateMedication(params.id, { taken: params.taken });
      refetch();
      return result;
    }
  );

  const todaysMedications = data || [];
  const takenCount = todaysMedications.filter(m => m.taken).length;

  return {
    medications: data || [],
    todaysMedications,
    takenCount,
    totalMedications: todaysMedications.length,
    isLoading,
    error,
    refetch,
    createMedication,
    updateMedication,
    deleteMedication,
    toggleMedicationTaken,
  };
}

// ============================================================================
// Test Reports Hook
// ============================================================================

export function useTestReports() {
  const { data, isLoading, error, refetch } = useApi<TestReport[]>(
    async () => {
      const reports = await curaApi.getTestReports();
      return reports.map(report => ({
        ...report,
        status: report.status as TestReport['status'],
      }));
    }
  );

  const pendingReports = data?.filter(r => r.status === 'pending') || [];
  const completedReports = data?.filter(r => r.status === 'completed') || [];

  return {
    reports: data || [],
    pendingReports,
    completedReports,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Doctors Hook
// ============================================================================

export function useDoctors(specialty?: string) {
  const { data, isLoading, error, refetch } = useApi<Doctor[]>(
    async () => {
      const doctors = await curaApi.getDoctors(specialty);
      return doctors;
    }
  );

  const specialties = [...new Set(data?.map(d => d.specialty) || [])];

  return {
    doctors: data || [],
    specialties,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Treatment Plans Hook
// ============================================================================

export function useTreatmentPlans() {
  const { data, isLoading, error, refetch } = useApi<TreatmentPlan[]>(
    async () => {
      const plans = await curaApi.getTreatmentPlans();
      return plans.map(plan => ({
        ...plan,
        progress: plan.milestones
          ? Math.round((plan.milestones.filter(m => m.completed).length / plan.milestones.length) * 100)
          : 0,
      }));
    }
  );

  const activePlans = data?.filter(p => !p.endDate || new Date(p.endDate) > new Date()) || [];
  const completedPlans = data?.filter(p => p.endDate && new Date(p.endDate) <= new Date()) || [];

  return {
    plans: data || [],
    activePlans,
    completedPlans,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// CURA Overview Hook (Combined)
// ============================================================================

export function useCuraOverview() {
  const { appointments, upcomingAppointments, isLoading: appointmentsLoading } = useAppointments();
  const { medications, takenCount, totalMedications, isLoading: medicationsLoading } = useMedications();
  const { reports, pendingReports, isLoading: reportsLoading } = useTestReports();
  const { doctors, isLoading: doctorsLoading } = useDoctors();

  return {
    stats: {
      appointments: upcomingAppointments.length,
      medications: totalMedications,
      testReports: reports.length,
      doctors: doctors.length,
    },
    upcomingAppointments,
    todaysMedications: medications,
    medicationProgress: totalMedications > 0 ? (takenCount / totalMedications) * 100 : 0,
    pendingReports,
    isLoading: appointmentsLoading || medicationsLoading || reportsLoading || doctorsLoading,
  };
}
