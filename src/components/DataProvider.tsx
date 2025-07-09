import React, { useState } from 'react';
import DataContext, { useData } from '../contexts/DataContext';

const initialData = {
  vendors: [
    { id: '1', name: 'ABC Property Management', email: 'abc@property.com', type: 'Rent', preferredMethod: 'ACH', lastPayment: '2025-06-15', amount: 2500, stripeAccountId: 'acct_1ABC123Demo', onboarded: true },
    { id: '2', name: 'State University', email: 'billing@university.edu', type: 'Tuition', preferredMethod: 'Wire', lastPayment: '2025-06-01', amount: 5000, stripeAccountId: 'acct_1DEF456Demo', onboarded: true },
    { id: '3', name: 'City Medical Center', email: 'payments@medical.com', type: 'Medical', preferredMethod: 'Check', lastPayment: '2025-05-20', amount: 1200, stripeAccountId: null, onboarded: false },
  ],
  transactions: [
    { id: 1, date: '2025-06-28', merchant: 'ABC Property Management', amount: 2500, fee: 87.50, status: 'Completed', method: 'ACH', stripePaymentId: 'pi_demo_1ABC' },
    { id: 2, date: '2025-06-25', merchant: 'State University', amount: 5000, fee: 175.00, status: 'Completed', method: 'Wire', stripePaymentId: 'pi_demo_2DEF' },
    { id: 3, date: '2025-06-20', merchant: 'City Medical Center', amount: 1200, fee: 42.00, status: 'Processing', method: 'Check', stripePaymentId: 'pi_demo_3GHI' },
  ],
  cards: [
    { id: 1, last4: '4242', brand: 'Visa', name: 'Personal Card', expiry: '12/26', isDefault: true },
    { id: 2, last4: '5555', brand: 'Mastercard', name: 'Business Card', expiry: '08/25', isDefault: false },
  ],
  recurringPayments: [
    { id: 1, vendor: 'ABC Property Management', amount: 2500, frequency: 'Monthly', nextDate: '2025-07-01', active: true },
    { id: 2, vendor: 'State University', amount: 5000, frequency: 'Quarterly', nextDate: '2025-09-01', active: true },
  ]
};

export interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [vendors, setVendors] = useState(initialData.vendors);
  const [transactions, setTransactions] = useState(initialData.transactions);
  const [cards, setCards] = useState(initialData.cards);
  const [recurringPayments, setRecurringPayments] = useState(initialData.recurringPayments);

  const addVendor = (vendor) => {
    setVendors([...vendors, vendor]);
  };

  const updateVendor = (id, updates) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const value = {
    vendors,
    transactions,
    cards,
    recurringPayments,
    addVendor,
    updateVendor,
    addTransaction,
    setVendors,
    setTransactions,
    setCards,
    setRecurringPayments
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export { useData }; 