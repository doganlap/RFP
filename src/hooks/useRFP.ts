/**
 * Enterprise RFP Hook
 */
import { useAppStore } from '../store';
import { apiClient } from '../services/ApiClient';
import type { RFP } from '../types';

export const useRFP = () => {
  const currentRFP = useAppStore((state) => state.currentRFP);
  const setCurrentRFP = useAppStore((state) => state.setCurrentRFP);
  const rfps = useAppStore((state) => state.rfps);
  const addRFP = useAppStore((state) => state.addRFP);
  const updateRFP = useAppStore((state) => state.updateRFP);
  const removeRFP = useAppStore((state) => state.removeRFP);

  const getRFPById = (id: string): RFP | undefined => {
    return rfps.find((rfp) => rfp.id === id);
  };

  const createRFP = async (data: Omit<RFP, 'id' | 'createdAt' | 'updatedAt'>): Promise<RFP> => {
    try {
      const response = await apiClient.createRFP(data);
      if (response.success) {
        const newRFP: RFP = {
          ...data,
          id: response.data?.id || `RFP-${Date.now()}`,
          createdAt: response.data?.createdAt || new Date().toISOString(),
          updatedAt: response.data?.updatedAt || new Date().toISOString(),
        };
        addRFP(newRFP);
        return newRFP;
      }
      throw new Error('Failed to create RFP');
    } catch (error) {
      console.error('Create RFP failed:', error);
      throw error;
    }
  };

  const editRFP = async (id: string, updates: Partial<RFP>): Promise<void> => {
    try {
      const response = await apiClient.updateRFP(id, updates);
      if (response.success) {
        updateRFP(id, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Edit RFP failed:', error);
      throw error;
    }
  };

  const deleteRFP = async (id: string): Promise<void> => {
    try {
      removeRFP(id);
    } catch (error) {
      console.error('Delete RFP failed:', error);
      throw error;
    }
  };

  const fetchRFPs = async (page: number = 1, limit: number = 20): Promise<void> => {
    try {
      const response = await apiClient.getRFPs(page, limit);
      if (response.success) {
        // Would populate store with fetched RFPs
        console.log('Fetched RFPs:', response.data);
      }
    } catch (error) {
      console.error('Fetch RFPs failed:', error);
    }
  };

  return {
    currentRFP,
    setCurrentRFP,
    rfps,
    getRFPById,
    createRFP,
    editRFP,
    deleteRFP,
  };
};
