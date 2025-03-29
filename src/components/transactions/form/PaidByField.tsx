
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface PaidByFieldProps {
  form: UseFormReturn<any>;
  users: { id: string; name: string }[];
}

const PaidByField: React.FC<PaidByFieldProps> = ({ form, users }) => {
  // Find the user name based on the ID
  const getUserName = (id: string) => {
    if (id === 'none') return 'None';
    const user = users.find(u => u.id === id);
    return user?.name || id;
  };

  return (
    <FormField
      control={form.control}
      name="paid_by_user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Paid By</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {field.value ? getUserName(field.value) : "Select user"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
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
