
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

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const CurrencyConfig = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '', 
    symbol: '',
    active: true 
  });
  
  useEffect(() => {
    fetchCurrencies();
  }, []);
  
  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code');
      
      if (error) throw error;
      
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('Failed to load currencies');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    setFormData({ code: '', name: '', symbol: '', active: true });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (currency: Currency) => {
    setCurrentCurrency(currency);
    setFormData({ 
      code: currency.code, 
      name: currency.name, 
      symbol: currency.symbol, 
      active: currency.active 
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (currency: Currency) => {
    setCurrentCurrency(currency);
    setIsDeleteDialogOpen(true);
  };
  
  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error('Currency code is required');
      return false;
    }
    if (!formData.name.trim()) {
      toast.error('Currency name is required');
      return false;
    }
    if (!formData.symbol.trim()) {
      toast.error('Currency symbol is required');
      return false;
    }
    return true;
  };
  
  const handleSubmitAdd = async () => {
    try {
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('currencies')
        .insert([{ 
          code: formData.code.trim().toUpperCase(), 
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
          active: formData.active 
        }]);
      
      if (error) throw error;
      
      toast.success('Currency added successfully');
      setIsAddDialogOpen(false);
      fetchCurrencies();
    } catch (error: any) {
      console.error('Error adding currency:', error);
      toast.error(error.message || 'Failed to add currency');
    }
  };
  
  const handleSubmitEdit = async () => {
    try {
      if (!currentCurrency) return;
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('currencies')
        .update({ 
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
          active: formData.active 
        })
        .eq('id', currentCurrency.id);
      
      if (error) throw error;
      
      toast.success('Currency updated successfully');
      setIsEditDialogOpen(false);
      fetchCurrencies();
    } catch (error: any) {
      console.error('Error updating currency:', error);
      toast.error(error.message || 'Failed to update currency');
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!currentCurrency) return;
      
      const { error } = await supabase
        .from('currencies')
        .delete()
        .eq('id', currentCurrency.id);
      
      if (error) throw error;
      
      toast.success('Currency deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCurrencies();
    } catch (error: any) {
      console.error('Error deleting currency:', error);
      toast.error(error.message || 'Failed to delete currency');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Currencies</CardTitle>
          <CardDescription>
            Manage currencies used in transactions
          </CardDescription>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Currency
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading currencies...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No currencies found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      {currency.active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(currency)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(currency)}>
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
            <DialogTitle>Add Currency</DialogTitle>
            <DialogDescription>
              Create a new currency for transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. USD, EUR, INR"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. US Dollar, Euro, Indian Rupee"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g. $, €, ₹"
                maxLength={3}
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
              Add Currency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
            <DialogDescription>
              Update the currency's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                disabled
                placeholder="e.g. USD, EUR, INR"
              />
              <p className="text-xs text-muted-foreground">
                Currency code cannot be changed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. US Dollar, Euro, Indian Rupee"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-symbol">Symbol</Label>
              <Input
                id="edit-symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g. $, €, ₹"
                maxLength={3}
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
            <AlertDialogTitle>Delete Currency?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              currency "{currentCurrency?.code} - {currentCurrency?.name}".
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

export default CurrencyConfig;
