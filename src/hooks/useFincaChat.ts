
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const useFincaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your Genzi Finca assistant. You can ask me questions about your finances, like 'What was my total income last month?' or 'How much did I spend on Marketing in April 2024?'",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    try {
      // Add user message to chat
      const userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMessageId,
        content,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      // Get the user's session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to use the chat');
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('finca-chat', {
        body: {
          query: content,
          authToken: session.access_token,
        },
      });
      
      if (error) {
        throw new Error(`Error: ${error.message}`);
      }
      
      // Add bot response to chat
      const botMessageId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to get a response');
      
      // Add error message to chat
      const errorMessageId = `error-${Date.now()}`;
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages: () => setMessages([]),
  };
};
