
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface StatusFieldProps {
  form: UseFormReturn<any>;
  statuses: { id: string; name: string; type: string; name_normalized: string }[];
}

const StatusField: React.FC<StatusFieldProps> = ({ form, statuses }) => {
  // Find the full status name based on the normalized name
  const getStatusDisplayName = (value: string) => {
    const status = statuses.find(s => s.name_normalized === value);
    return status?.name || value;
  };

  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Status</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {field.value ? getStatusDisplayName(field.value) : "Select status"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent position="popper" className="w-full bg-popover z-50">
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.name_normalized}>
                  {status.name}
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

export default StatusField;
