
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
import { Pencil, Trash, Plus, RefreshCw } from 'lucide-react';
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

interface CurrencyRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const CurrencyRateConfig = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRate, setCurrentRate] = useState<CurrencyRate | null>(null);
  const [formData, setFormData] = useState({ 
    from_currency: '', 
    to_currency: '', 
    rate: ''
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch currency rates
      const { data: rateData, error: rateError } = await supabase
        .from('currency_rates')
        .select('*')
        .order('from_currency');
      
      if (rateError) throw rateError;
      setRates(rateData || []);
      
      // Fetch currencies for the dropdowns
      const { data: currencyData, error: currencyError } = await supabase
        .from('currencies')
        .select('code, name, symbol')
        .eq('active', true);
      
      if (currencyError) throw currencyError;
      setCurrencies(currencyData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load currency rates');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    const defaultCurrencies = currencies.length >= 2 ? 
      { from: currencies[0].code, to: currencies[1].code } :
      { from: '', to: '' };
    
    setFormData({ 
      from_currency: defaultCurrencies.from, 
      to_currency: defaultCurrencies.to, 
      rate: ''
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (rate: CurrencyRate) => {
    setCurrentRate(rate);
    setFormData({ 
      from_currency: rate.from_currency, 
      to_currency: rate.to_currency, 
      rate: rate.rate.toString() 
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (rate: CurrencyRate) => {
    setCurrentRate(rate);
    setIsDeleteDialogOpen(true);
  };
  
  const validateForm = () => {
    if (!formData.from_currency) {
      toast.error('From currency is required');
      return false;
    }
    if (!formData.to_currency) {
      toast.error('To currency is required');
      return false;
    }
    if (formData.from_currency === formData.to_currency) {
      toast.error('From and To currencies must be different');
      return false;
    }
    if (!formData.rate || isNaN(Number(formData.rate)) || Number(formData.rate) <= 0) {
      toast.error('Rate must be a positive number');
      return false;
    }
    return true;
  };
  
  const handleSubmitAdd = async () => {
    try {
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('currency_rates')
        .insert([{ 
          from_currency: formData.from_currency, 
          to_currency: formData.to_currency,
          rate: Number(formData.rate)
        }]);
      
      if (error) throw error;
      
      toast.success('Currency rate added successfully');
      setIsAddDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding currency rate:', error);
      toast.error(error.message || 'Failed to add currency rate');
    }
  };
  
  const handleSubmitEdit = async () => {
    try {
      if (!currentRate) return;
      if (!validateForm()) return;
      
      const { error } = await supabase
        .from('currency_rates')
        .update({ 
          rate: Number(formData.rate)
        })
        .eq('id', currentRate.id);
      
      if (error) throw error;
      
      toast.success('Currency rate updated successfully');
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating currency rate:', error);
      toast.error(error.message || 'Failed to update currency rate');
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!currentRate) return;
      
      const { error } = await supabase
        .from('currency_rates')
        .delete()
        .eq('id', currentRate.id);
      
      if (error) throw error;
      
      toast.success('Currency rate deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting currency rate:', error);
      toast.error(error.message || 'Failed to delete currency rate');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Currency Conversion Rates</CardTitle>
          <CardDescription>
            Manage exchange rates between currencies
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading currency rates...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No currency rates found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.from_currency}</TableCell>
                    <TableCell>{rate.to_currency}</TableCell>
                    <TableCell>{rate.rate.toFixed(4)}</TableCell>
                    <TableCell>{formatDate(rate.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(rate)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(rate)}>
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
            <DialogTitle>Add Currency Rate</DialogTitle>
            <DialogDescription>
              Create a new currency conversion rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from_currency">From Currency</Label>
              <Select
                value={formData.from_currency}
                onValueChange={(value) => setFormData({ ...formData, from_currency: value })}
              >
                <SelectTrigger id="from_currency">
                  <SelectValue placeholder="Select from currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={`from-${currency.code}`} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_currency">To Currency</Label>
              <Select
                value={formData.to_currency}
                onValueChange={(value) => setFormData({ ...formData, to_currency: value })}
              >
                <SelectTrigger id="to_currency">
                  <SelectValue placeholder="Select to currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={`to-${currency.code}`} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Exchange Rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g. 1.3456"
              />
              <p className="text-xs text-muted-foreground">
                1 {formData.from_currency} = ? {formData.to_currency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd}>
              Add Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Currency Rate</DialogTitle>
            <DialogDescription>
              Update the currency conversion rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-from">From Currency</Label>
              <Input
                id="edit-from"
                value={formData.from_currency}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-to">To Currency</Label>
              <Input
                id="edit-to"
                value={formData.to_currency}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Exchange Rate</Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g. 1.3456"
              />
              <p className="text-xs text-muted-foreground">
                1 {formData.from_currency} = ? {formData.to_currency}
              </p>
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
            <AlertDialogTitle>Delete Currency Rate?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              rate for {currentRate?.from_currency} to {currentRate?.to_currency}.
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

export default CurrencyRateConfig;
