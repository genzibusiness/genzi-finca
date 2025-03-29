
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface CommentFieldProps {
  form: UseFormReturn<any>;
}

const CommentField: React.FC<CommentFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="comment"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Comment</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add details about this transaction"
              className="resize-none"
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
