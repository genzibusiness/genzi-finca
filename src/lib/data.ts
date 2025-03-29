
import { Category, SubCategory, Transaction, User, TransactionStatus } from "@/types/cashflow";

// Mock users
export const mockUsers: User[] = [
  { id: 'user1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: 'user2', name: 'Sam Taylor', email: 'sam@example.com' },
  { id: 'user3', name: 'Jordan Lee', email: 'jordan@example.com' },
  { id: 'user4', name: 'Morgan Smith', email: 'morgan@example.com' },
  { id: 'user5', name: 'Casey Brown', email: 'casey@example.com' },
];

// Categories
export const mockCategories: Category[] = [
  { id: 'cat1', name: 'Salary' },
  { id: 'cat2', name: 'Investment' },
  { id: 'cat3', name: 'Office Supplies' },
  { id: 'cat4', name: 'Software & Services' },
  { id: 'cat5', name: 'Marketing' },
  { id: 'cat6', name: 'Travel' },
  { id: 'cat7', name: 'Utilities' },
  { id: 'cat8', name: 'Rent' },
  { id: 'cat9', name: 'Miscellaneous' },
];

// Sub-categories
export const mockSubCategories: SubCategory[] = [
  // Salary subcategories
  { id: 'subcat1', name: 'Regular Salary', categoryId: 'cat1' },
  { id: 'subcat2', name: 'Bonus', categoryId: 'cat1' },
  
  // Investment subcategories
  { id: 'subcat3', name: 'Interest', categoryId: 'cat2' },
  { id: 'subcat4', name: 'Returns', categoryId: 'cat2' },
  
  // Office Supplies subcategories
  { id: 'subcat5', name: 'Stationery', categoryId: 'cat3' },
  { id: 'subcat6', name: 'Furniture', categoryId: 'cat3' },
  { id: 'subcat7', name: 'Equipment', categoryId: 'cat3' },
  
  // Software & Services subcategories
  { id: 'subcat8', name: 'SaaS Subscriptions', categoryId: 'cat4' },
  { id: 'subcat9', name: 'Development Tools', categoryId: 'cat4' },
  { id: 'subcat10', name: 'Hosting', categoryId: 'cat4' },
  
  // Marketing subcategories
  { id: 'subcat11', name: 'Digital Ads', categoryId: 'cat5' },
  { id: 'subcat12', name: 'Content Creation', categoryId: 'cat5' },
  { id: 'subcat13', name: 'Events', categoryId: 'cat5' },
  
  // Travel subcategories
  { id: 'subcat14', name: 'Airfare', categoryId: 'cat6' },
  { id: 'subcat15', name: 'Accommodation', categoryId: 'cat6' },
  { id: 'subcat16', name: 'Local Transport', categoryId: 'cat6' },
  { id: 'subcat17', name: 'Meals', categoryId: 'cat6' },
  
  // Utilities subcategories
  { id: 'subcat18', name: 'Electricity', categoryId: 'cat7' },
  { id: 'subcat19', name: 'Internet', categoryId: 'cat7' },
  { id: 'subcat20', name: 'Phone', categoryId: 'cat7' },
  
  // Rent subcategories
  { id: 'subcat21', name: 'Office Space', categoryId: 'cat8' },
  { id: 'subcat22', name: 'Meeting Rooms', categoryId: 'cat8' },
  
  // Miscellaneous subcategories
  { id: 'subcat23', name: 'Team Building', categoryId: 'cat9' },
  { id: 'subcat24', name: 'Professional Services', categoryId: 'cat9' },
  { id: 'subcat25', name: 'Other', categoryId: 'cat9' },
];

// Generate random date within the last 6 months
const getRandomDate = () => {
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime());
  const randomDate = new Date(randomTime);
  
  return randomDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Generate random transactions
export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isExpense = Math.random() > 0.3; // 70% chance of being an expense
    
    // Random amount (larger for income, smaller for expenses)
    const amount = isExpense 
      ? Math.floor(Math.random() * 5000) + 50 // Expenses: $50 to $5,050
      : Math.floor(Math.random() * 15000) + 5000; // Income: $5,000 to $20,000
    
    // Random status with weighted probabilities
    const statuses: TransactionStatus[] = ['yet_to_be_paid', 'paid', 'yet_to_be_received', 'received'];
    const statusIndex = Math.floor(Math.random() * statuses.length);
    
    // Random user who created the transaction
    const userId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    transactions.push({
      id: `trans${i + 1}`,
      amount,
      date: getRandomDate(),
      type: isExpense ? 'expense' : 'income',
      currency: 'USD', // Default currency
      expense_type: isExpense ? 'Salary' : null,
      comment: `Sample transaction ${i + 1}`,
      user_id: userId,
      status: isExpense ? (Math.random() > 0.5 ? 'paid' : 'yet_to_be_paid') : 
                          (Math.random() > 0.5 ? 'received' : 'yet_to_be_received'),
      created_at: today.toISOString(),
      updated_at: today.toISOString()
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate mock transactions
export const mockTransactions = generateMockTransactions(150);
