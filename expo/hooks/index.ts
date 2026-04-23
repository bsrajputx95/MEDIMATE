// API Data Hooks
export { useApi, useMutation, useOptimisticUpdate, usePaginatedApi } from './useApiData';
export type { ApiState, MutationState, OptimisticState, PaginatedState } from './useApiData';

// Health Data Hooks
export {
  useHealthMetrics,
  useHealthGoals,
  useHealthReports,
  useHealthScore,
} from './useHealthData';
export type { HealthMetrics, HealthGoal, HealthReport } from './useHealthData';

// CURA Data Hooks
export {
  useAppointments,
  useMedications,
  useTestReports,
  useDoctors,
  useTreatmentPlans,
  useCuraOverview,
} from './useCuraData';
export type {
  Appointment,
  Medication,
  TestReport,
  Doctor,
  TreatmentPlan,
} from './useCuraData';

// Community Data Hooks
export {
  usePosts,
  useGroups,
  useChallenges,
  usePolls,
  useCommunityOverview,
} from './useCommunityData';
export type {
  Post,
  Group,
  Challenge,
  Poll,
  ExpertAnswer,
} from './useCommunityData';

// Theme Hook
export { useTheme } from './useTheme';
export type { Theme, ThemeColors } from './useTheme';
