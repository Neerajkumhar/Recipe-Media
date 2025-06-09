import React, { createContext, useContext, useState } from 'react';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryListContextType {
  groceryList: GroceryItem[];
  addIngredient: (item: GroceryItem) => void;
  updateIngredient: (id: string, updates: Partial<GroceryItem>) => void;
  removeIngredient: (id: string) => void;
}

const GroceryListContext = createContext<GroceryListContextType | undefined>(undefined);

export function GroceryListProvider({ children }: { children: React.ReactNode }) {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  const addIngredient = (item: GroceryItem) => {
    setGroceryList(prev => [...prev, item]);
  };

  const updateIngredient = (id: string, updates: Partial<GroceryItem>) => {
    setGroceryList(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeIngredient = (id: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <GroceryListContext.Provider
      value={{
        groceryList,
        addIngredient,
        updateIngredient,
        removeIngredient
      }}
    >
      {children}
    </GroceryListContext.Provider>
  );
}

export function useGroceryList() {
  const context = useContext(GroceryListContext);
  if (context === undefined) {
    throw new Error('useGroceryList must be used within GroceryListProvider');
  }
  return context;
}
