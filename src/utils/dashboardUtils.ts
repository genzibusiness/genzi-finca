
// Utility function to generate subtitle text for dashboard components
export const getSubtitleText = (
  selectedYear: string | null,
  selectedMonth: string | null,
  selectedCategory: string | null,
  selectedType: string | null
): string => {
  const parts = [];
  
  if (selectedYear) {
    parts.push(selectedYear);
  }
  
  if (selectedMonth) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    parts.push(monthNames[parseInt(selectedMonth) - 1]);
  }
  
  if (selectedCategory) {
    parts.push(`Category: ${selectedCategory}`);
  }
  
  if (selectedType) {
    parts.push(`Type: ${selectedType}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'YTD';
};
