// src/context/GroceryListContext.tsx

import React, { createContext, useContext, useState } from "react";

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryListContextType {
  groceryList: GroceryItem[];
  addIngredient: (item: GroceryItem) => void;
  updateIngredient: (item: GroceryItem) => void;
  removeIngredient: (id: string) => void;
  clearList: () => void;
}

const GroceryListContext = createContext<GroceryListContextType | undefined>(undefined);

export const GroceryListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  const addIngredient = (item: GroceryItem) => {
    setGroceryList(prev => [...prev, item]);
  };

  const updateIngredient = (item: GroceryItem) => {
    setGroceryList(prev => prev.map(i => (i.id === item.id ? item : i)));
  };

  const removeIngredient = (id: string) => {
    setGroceryList(prev => prev.filter(i => i.id !== id));
  };

  const clearList = () => {
    setGroceryList([]);
  };

  return (
    <GroceryListContext.Provider value={{ groceryList, addIngredient, updateIngredient, removeIngredient, clearList }}>
      {children}
    </GroceryListContext.Provider>
  );
};

export const useGroceryList = () => {
  const context = useContext(GroceryListContext);
  if (!context) throw new Error("useGroceryList must be used within GroceryListProvider");
  return context;
};
