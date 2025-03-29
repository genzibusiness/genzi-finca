
import React, { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  defaultValue?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, defaultValue = '' }) => {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (defaultValue) {
      setMessage(defaultValue);
    }
  }, [defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        placeholder="Ask a question about your finances..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 min-h-[80px] resize-none"
        disabled={isLoading}
        spellCheck={true}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isLoading}
        className="mb-[3px] h-10 w-10"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default ChatInput;
