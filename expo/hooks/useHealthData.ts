import { useApi, useMutation, useOptimisticUpdate } from './useApiData';
import { healthApi } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface HealthMetrics {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  weight: number;
  sleep: number;
  steps: number;
  calories: number;
  waterIntake: number;
}

export interface HealthGoal {
  id: string;
  type: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  isCompleted: boolean;
}

export interface HealthReport {
  id: string;
  type: string;
  date: string;
  summary: string;
  insights: string[];
}

// ============================================================================
// Health Metrics Hook
// ============================================================================

export function useHealthMetrics(options?: { refetchInterval?: number }) {
  return useApi<HealthMetrics>(
    async () => {
      const data = await healthApi.getMetrics();
      return {
        heartRate: data.heartRate || 72,
        bloodPressure: data.bloodPressure || { systolic: 120, diastolic: 80 },
        weight: data.weight || 70,
        sleep: data.sleep || 7.5,
        steps: data.steps || 8247,
        calories: data.calories || 1250,
        waterIntake: 2.1, // Default value
      };
    },
    {
      refetchInterval: options?.refetchInterval || 60000, // Refetch every minute
    }
  );
}

// ============================================================================
// Health Goals Hook
// ============================================================================

export function useHealthGoals() {
  const { data: goals, isLoading, error, refetch } = useApi<HealthGoal[]>(
    async () => {
      const data = await healthApi.getGoals();
      return data.map(goal => ({
        ...goal,
        title: goal.type.charAt(0).toUpperCase() + goal.type.slice(1) + ' Goal',
        progress: Math.round((goal.current / goal.target) * 100),
        isCompleted: goal.current >= goal.target,
      }));
    }
  );

  const createGoal = useMutation(
    async (params: { type: string; target: number; unit: string; deadline?: string }) => {
      const result = await healthApi.createGoal(params);
      refetch();
      return result;
    }
  );

  const updateGoal = useMutation(
    async (params: { id: string; current?: number; target?: number }) => {
      const result = await healthApi.updateGoal(params.id, params);
      refetch();
      return result;
    }
  );

  const deleteGoal = useMutation(
    async (params: { id: string }) => {
      await healthApi.deleteGoal(params.id);
      refetch();
    }
  );

  return {
    goals: goals || [],
    isLoading,
    error,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}

// ============================================================================
// Health Reports Hook
// ============================================================================

export function useHealthReports() {
  return useApi<HealthReport[]>(
    async () => {
      const data = await healthApi.getReports();
      return data;
    }
  );
}

// ============================================================================
// Health Score Hook
// ============================================================================

export function useHealthScore() {
  const { data: metrics } = useHealthMetrics();
  
  // Calculate health score based on metrics
  const calculateScore = (): number => {
    if (!metrics) return 78; // Default fallback
    
    let score = 50; // Base score
    
    // Steps contribution (up to 15 points)
    const stepsScore = Math.min(15, (metrics.steps / 10000) * 15);
    score += stepsScore;
    
    // Heart rate contribution (up to 10 points)
    if (metrics.heartRate >= 60 && metrics.heartRate <= 100) {
      score += 10;
    } else if (metrics.heartRate >= 50 && metrics.heartRate <= 110) {
      score += 5;
    }
    
    // Sleep contribution (up to 15 points)
    if (metrics.sleep >= 7 && metrics.sleep <= 9) {
      score += 15;
    } else if (metrics.sleep >= 6 && metrics.sleep <= 10) {
      score += 10;
    }
    
    // Water intake contribution (up to 10 points)
    if (metrics.waterIntake >= 2.5) {
      score += 10;
    } else if (metrics.waterIntake >= 2) {
      score += 7;
    }
    
    return Math.min(100, Math.round(score));
  };

  return {
    score: calculateScore(),
    metrics,
  };
}
