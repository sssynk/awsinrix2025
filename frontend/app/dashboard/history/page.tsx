'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Clock } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Conversation History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your past conversations with AI agents
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <History className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No conversation history yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your past conversations will appear here. Start chatting to build your history.
        </p>
      </div>
    </div>
  );
}


