
import React from 'react';
import { cn } from '@/lib/utils';
import { User, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  timestamp = new Date(),
}) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row",
      )}>
        <div className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground ml-2" : "bg-muted text-muted-foreground mr-2"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        </div>
        
        <Card className={cn(
          "shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card"
        )}>
          <CardContent className="p-3">
            <div className="whitespace-pre-wrap">{content}</div>
            <div className={cn(
              "text-xs mt-1",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatMessage;
