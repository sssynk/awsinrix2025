'use client';

import { AgentCard } from '@/components/agents/AgentCard';
import { useAgentStore } from '@/store/agentStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AgentsPage() {
  const { agents, setAgents } = useAgentStore();

  const handleToggleAgent = (agentId: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === agentId ? { ...agent, active: !agent.active } : agent
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground mt-2">
            Manage your specialized AI agents and their capabilities
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Agent
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onToggle={handleToggleAgent}
          />
        ))}
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About Multi-Agent System</h3>
        <p className="text-sm text-muted-foreground">
          Our multi-agent system uses specialized AI agents that work together to provide 
          comprehensive assistance. Each agent has unique capabilities and can access 
          different workspace integrations. When you send a query, the relevant agents 
          will collaborate to provide the best possible response.
        </p>
      </div>
    </div>
  );
}


