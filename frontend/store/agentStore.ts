import { create } from 'zustand';
import { Agent } from '@/types';

interface AgentState {
  agents: Agent[];
  selectedAgents: string[];
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  toggleAgent: (agentId: string) => void;
  selectAgent: (agentId: string) => void;
  deselectAgent: (agentId: string) => void;
  clearSelection: () => void;
}

// Default agents for the multi-agent system
const defaultAgents: Agent[] = [
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Specializes in project management, task organization, and workflow optimization',
    color: 'bg-blue-500',
    icon: 'briefcase',
    active: true,
    capabilities: ['jira', 'asana', 'linear', 'task-management'],
  },
  {
    id: 'sales-analyst',
    name: 'Sales Analyst',
    description: 'Expert in sales data, CRM analysis, and customer insights',
    color: 'bg-green-500',
    icon: 'trending-up',
    active: true,
    capabilities: ['hubspot', 'crm', 'sales-analytics'],
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Analyzes complex data patterns and provides statistical insights',
    color: 'bg-purple-500',
    icon: 'bar-chart',
    active: true,
    capabilities: ['data-analysis', 'reporting', 'insights'],
  },
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'Handles general queries and coordinates between specialized agents',
    color: 'bg-gray-500',
    icon: 'message-circle',
    active: true,
    capabilities: ['general', 'coordination'],
  },
];

export const useAgentStore = create<AgentState>((set) => ({
  agents: defaultAgents,
  selectedAgents: defaultAgents.map((a) => a.id), // All selected by default

  setAgents: (agents) => set({ agents }),

  toggleAgent: (agentId) =>
    set((state) => ({
      selectedAgents: state.selectedAgents.includes(agentId)
        ? state.selectedAgents.filter((id) => id !== agentId)
        : [...state.selectedAgents, agentId],
    })),

  selectAgent: (agentId) =>
    set((state) => ({
      selectedAgents: state.selectedAgents.includes(agentId)
        ? state.selectedAgents
        : [...state.selectedAgents, agentId],
    })),

  deselectAgent: (agentId) =>
    set((state) => ({
      selectedAgents: state.selectedAgents.filter((id) => id !== agentId),
    })),

  clearSelection: () => set({ selectedAgents: [] }),
}));


