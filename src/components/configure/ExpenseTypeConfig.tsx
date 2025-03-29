
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

interface ExpenseType {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ExpenseTypeConfig = () => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExpenseType, setCurrentExpenseType] = useState<ExpenseType | null>(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  
  useEffect(() => {
    fetchExpenseTypes();
  }, []);
  
  const fetchExpenseTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expense_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setExpenseTypes(data || []);
    } catch (error) {
      console.error('Error fetching expense types:', error);
      toast.error('Failed to load expense types');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    setFormData({ name: '', active: true });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (expenseType: ExpenseType) => {
    setCurrentExpenseType(expenseType);
    setFormData({ name: expenseType.name, active: expenseType.active });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (expenseType: ExpenseType) => {
    setCurrentExpenseType(expenseType);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmitAdd = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      const { error } = await supabase
        .from('expense_types')
        .insert([{ name: formData.name.trim(), active: formData.active }]);
      
      if (error) throw error;
      
      toast.success('Expense type added successfully');
      setIsAddDialogOpen(false);
      fetchExpenseTypes();
    } catch (error: any) {
      console.error('Error adding expense type:', error);
      toast.error(error.message || 'Failed to add expense type');
    }
  };
  
  const handleSubmitEdit = async () => {
    try {
      if (!currentExpenseType) return;
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      const { error } = await supabase
        .from('expense_types')
        .update({ name: formData.name.trim(), active: formData.active })
        .eq('id', currentExpenseType.id);
      
      if (error) throw error;
      
      toast.success('Expense type updated successfully');
      setIsEditDialogOpen(false);
      fetchExpenseTypes();
    } catch (error: any) {
      console.error('Error updating expense type:', error);
      toast.error(error.message || 'Failed to update expense type');
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!currentExpenseType) return;
      
      const { error } = await supabase
        .from('expense_types')
        .delete()
        .eq('id', currentExpenseType.id);
      
      if (error) throw error;
      
      toast.success('Expense type deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchExpenseTypes();
    } catch (error: any) {
      console.error('Error deleting expense type:', error);
      toast.error(error.message || 'Failed to delete expense type');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Expense Types</CardTitle>
          <CardDescription>
            Manage expense types for categorizing transactions
          </CardDescription>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense Type
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading expense types...</div>
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
              {expenseTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No expense types found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                expenseTypes.map((expenseType) => (
                  <TableRow key={expenseType.id}>
                    <TableCell>{expenseType.name}</TableCell>
                    <TableCell>
                      {expenseType.active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(expenseType)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expenseType)}>
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
            <DialogTitle>Add Expense Type</DialogTitle>
            <DialogDescription>
              Create a new expense type for categorizing transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter expense type name"
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
              Add Expense Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense Type</DialogTitle>
            <DialogDescription>
              Update the expense type's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter expense type name"
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
            <AlertDialogTitle>Delete Expense Type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense type "{currentExpenseType?.name}".
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

export default ExpenseTypeConfig;
