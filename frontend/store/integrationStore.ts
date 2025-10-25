import { create } from 'zustand';
import { Integration } from '@/types';

interface IntegrationState {
  integrations: Integration[];
  isLoading: boolean;
  
  // Actions
  setIntegrations: (integrations: Integration[]) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  integrations: [],
  isLoading: false,

  setIntegrations: (integrations) => set({ integrations }),

  updateIntegration: (id, updates) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id ? { ...integration, ...updates } : integration
      ),
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));


