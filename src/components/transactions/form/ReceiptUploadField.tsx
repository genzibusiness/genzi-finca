
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ReceiptUploadFieldProps {
  form: UseFormReturn<any>;
  onExtractedData?: (data: any) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

const ReceiptUploadField: React.FC<ReceiptUploadFieldProps> = ({ form, onExtractedData }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setStatusMessage('Uploading file...');

    try {
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get a URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 60); // 60 seconds validity

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get file URL');
      }

      // Store the receipt URL in the form
      form.setValue('receipt_url', `receipts/${filePath}`);
      
      // Update status
      setUploadStatus('processing');
      setStatusMessage('Extracting data from receipt...');

      // Call OCR function to extract data
      const response = await supabase.functions.invoke('ocr-extract', {
        body: {
          fileUrl: urlData.signedUrl,
          fileName: file.name
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'OCR extraction failed');
      }

      // Process the extracted data
      const extractedData = response.data.data;
      
      // Update form fields with extracted data
      if (extractedData) {
        if (extractedData.date) {
          form.setValue('date', new Date(extractedData.date));
        }
        
        if (extractedData.amount) {
          form.setValue('amount', extractedData.amount);
        }
        
        if (extractedData.expense_type) {
          form.setValue('expense_type', extractedData.expense_type);
        }
        
        if (extractedData.vendor_name && form.getValues('comment') === '') {
          form.setValue('comment', `Vendor: ${extractedData.vendor_name}`);
        }
        
        // Call the callback with extracted data
        if (onExtractedData) {
          onExtractedData(extractedData);
        }
      }

      setUploadStatus('success');
      setStatusMessage('Data extracted successfully!');
      toast.success('Receipt processed successfully');
    } catch (error: any) {
      console.error('Error uploading or processing receipt:', error);
      setUploadStatus('error');
      setStatusMessage('Failed to process receipt');
      toast.error(`Error: ${error.message}`);
      
      // Keep the receipt URL even if OCR fails
      if (form.getValues('receipt_url')) {
        toast.info('Receipt was uploaded but data extraction failed. You can fill in the details manually.');
      }
    }
  };

  // Get the status component based on current state
  const renderStatusComponent = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <FormField
      control={form.control}
      name="receipt_url"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Upload Receipt/Invoice</FormLabel>
          <div className="space-y-2">
            <FormControl>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row w-full items-start sm:items-center gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                    className={`${isMobile ? 'w-full' : 'flex-1'} justify-start text-xs sm:text-sm`}
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                  >
                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Upload Receipt or Invoice (PDF)</span>
                  </Button>
                  <div className="flex-shrink-0 ml-auto sm:ml-0">
                    {renderStatusComponent()}
                  </div>
                </div>
                
                <Input
                  id="receipt-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {fileName && (
                  <div className="text-xs sm:text-sm break-all bg-muted p-2 rounded">
                    <span className="font-medium">File: </span> 
                    {fileName}
                  </div>
                )}
                
                {statusMessage && (
                  <div className={`text-xs sm:text-sm ${uploadStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'} p-2 bg-muted/50 rounded`}>
                    {statusMessage}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ReceiptUploadField;
