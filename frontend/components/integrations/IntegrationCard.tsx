'use client';

import { Integration } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Settings } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export function IntegrationCard({ integration, onConnect, onDisconnect }: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl">{getIcon(integration.icon)}</span>
            </div>
            <div>
              <CardTitle>{integration.name}</CardTitle>
              <CardDescription className="mt-1">
                {integration.description || `Connect your ${integration.name} workspace`}
              </CardDescription>
            </div>
          </div>
          
          <Badge variant={integration.connected ? 'default' : 'secondary'}>
            {integration.connected ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {integration.connected && integration.lastSynced && (
          <p className="text-xs text-muted-foreground mb-3">
            Last synced: {new Date(integration.lastSynced).toLocaleString()}
          </p>
        )}
        
        <div className="flex gap-2">
          {integration.connected ? (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDisconnect(integration.id)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => onConnect(integration.id)}
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getIcon(iconName: string): string {
  const icons: Record<string, string> = {
    jira: '🎯',
    asana: '✓',
    hubspot: '🔶',
    linear: '📐',
  };
  return icons[iconName.toLowerCase()] || '🔗';
}


