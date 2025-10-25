'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AgentSelector } from './AgentSelector';
import { useChatStore } from '@/store/chatStore';
import { useAgentStore } from '@/store/agentStore';
import { apiClient } from '@/lib/api';
import { Message } from '@/types';

export function ChatContainer() {
  const { addMessage, setIsLoading, isLoading } = useChatStore();
  const { selectedAgents } = useAgentStore();
  const [showAgentPanel, setShowAgentPanel] = useState(true);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);

    // Send to backend
    setIsLoading(true);
    try {
      const response = await apiClient.sendMessage(content, {}, selectedAgents);
      
      // Add AI response
      const aiMessage: Message = {
        id: response.response.id,
        content: response.response.message,
        role: 'assistant',
        timestamp: response.response.timestamp,
        metadata: {
          sources: response.response.agents,
        },
      };
      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>

      {showAgentPanel && (
        <div className="w-80 border-l p-4 overflow-auto">
          <AgentSelector />
        </div>
      )}
    </div>
  );
}


