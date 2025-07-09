import React, { createContext, useContext } from 'react';

const DataContext = createContext(null);
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export default DataContext; 