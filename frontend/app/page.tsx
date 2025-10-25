"use client";

import ConnectionCard from '../components/ConnectionCard';
import { useConnections } from '../hooks/useConnections';

export default function DashboardPage() {
  const {
    connections,
    loading,
    error,
    actionLoading,
    cardErrors,
    handleToggle,
  } = useConnections();

  if (loading) return <div className="text-center mt-10 text-lg">Loading connections...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <h1 className="text-3xl font-bold text-center mb-5">Connections Dashboard</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {connections.map((conn) => (
          <ConnectionCard
            key={conn.id}
            connection={conn}
            loading={actionLoading[conn.name]}
            error={cardErrors[conn.name]}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
