
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionStatus {
  id: string;
  name: string;
  type: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface TransactionType {
  id: string;
  name: string;
}

const TransactionStatusConfig = () => {
  const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TransactionStatus | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', active: true });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch transaction statuses
      const { data: statusData, error: statusError } = await supabase
        .from('transaction_statuses')
        .select('*')
        .order('name');
      
      if (statusError) throw statusError;
      setStatuses(statusData || []);
      
      // Fetch transaction types for the dropdown
      const { data: typeData, error: typeError } = await supabase
        .from('transaction_types')
        .select('id, name')
        .eq('active', true);
      
      if (typeError) throw typeError;
      setTransactionTypes(typeData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load transaction statuses');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    setFormData({ 
      name: '', 
      type: transactionTypes.length > 0 ? transactionTypes[0].name : '',
      active: true 
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (status: TransactionStatus) => {
    setCurrentStatus(status);
    setFormData({ name: status.name, type: status.type, active: status.active });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (status: TransactionStatus) => {
    setCurrentStatus(status);
    setIsDeleteDialogOpen(true);
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Status name is required');
      return false;
    }
    if (!formData.type) {
      toast.error('Transaction type is required');
      return false;
    }
    return true;
  };
  
  const handleSubmitAdd = async () => {
    try {
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('transaction_statuses')
        .insert([{ 
          name: formData.name.trim(), 
          type: formData.type,
          active: formData.active 
        }]);
      
      if (error) throw error;
      
      toast.success('Transaction status added successfully');
      setIsAddDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding transaction status:', error);
      toast.error(error.message || 'Failed to add transaction status');
    }
  };
  
  const handleSubmitEdit = async () => {
    try {
      if (!currentStatus) return;
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('transaction_statuses')
        .update({ 
          name: formData.name.trim(), 
          type: formData.type,
          active: formData.active 
        })
        .eq('id', currentStatus.id);
      
      if (error) throw error;
      
      toast.success('Transaction status updated successfully');
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast.error(error.message || 'Failed to update transaction status');
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!currentStatus) return;
      
      const { error } = await supabase
        .from('transaction_statuses')
        .delete()
        .eq('id', currentStatus.id);
      
      if (error) throw error;
      
      toast.success('Transaction status deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting transaction status:', error);
      toast.error(error.message || 'Failed to delete transaction status');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction Statuses</CardTitle>
          <CardDescription>
            Manage transaction statuses for different transaction types
          </CardDescription>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading transaction statuses...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No transaction statuses found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                statuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell>{status.name.replace('_', ' ')}</TableCell>
                    <TableCell className="capitalize">{status.type}</TableCell>
                    <TableCell>
                      {status.active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(status)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(status)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction Status</DialogTitle>
            <DialogDescription>
              Create a new status for transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. paid, processing, refunded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, active: checked === true })
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd}>
              Add Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction Status</DialogTitle>
            <DialogDescription>
              Update the transaction status information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. paid, processing, refunded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, active: checked === true })
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction Status?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              status "{currentStatus?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TransactionStatusConfig;
