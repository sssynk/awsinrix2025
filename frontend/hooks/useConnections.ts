"use client";

import { useState, useCallback, useEffect } from 'react';
import { fetchConnections, enableConnection, disableConnection } from '../utils/api';
import { showNotification } from '../utils/notifications';

export function useConnections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConnections();
      setConnections(data.connections || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    // Handle OAuth callback message in URL: ?connection_success=name or ?error=msg
    const params = new URLSearchParams(window.location.search);
    const success = params.get('connection_success');
    const errorMsg = params.get('error');
    if (success) {
      showNotification(`Successfully connected to ${success}!`, 'success');
      fetchAll();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (errorMsg) {
      showNotification(`Connection Error: ${decodeURIComponent(errorMsg)}`, 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchAll]);

  const handleToggle = useCallback(
    async (c: any) => {
      setActionLoading((prev) => ({ ...prev, [c.name]: true }));
      setCardErrors((prev) => ({ ...prev, [c.name]: '' }));
      try {
        if (c.is_enabled) {
          await disableConnection(c.name);
          showNotification('Connection disabled', 'success');
        } else {
          if (c.auth_type === 'oauth2' || c.auth_type === 'oauth1') {
            const data = await enableConnection(c);
            if (data.auth_url) {
              window.location.href = data.auth_url; // Redirect for OAuth
              return; // Do not refetch or notify, leave page
            }
          } else if (c.auth_type === 'api_key') {
            const apiKey = prompt(`Enter your ${c.display_name} API key:`);
            if (!apiKey) return;
            await enableConnection(c, { api_key: apiKey });
            showNotification('API Key connection enabled!', 'success');
          } else if (c.auth_type === 'connection_string') {
            const connStr = prompt(`Enter your ${c.display_name} connection string:`);
            if (!connStr) return;
            await enableConnection(c, { connection_string: connStr });
            showNotification('Database connection enabled!', 'success');
          }
        }
        fetchAll();
      } catch (err: any) {
        setCardErrors((prev) => ({ ...prev, [c.name]: err?.message || 'Error' }));
      } finally {
        setActionLoading((prev) => ({ ...prev, [c.name]: false }));
      }
    },
    [fetchAll]
  );

  return {
    connections,
    loading,
    error,
    actionLoading,
    cardErrors,
    handleToggle,
    refetch: fetchAll,
  };
}
