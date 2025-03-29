
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface DocumentUrlFieldProps {
  form: UseFormReturn<any>;
}

const DocumentUrlField: React.FC<DocumentUrlFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="document_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Document URL (Invoice/PO)</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="https://example.com/invoice.pdf"
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  // Set to null if empty string, otherwise use the value
                  const value = e.target.value.trim() === '' ? null : e.target.value;
                  field.onChange(value);
                }}
              />
              {field.value && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => window.open(field.value, '_blank')}
                >
                  <Link className="h-4 w-4" />
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentUrlField;
