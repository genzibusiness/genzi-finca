
import React, { useState, useEffect, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CornerDownLeft } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const SUGGESTIONS = {
  'salary': [
    'Monthly salary payment for',
    'Salary advance for',
    'Bonus payment for',
    'Commission payment for'
  ],
  'software': [
    'Software subscription for',
    'Software license renewal for',
    'Software maintenance fee for',
    'One-time software purchase for'
  ],
  'marketing': [
    'Marketing campaign expenses for',
    'Advertisement costs for',
    'Marketing materials for',
    'Marketing consultation services from'
  ],
  'services': [
    'Consulting services from',
    'Professional services fee for',
    'Maintenance services by',
    'Support services from'
  ],
  'other': [
    'Payment for',
    'Expense related to',
    'Purchase of',
    'Fee for'
  ]
};

// Simple spell checker
const commonMisspellings: Record<string, string> = {
  'salry': 'salary',
  'slary': 'salary',
  'sofware': 'software',
  'softare': 'software',
  'markting': 'marketing',
  'mareting': 'marketing',
  'servces': 'services',
  'srvices': 'services',
  'expnse': 'expense',
  'expens': 'expense',
  'paymnt': 'payment',
  'pyment': 'payment',
  'purchse': 'purchase'
};

const EnhancedCommentField = ({ expenseType }: { expenseType?: string }) => {
  const { control, setValue, watch } = useFormContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const commentValue = watch('comment') || '';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Generate suggestions based on expense type and current text
    if (expenseType && expenseType.toLowerCase() in SUGGESTIONS) {
      const baseSuggestions = SUGGESTIONS[expenseType.toLowerCase() as keyof typeof SUGGESTIONS] || SUGGESTIONS.other;
      setSuggestions(baseSuggestions);
    } else {
      setSuggestions(SUGGESTIONS.other);
    }
  }, [expenseType]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue('comment', text);

    // Spell check the last word
    const words = text.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    if (lastWord && lastWord.length > 3 && commonMisspellings[lastWord]) {
      const corrected = text.substring(0, text.length - lastWord.length) + commonMisspellings[lastWord];
      setValue('comment', corrected);
      
      if (textareaRef.current) {
        textareaRef.current.value = corrected;
        // Set cursor to end
        textareaRef.current.selectionStart = corrected.length;
        textareaRef.current.selectionEnd = corrected.length;
      }
    }
  };

  const applySuggestion = (suggestion: string) => {
    // Preserve what the user has already typed if possible
    const currentText = commentValue.trim();
    
    // If current text starts with or is part of the suggestion, don't overwrite
    if (suggestion.toLowerCase().includes(currentText.toLowerCase()) && currentText.length > 0) {
      // Find where the current text appears in the suggestion
      const index = suggestion.toLowerCase().indexOf(currentText.toLowerCase());
      if (index === 0) {
        // Current text is at the beginning, just append the rest
        setValue('comment', suggestion);
      } else {
        // Current text is somewhere in the suggestion, preserve it
        setValue('comment', currentText + ' ' + suggestion.substring(currentText.length).trim());
      }
    } else if (currentText && suggestion.startsWith(currentText)) {
      // Current text is the beginning of the suggestion
      setValue('comment', suggestion);
    } else if (currentText) {
      // Just append the suggestion to what they've typed
      setValue('comment', currentText + ' ' + suggestion);
    } else {
      // Empty field, just use the suggestion
      setValue('comment', suggestion);
    }
    
    setShowSuggestions(false);
    
    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <FormField
      control={control}
      name="comment"
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>Comment</FormLabel>
          <div className="relative">
            <Textarea
              {...field}
              placeholder="Add a comment..."
              className="min-h-[100px]"
              onChange={handleChange}
              ref={(e) => {
                field.ref(e);
                textareaRef.current = e;
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-2 bottom-2 p-1 h-6"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>
          
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg p-2">
              <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EnhancedCommentField;
