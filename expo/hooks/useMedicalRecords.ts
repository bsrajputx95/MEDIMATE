import { useApi, useMutation } from './useApiData';
import { apiClient } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface MedicalRecord {
  id: string;
  type: 'lab_result' | 'prescription' | 'imaging' | 'vaccination' | 'surgery' | 'allergy' | 'condition';
  title: string;
  description?: string;
  date: string;
  provider?: string;
  facility?: string;
  attachments?: Attachment[];
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  diagnosedDate?: string;
}

export interface Condition {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'chronic';
  diagnosedDate: string;
  resolvedDate?: string;
  notes?: string;
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  lotNumber?: string;
  provider?: string;
  nextDoseDate?: string;
}

// ============================================================================
// Medical Records Hook
// ============================================================================

export function useMedicalRecords(type?: MedicalRecord['type']) {
  return useApi<MedicalRecord[]>(
    async () => {
      const endpoint = type 
        ? `/medical-records?type=${type}`
        : '/medical-records';
      const response = await apiClient.get(endpoint);
      return response.data;
    }
  );
}

// ============================================================================
// Allergies Hook
// ============================================================================

export function useAllergies() {
  const { data, isLoading, error, refetch } = useApi<Allergy[]>(
    async () => {
      const response = await apiClient.get('/medical-records/allergies');
      return response.data;
    }
  );

  const addAllergy = useMutation(
    async (allergy: Omit<Allergy, 'id'>) => {
      const response = await apiClient.post('/medical-records/allergies', allergy);
      refetch();
      return response.data;
    }
  );

  const updateAllergy = useMutation(
    async ({ id, ...updates }: Partial<Allergy> & { id: string }) => {
      const response = await apiClient.put(`/medical-records/allergies/${id}`, updates);
      refetch();
      return response.data;
    }
  );

  const deleteAllergy = useMutation(
    async (id: string) => {
      await apiClient.delete(`/medical-records/allergies/${id}`);
      refetch();
    }
  );

  return {
    allergies: data || [],
    isLoading,
    error,
    refetch,
    addAllergy,
    updateAllergy,
    deleteAllergy,
  };
}

// ============================================================================
// Conditions Hook
// ============================================================================

export function useConditions() {
  const { data, isLoading, error, refetch } = useApi<Condition[]>(
    async () => {
      const response = await apiClient.get('/medical-records/conditions');
      return response.data;
    }
  );

  const addCondition = useMutation(
    async (condition: Omit<Condition, 'id'>) => {
      const response = await apiClient.post('/medical-records/conditions', condition);
      refetch();
      return response.data;
    }
  );

  const updateCondition = useMutation(
    async ({ id, ...updates }: Partial<Condition> & { id: string }) => {
      const response = await apiClient.put(`/medical-records/conditions/${id}`, updates);
      refetch();
      return response.data;
    }
  );

  return {
    conditions: data || [],
    isLoading,
    error,
    refetch,
    addCondition,
    updateCondition,
  };
}

// ============================================================================
// Vaccinations Hook
// ============================================================================

export function useVaccinations() {
  const { data, isLoading, error, refetch } = useApi<Vaccination[]>(
    async () => {
      const response = await apiClient.get('/medical-records/vaccinations');
      return response.data;
    }
  );

  const addVaccination = useMutation(
    async (vaccination: Omit<Vaccination, 'id'>) => {
      const response = await apiClient.post('/medical-records/vaccinations', vaccination);
      refetch();
      return response.data;
    }
  );

  return {
    vaccinations: data || [],
    isLoading,
    error,
    refetch,
    addVaccination,
  };
}

// ============================================================================
// Medical Record Operations Hook
// ============================================================================

export function useMedicalRecordOperations() {
  const addRecord = useMutation(
    async (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post('/medical-records', record);
      return response.data;
    }
  );

  const updateRecord = useMutation(
    async ({ id, ...updates }: Partial<MedicalRecord> & { id: string }) => {
      const response = await apiClient.put(`/medical-records/${id}`, updates);
      return response.data;
    }
  );

  const deleteRecord = useMutation(
    async (id: string) => {
      await apiClient.delete(`/medical-records/${id}`);
    }
  );

  const uploadAttachment = useMutation(
    async ({ recordId, file }: { recordId: string; file: FormData }) => {
      const response = await apiClient.post(
        `/medical-records/${recordId}/attachments`,
        file,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
  );

  const deleteAttachment = useMutation(
    async ({ recordId, attachmentId }: { recordId: string; attachmentId: string }) => {
      await apiClient.delete(`/medical-records/${recordId}/attachments/${attachmentId}`);
    }
  );

  return {
    addRecord,
    updateRecord,
    deleteRecord,
    uploadAttachment,
    deleteAttachment,
  };
}

// ============================================================================
// Medical Summary Hook
// ============================================================================

export function useMedicalSummary() {
  return useApi<{
    totalRecords: number;
    activeConditions: number;
    allergies: number;
    upcomingVaccinations: number;
    recentLabResults: number;
    lastCheckup: string | null;
  }>(
    async () => {
      const response = await apiClient.get('/medical-records/summary');
      return response.data;
    }
  );
}

export default useMedicalRecords;
