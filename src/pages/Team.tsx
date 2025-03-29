
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { useCashflow } from '@/context/CashflowContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Team = () => {
  const { users, transactions } = useCashflow();
  
  // Calculate statistics for each user
  const userStats = users.map(user => {
    const userTransactions = transactions.filter(t => t.createdBy === user.id);
    const totalTransactions = userTransactions.length;
    
    const incomeTransactions = userTransactions.filter(t => t.type === 'income');
    const expenseTransactions = userTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      user,
      totalTransactions,
      totalIncome,
      totalExpenses,
      lastActivity: userTransactions.length > 0 
        ? new Date(Math.max(...userTransactions.map(t => new Date(t.date).getTime())))
        : null
    };
  });
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Team" 
          description="Team members with access to the cashflow system"
        />
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Income Managed</TableHead>
                  <TableHead>Expenses Managed</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.map(({ user, totalTransactions, totalIncome, totalExpenses, lastActivity }) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.split(' ').map(part => part[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">User ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{totalTransactions}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(totalIncome)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(totalExpenses)}
                    </TableCell>
                    <TableCell>
                      {lastActivity 
                        ? lastActivity.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) 
                        : 'No activity'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Team;
