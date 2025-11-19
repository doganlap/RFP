/**
 * Zustand Store - Enterprise State Management
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, RFP, Notification } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // RFP state
  currentRFP: RFP | null;
  setCurrentRFP: (rfp: RFP | null) => void;
  rfps: RFP[];
  setRFPs: (rfps: RFP[]) => void;
  addRFP: (rfp: RFP) => void;
  updateRFP: (id: string, updates: Partial<RFP>) => void;
  removeRFP: (id: string) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User state
        user: null,
        setUser: (user) => set({ user }),

        // RFP state
        currentRFP: null,
        setCurrentRFP: (rfp) => set({ currentRFP: rfp }),
        rfps: [],
        setRFPs: (rfps) => set({ rfps }),
        addRFP: (rfp) => set((state) => ({ rfps: [...state.rfps, rfp] })),
        updateRFP: (id, updates) =>
          set((state) => ({
            rfps: state.rfps.map((rfp) => (rfp.id === id ? { ...rfp, ...updates } : rfp)),
            currentRFP:
              state.currentRFP?.id === id
                ? { ...state.currentRFP, ...updates }
                : state.currentRFP,
          })),
        removeRFP: (id) =>
          set((state) => ({
            rfps: state.rfps.filter((rfp) => rfp.id !== id),
            currentRFP: state.currentRFP?.id === id ? null : state.currentRFP,
          })),

        // UI state
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Notifications
        notifications: [],
        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
          })),
        markNotificationRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          })),
        clearNotifications: () => set({ notifications: [] }),

        // Loading states
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),

        // Error state
        error: null,
        setError: (error) => set({ error }),
      }),
      {
        name: 'rfp-platform-storage',
        partialize: (state) => ({
          user: state.user,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'RFP Platform Store' }
  )
);
