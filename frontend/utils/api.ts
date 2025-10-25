export async function fetchConnections() {
  const response = await fetch('/connections', { credentials: 'include' });
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Redirecting to login.');
  }
  if (!response.ok) {
    let e = await response.json();
    throw new Error(e.error || e.message || 'Failed to fetch connections');
  }
  return response.json();
}

export async function enableConnection(connection, extra = {}) {
  // Handles all types: oauth, api_key, connection_string.
  const body = { connection_name: connection.name, ...extra };
  const response = await fetch('/connections/enable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Redirecting to login.');
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to enable connection');
  }
  return data;
}

export async function disableConnection(connectionName) {
  const response = await fetch(`/connections/disable/${connectionName}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Redirecting to login.');
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to disable connection');
  }
  return data;
}
