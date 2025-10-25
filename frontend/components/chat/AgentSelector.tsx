'use client';

import { useAgentStore } from '@/store/agentStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentSelector() {
  const { agents, selectedAgents, toggleAgent } = useAgentStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Active Agents
        </CardTitle>
        <CardDescription>
          Select which agents should assist with your queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {agents.map((agent) => {
          const isSelected = selectedAgents.includes(agent.id);
          
          return (
            <Button
              key={agent.id}
              variant={isSelected ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => toggleAgent(agent.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    agent.color
                  )}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.description}
                  </p>
                </div>

                {isSelected && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}


