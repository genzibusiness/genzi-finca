
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

interface TransactionType {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const TransactionTypeConfig = () => {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentType, setCurrentType] = useState<TransactionType | null>(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  
  useEffect(() => {
    fetchTransactionTypes();
  }, []);
  
  const fetchTransactionTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transaction_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setTransactionTypes(data || []);
    } catch (error) {
      console.error('Error fetching transaction types:', error);
      toast.error('Failed to load transaction types');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    setFormData({ name: '', active: true });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (type: TransactionType) => {
    setCurrentType(type);
    setFormData({ name: type.name, active: type.active });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (type: TransactionType) => {
    setCurrentType(type);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmitAdd = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      const { error } = await supabase
        .from('transaction_types')
        .insert([{ name: formData.name.trim().toLowerCase(), active: formData.active }]);
      
      if (error) throw error;
      
      toast.success('Transaction type added successfully');
      setIsAddDialogOpen(false);
      fetchTransactionTypes();
    } catch (error: any) {
      console.error('Error adding transaction type:', error);
      toast.error(error.message || 'Failed to add transaction type');
    }
  };
  
  const handleSubmitEdit = async () => {
    try {
      if (!currentType) return;
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      const { error } = await supabase
        .from('transaction_types')
        .update({ name: formData.name.trim().toLowerCase(), active: formData.active })
        .eq('id', currentType.id);
      
      if (error) throw error;
      
      toast.success('Transaction type updated successfully');
      setIsEditDialogOpen(false);
      fetchTransactionTypes();
    } catch (error: any) {
      console.error('Error updating transaction type:', error);
      toast.error(error.message || 'Failed to update transaction type');
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!currentType) return;
      
      const { error } = await supabase
        .from('transaction_types')
        .delete()
        .eq('id', currentType.id);
      
      if (error) throw error;
      
      toast.success('Transaction type deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchTransactionTypes();
    } catch (error: any) {
      console.error('Error deleting transaction type:', error);
      toast.error(error.message || 'Failed to delete transaction type');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction Types</CardTitle>
          <CardDescription>
            Manage transaction types (income, expense, etc.)
          </CardDescription>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading transaction types...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No transaction types found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                transactionTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="capitalize">{type.name}</TableCell>
                    <TableCell>
                      {type.active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(type)}>
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
            <DialogTitle>Add Transaction Type</DialogTitle>
            <DialogDescription>
              Create a new transaction type (e.g., income, expense).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter transaction type name"
              />
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
              Add Transaction Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction Type</DialogTitle>
            <DialogDescription>
              Update the transaction type's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter transaction type name"
              />
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
            <AlertDialogTitle>Delete Transaction Type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction type "{currentType?.name}".
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

export default TransactionTypeConfig;
