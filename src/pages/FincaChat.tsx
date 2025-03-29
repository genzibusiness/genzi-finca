
import React, { useRef, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Mic, MicOff } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { useFincaChat } from '@/hooks/useFincaChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FincaChat = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useFincaChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  
  useEffect(() => {
    // Initialize speech recognition if supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(currentTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error(`Microphone error: ${event.error}`);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Clean up
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle audio queue
  useEffect(() => {
    const playNextInQueue = () => {
      if (audioQueue.length > 0 && !isPlayingAudio) {
        setIsPlayingAudio(true);
        const audio = audioQueue[0];
        audio.play();
        
        audio.onended = () => {
          setAudioQueue(prev => prev.slice(1));
          setIsPlayingAudio(false);
        };
      }
    };
    
    if (!isPlayingAudio) {
      playNextInQueue();
    }
  }, [audioQueue, isPlayingAudio]);
  
  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      if (transcript.trim()) {
        sendMessage(transcript);
      }
      setTranscript('');
    } else {
      recognition.start();
    }
    
    setIsListening(prevState => !prevState);
  };
  
  const textToSpeech = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioSrc);
        setAudioQueue(prev => [...prev, audio]);
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      toast.error('Failed to generate speech');
    }
  };
  
  const handleSendWithVoiceResponse = async (content: string) => {
    await sendMessage(content);
    
    // Get the last response (after a small delay to ensure it's been added)
    setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.isUser) {
        textToSpeech(lastMessage.content);
      }
    }, 1000);
  };

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
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              <span>Chat with Finca Assistant</span>
              <Button 
                variant={isListening ? "destructive" : "outline"} 
                size="sm"
                onClick={toggleListening}
                className="gap-1"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? 'Stop' : 'Voice Input'}
              </Button>
            </CardTitle>
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
              
              {isListening && transcript && (
                <div className="my-2 p-3 rounded-lg bg-muted text-muted-foreground border border-dashed border-primary animate-pulse">
                  Listening: {transcript}
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-center my-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="p-4 border-t">
            <ChatInput 
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
              defaultValue={transcript}
            />
            
            {messages.length > 0 && !isLoading && !isPlayingAudio && !isListening && (
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const lastResponse = messages.filter(m => !m.isUser).pop();
                    if (lastResponse) {
                      textToSpeech(lastResponse.content);
                    }
                  }}
                  className="text-xs"
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Read Last Response
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FincaChat;
