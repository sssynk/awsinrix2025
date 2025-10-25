'use client';

import { Agent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  onToggle: (id: string) => void;
}

export function AgentCard({ agent, onToggle }: AgentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', agent.color)}>
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>{agent.name}</CardTitle>
              <CardDescription className="mt-1">
                {agent.description}
              </CardDescription>
            </div>
          </div>
          
          <Switch
            checked={agent.active}
            onCheckedChange={() => onToggle(agent.id)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div>
          <p className="text-sm font-medium mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability) => (
              <Badge key={capability} variant="secondary">
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


