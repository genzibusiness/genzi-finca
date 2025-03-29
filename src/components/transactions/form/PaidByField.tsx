
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface PaidByFieldProps {
  form: UseFormReturn<any>;
  users: { id: string; name: string }[];
}

const PaidByField: React.FC<PaidByFieldProps> = ({ form, users }) => {
  return (
    <FormField
      control={form.control}
      name="paid_by_user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Paid By</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PaidByField;
