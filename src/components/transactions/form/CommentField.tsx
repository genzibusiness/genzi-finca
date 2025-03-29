
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
      
      // Create prompt based on form values
      const prompt = `Generate a brief, professional comment for a ${type} transaction of ${amount} ${currency} on ${date} ${expense_type ? `for ${expense_type}` : ''} that is ${status}.`;
      
      // Mock AI response for now - in real implementation this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example generated comment based on transaction data
      let generatedComment = '';
      if (type === 'expense') {
        generatedComment = `Payment of ${amount} ${currency} for ${expense_type || 'business expense'}. Status: ${status}.`;
      } else {
        generatedComment = `Received ${amount} ${currency} as income. Status: ${status}.`;
      }
      
      // Set the generated value to the form
      form.setValue('comment', generatedComment, { shouldValidate: true, shouldDirty: true });
      toast.success("AI suggestion applied");
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast.error("Failed to generate suggestion");
    } finally {
      setIsGenerating(false);
    }
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
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CommentField;
