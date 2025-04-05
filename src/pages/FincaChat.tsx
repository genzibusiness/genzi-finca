
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useFincaChat } from '@/hooks/useFincaChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

const FincaChat = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useFincaChat();

  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title="Chat with Finca"
          description="Ask questions about your finances and get insights"
          action={{
            label: "Clear Chat",
            onClick: clearMessages
          }}
        />
        
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 mb-6 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
            </div>
            
            <div className="mt-4">
              <ChatInput 
                onSendMessage={sendMessage}
                isLoading={isLoading}
                defaultValue=""
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FincaChat;
