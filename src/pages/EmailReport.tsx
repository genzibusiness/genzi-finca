
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const EmailReport = () => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [newEmail, setNewEmail] = useState('');
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddEmail = () => {
    if (newEmail && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail]);
      setNewEmail('');
    }
  };
  
  const handleRemoveEmail = (index: number) => {
    const updatedEmails = [...emails];
    updatedEmails.splice(index, 1);
    setEmails(updatedEmails);
  };
  
  const handleUpdateEmail = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };
  
  const handleSendReport = async () => {
    // Filter out empty emails
    const validEmails = emails.filter(email => email.trim() !== '');
    
    if (validEmails.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }
    
    if (!includeTransactions && !includeCharts && !includeSummary) {
      toast.error('Please select at least one report component to include');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-report', {
        body: {
          emails: validEmails,
          options: {
            includeTransactions,
            includeCharts,
            includeSummary
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Report sent successfully');
      // Reset form after successful send
      setEmails(['']);
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Failed to send report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-3xl py-6">
        <PageHeader 
          title="Email Report" 
          description="Send financial reports to specified email addresses"
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Send Dashboard Report</CardTitle>
            <CardDescription>
              Create a PDF report of your financial data and send it via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Email Recipients</Label>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleUpdateEmail(index, e.target.value)}
                    placeholder="recipient@example.com"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveEmail(index)}
                    disabled={emails.length === 1 && emails[0] === ''}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Add another email"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddEmail}
                  disabled={!newEmail}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Report Content</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSummary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                  />
                  <label
                    htmlFor="includeSummary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include Financial Summary
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <label
                    htmlFor="includeCharts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include Charts and Visualizations
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTransactions"
                    checked={includeTransactions}
                    onCheckedChange={(checked) => setIncludeTransactions(checked as boolean)}
                  />
                  <label
                    htmlFor="includeTransactions"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include Recent Transactions
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => setEmails([''])}>
              Reset
            </Button>
            <Button onClick={handleSendReport} disabled={isLoading || emails.every(email => !email)}>
              {isLoading ? 'Sending...' : 'Send Report'}
              {!isLoading && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EmailReport;
