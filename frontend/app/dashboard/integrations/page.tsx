'use client';

import { useEffect, useState } from 'react';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { useIntegrationStore } from '@/store/integrationStore';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
  const { integrations, setIntegrations, updateIntegration, isLoading, setIsLoading } = useIntegrationStore();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getIntegrations();
      setIntegrations(response.integrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (id: string) => {
    console.log('Connecting to', id);
    // TODO: Implement OAuth connection flow
    alert(`OAuth connection flow for ${id} will be implemented here`);
  };

  const handleDisconnect = async (id: string) => {
    console.log('Disconnecting from', id);
    updateIntegration(id, { connected: false });
    // TODO: Implement disconnection logic
  };

  if (isLoading && integrations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspace Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your workspace tools to enable AI-powered insights and automation
          </p>
        </div>
        <Button onClick={loadIntegrations} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No integrations available</p>
        </div>
      )}
    </div>
  );
}


