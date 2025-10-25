// Type definitions for the application

export interface User {
  sub?: string;
  email?: string;
  phone_number?: string;
  username?: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent';
  agentId?: string;
  agentName?: string;
  timestamp: string;
  metadata?: {
    sources?: string[];
    context?: any;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  active: boolean;
  capabilities: string[];
}

export interface Integration {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
  description?: string;
  lastSynced?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}


