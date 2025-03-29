
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CommentFieldProps {
  form: UseFormReturn<any>;
}

const CommentField: React.FC<CommentFieldProps> = ({ form }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  
  // Initialize currentComment with the form value
  useEffect(() => {
    const formValue = form.getValues('comment');
    if (formValue) {
      setCurrentComment(formValue);
    }
  }, [form]);

  // Update the form value when currentComment changes
  useEffect(() => {
    form.setValue('comment', currentComment, { shouldValidate: true, shouldDirty: true });
  }, [currentComment, form]);
  
  const generateSuggestion = async () => {
    try {
      setIsGenerating(true);
      
      // Get current form values to generate contextual suggestion
      const { type, amount, date, expense_type, status, currency } = form.getValues();
      
      // Check if we have enough context to generate a suggestion
      if (!type || !amount) {
        toast.error("Please fill in transaction type and amount first");
        return;
      }
      
      // Get the current comment text to preserve it
      const existingComment = currentComment.trim();
      
      // Create prompt based on form values and existing comment
      const prompt = `Generate a brief, professional comment for a ${type} transaction of ${amount} ${currency} on ${date} ${expense_type ? `for ${expense_type}` : ''} that is ${status}. ${existingComment ? `Incorporate or expand on this existing comment: "${existingComment}"` : ''}`;
      
      // Mock AI response for now - in real implementation this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example generated comment based on transaction data and existing comment
      let generatedComment = '';
      
      // Include existing comment in the suggested text instead of overwriting
      if (existingComment) {
        if (type === 'expense') {
          generatedComment = `${existingComment} - Payment of ${amount} ${currency} for ${expense_type || 'business expense'}. Status: ${status}.`;
        } else {
          generatedComment = `${existingComment} - Received ${amount} ${currency} as income. Status: ${status}.`;
        }
      } else {
        if (type === 'expense') {
          generatedComment = `Payment of ${amount} ${currency} for ${expense_type || 'business expense'}. Status: ${status}.`;
        } else {
          generatedComment = `Received ${amount} ${currency} as income. Status: ${status}.`;
        }
      }
      
      // Set the generated value to the state
      setCurrentComment(generatedComment);
      toast.success("AI suggestion applied");
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast.error("Failed to generate suggestion");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentComment(e.target.value);
  };
  
  return (
    <FormField
      control={form.control}
      name="comment"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>Comment</FormLabel>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={generateSuggestion}
              disabled={isGenerating}
              className="h-8 px-2 text-xs"
            >
              <Sparkles className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'AI Suggest'}
            </Button>
          </div>
          <FormControl>
            <Textarea
              placeholder="Add details about this transaction"
              className="resize-none"
              spellCheck={true}
              {...field}
              value={currentComment || ''}
              onChange={(e) => {
                field.onChange(e);
                handleChange(e);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CommentField;
