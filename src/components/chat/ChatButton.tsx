
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useFincaChat } from '@/hooks/useFincaChat';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useFincaChat();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen ? (
        <Card className="fixed bottom-4 right-4 w-80 sm:w-96 shadow-lg z-50 max-h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-sm font-medium">Finca Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 pt-2 flex flex-col space-y-4 max-h-[400px]">
            <div className="flex flex-col space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
            </div>
          </CardContent>
          <div className="p-4 pt-2 border-t">
            <ChatInput 
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </Card>
      ) : (
        <Button 
          onClick={toggleChat}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare />
        </Button>
      )}
    </>
  );
};

export default ChatButton;
