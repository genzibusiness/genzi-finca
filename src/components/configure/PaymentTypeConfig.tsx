
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentType {
  id: string;
  name: string;
  active: boolean;
}

const PaymentTypeConfig = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPaymentType, setCurrentPaymentType] = useState<Partial<PaymentType>>({
    name: '',
    active: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch payment types
  const fetchPaymentTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_types')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setPaymentTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching payment types:', error);
      toast.error('Failed to load payment types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  // Add new payment type
  const handleAddPaymentType = async () => {
    try {
      if (!currentPaymentType.name) {
        toast.error('Name is required');
        return;
      }

      const { data, error } = await supabase
        .from('payment_types')
        .insert({
          name: currentPaymentType.name,
          active: currentPaymentType.active,
        })
        .select()
        .single();

      if (error) throw error;
      
      setPaymentTypes([...paymentTypes, data]);
      resetForm();
      toast.success('Payment type added successfully');
    } catch (error: any) {
      console.error('Error adding payment type:', error);
      toast.error('Failed to add payment type');
    }
  };

  // Update existing payment type
  const handleUpdatePaymentType = async () => {
    try {
      if (!currentPaymentType.id || !currentPaymentType.name) {
        toast.error('Invalid payment type data');
        return;
      }

      const { error } = await supabase
        .from('payment_types')
        .update({
          name: currentPaymentType.name,
          active: currentPaymentType.active,
        })
        .eq('id', currentPaymentType.id);

      if (error) throw error;
      
      setPaymentTypes(
        paymentTypes.map((item) =>
          item.id === currentPaymentType.id
            ? { ...item, name: currentPaymentType.name!, active: currentPaymentType.active! }
            : item
        )
      );
      
      resetForm();
      toast.success('Payment type updated successfully');
    } catch (error: any) {
      console.error('Error updating payment type:', error);
      toast.error('Failed to update payment type');
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_types')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setPaymentTypes(
        paymentTypes.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item
        )
      );
      
      toast.success('Status updated successfully');
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  // Edit payment type
  const editPaymentType = (paymentType: PaymentType) => {
    setCurrentPaymentType(paymentType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Add new payment type (open dialog)
  const addNewPaymentType = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setCurrentPaymentType({ name: '', active: true });
    setIsEditMode(false);
    setIsDialogOpen(false);
  };

  // Handle save
  const handleSave = () => {
    if (isEditMode) {
      handleUpdatePaymentType();
    } else {
      handleAddPaymentType();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Types</h2>
        <Button onClick={addNewPaymentType} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payment Type
        </Button>
      </div>

      {isLoading ? (
        <div className="w-full py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No payment types found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              paymentTypes.map((paymentType) => (
                <TableRow key={paymentType.id}>
                  <TableCell>{paymentType.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={paymentType.active}
                      onCheckedChange={() => toggleActiveStatus(paymentType.id, paymentType.active)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editPaymentType(paymentType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Payment Type' : 'Add Payment Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={currentPaymentType.name || ''}
                onChange={(e) =>
                  setCurrentPaymentType({
                    ...currentPaymentType,
                    name: e.target.value,
                  })
                }
                placeholder="Enter payment type name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={currentPaymentType.active}
                onCheckedChange={(checked) =>
                  setCurrentPaymentType({
                    ...currentPaymentType,
                    active: checked,
                  })
                }
              />
              <label htmlFor="active" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTypeConfig;
