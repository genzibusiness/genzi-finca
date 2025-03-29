
import * as XLSX from 'xlsx';

/**
 * Exports data to Excel format and triggers download
 * @param data Array of objects to export
 * @param filename Filename without extension
 */
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Exports data to CSV format and triggers download
 * @param data Array of objects to export
 * @param filename Filename without extension
 */
export const exportToCsv = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  // Create blob and download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
