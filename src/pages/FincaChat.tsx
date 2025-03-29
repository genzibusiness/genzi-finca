
import React, { useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { useFincaChat } from '@/hooks/useFincaChat';

const FincaChat = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useFincaChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <PageHeader 
          title="Finca Chat" 
          description="Ask questions about your financial data"
          action={{
            label: "Clear Chat",
            icon: <RefreshCw className="h-4 w-4 mr-2" />,
            onClick: clearMessages
          }}
        />
        
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg font-medium">Chat with Finca Assistant</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-center my-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="p-4 border-t">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FincaChat;
