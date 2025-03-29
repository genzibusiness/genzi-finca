
import { Category, SubCategory, Transaction, User } from "@/types/cashflow";

// Mock users
export const mockUsers: User[] = [
  { id: 'user1', name: 'Alex Johnson' },
  { id: 'user2', name: 'Sam Taylor' },
  { id: 'user3', name: 'Jordan Lee' },
  { id: 'user4', name: 'Morgan Smith' },
  { id: 'user5', name: 'Casey Brown' },
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
    
    // Select appropriate categories based on transaction type
    let categoryId: string;
    let subCategoryId: string;
    
    if (isExpense) {
      // For expenses, use categories 3-9
      const expenseCatIds = mockCategories
        .filter(cat => ['cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8', 'cat9'].includes(cat.id))
        .map(cat => cat.id);
      categoryId = expenseCatIds[Math.floor(Math.random() * expenseCatIds.length)];
    } else {
      // For income, use categories 1-2
      const incomeCatIds = mockCategories
        .filter(cat => ['cat1', 'cat2'].includes(cat.id))
        .map(cat => cat.id);
      categoryId = incomeCatIds[Math.floor(Math.random() * incomeCatIds.length)];
    }
    
    // Get valid subcategories for the selected category
    const validSubCategories = mockSubCategories.filter(subCat => subCat.categoryId === categoryId);
    subCategoryId = validSubCategories[Math.floor(Math.random() * validSubCategories.length)].id;
    
    // Generate random amount (larger for income, smaller for expenses)
    const amount = isExpense 
      ? Math.floor(Math.random() * 5000) + 50 // Expenses: $50 to $5,050
      : Math.floor(Math.random() * 15000) + 5000; // Income: $5,000 to $20,000
    
    // Random descriptions based on subcategory
    const subCategoryName = mockSubCategories.find(sc => sc.id === subCategoryId)?.name;
    const descriptions = {
      'Regular Salary': ['Monthly Salary', 'Salary Payment', 'Regular Compensation'],
      'Bonus': ['Quarterly Bonus', 'Performance Bonus', 'Year-end Bonus'],
      'Interest': ['Interest Income', 'Savings Interest', 'Investment Interest'],
      'Returns': ['Dividend Payment', 'Investment Return', 'Capital Gain'],
      'Stationery': ['Office Supplies', 'Paper, Pens, etc.', 'Notebooks and Planners'],
      'Furniture': ['Office Chairs', 'Desks Purchase', 'Filing Cabinets'],
      'Equipment': ['Computer Hardware', 'Office Equipment', 'Tech Gadgets'],
      'SaaS Subscriptions': ['Slack Subscription', 'Zoom Annual Plan', 'Adobe Creative Cloud'],
      'Development Tools': ['Development Software', 'GitHub Pro', 'Code Editors'],
      'Hosting': ['AWS Monthly', 'Google Cloud Services', 'Server Costs'],
      'Digital Ads': ['Google Ads Campaign', 'Social Media Advertising', 'LinkedIn Ads'],
      'Content Creation': ['Blog Writing', 'Video Production', 'Graphic Design'],
      'Events': ['Conference Sponsorship', 'Networking Event', 'Industry Meetup'],
      'Airfare': ['Flight Tickets', 'Business Trip Airfare', 'Team Travel'],
      'Accommodation': ['Hotel Stay', 'Airbnb for Business Trip', 'Lodging Expenses'],
      'Local Transport': ['Taxi Services', 'Uber/Lyft', 'Car Rental'],
      'Meals': ['Business Lunch', 'Team Dinner', 'Client Meeting Refreshments'],
      'Electricity': ['Monthly Electricity Bill', 'Power Utilities', 'Energy Costs'],
      'Internet': ['Broadband Subscription', 'Internet Service', 'WiFi Costs'],
      'Phone': ['Office Phone Lines', 'Mobile Plan', 'Telecom Services'],
      'Office Space': ['Monthly Office Rent', 'Workspace Lease', 'Office Rental'],
      'Meeting Rooms': ['Conference Room Booking', 'Event Space Rental', 'Co-working Day Pass'],
      'Team Building': ['Team Lunch', 'Company Retreat', 'Office Celebration'],
      'Professional Services': ['Legal Consultation', 'Accounting Services', 'HR Support'],
      'Other': ['Miscellaneous Expense', 'Unplanned Purchase', 'Petty Cash Spending']
    };
    
    // Default description if subcategory description isn't defined
    const defaultDescriptions = ['Business Expense', 'Company Purchase', 'Operational Cost'];
    const descriptionOptions = descriptions[subCategoryName as keyof typeof descriptions] || defaultDescriptions;
    const description = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
    
    // Random status with weighted probabilities
    const statuses: TransactionStatus[] = ['pending', 'done', 'cancelled', 'recurring'];
    const statusWeights = [0.1, 0.7, 0.05, 0.15]; // 10% pending, 70% done, 5% cancelled, 15% recurring
    
    let statusIndex = 0;
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < statusWeights.length; i++) {
      cumulativeWeight += statusWeights[i];
      if (randomValue <= cumulativeWeight) {
        statusIndex = i;
        break;
      }
    }
    
    // Random user who created the transaction
    const createdBy = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
    
    transactions.push({
      id: `trans${i + 1}`,
      amount,
      description,
      date: getRandomDate(),
      type: isExpense ? 'expense' : 'income',
      categoryId,
      subCategoryId,
      status: statuses[statusIndex],
      createdBy
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate mock transactions
export const mockTransactions = generateMockTransactions(150);
