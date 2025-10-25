"use client";

import React from 'react';

export type Connection = {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  auth_type: string;
  is_enabled: boolean;
  icon_url?: string | null;
  connected_at?: string;
  token_expires_at?: string;
  is_token_valid?: boolean;
};

interface CardProps {
  connection: Connection;
  loading?: boolean;
  error?: string | null;
  onToggle: (c: Connection) => void;
}

const ConnectionCard: React.FC<CardProps> = ({ connection, loading, error, onToggle }) => {
  let status = 'Not Connected';
  let statusColor = 'text-gray-500';

  if (connection.is_enabled && connection.is_token_valid !== false) {
    status = 'Connected';
    statusColor = 'text-green-600';
  } else if (connection.is_enabled && connection.is_token_valid === false) {
    status = 'Token Expired';
    statusColor = 'text-red-500';
  }

  return (
    <div className="border rounded-lg p-6 shadow bg-white flex flex-col gap-3 w-80 mx-auto my-2">
      {/* icon */}
      <div className="mb-1 flex flex-row items-center gap-2">
        {connection.icon_url ? (
          <img src={connection.icon_url} alt={connection.display_name + ' icon'} className="w-7 h-7" />
        ) : (
          <div className="w-7 h-7 bg-gray-300 rounded-full" />
        )}
        <div>
          <div className="font-semibold text-lg">{connection.display_name}</div>
          <div className="text-gray-400 text-xs">{connection.category}</div>
        </div>
      </div>
      <div className="text-gray-700 mb-1 text-base">{connection.description}</div>
      <div className={statusColor + ' font-medium mb-1'}>{status}</div>
      {connection.connected_at && (
        <div className="text-xs text-gray-400 mt-0">Connected on {new Date(connection.connected_at).toLocaleDateString()}</div>
      )}
      {error && <div className="text-red-500 text-xs mb-1">{error}</div>}
      <button
        disabled={loading}
        onClick={() => onToggle(connection)}
        className={`py-2 px-4 rounded mt-2 w-full ${
          loading
            ? 'bg-gray-300 text-gray-600'
            : connection.is_enabled
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading
          ? 'Please wait...'
          : connection.is_enabled && status !== 'Token Expired'
          ? 'Disconnect'
          : status === 'Token Expired'
          ? 'Reconnect'
          : 'Connect'}
      </button>
    </div>
  );
};

export default ConnectionCard;
