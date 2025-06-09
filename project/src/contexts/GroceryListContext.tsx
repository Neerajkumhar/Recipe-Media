import React, { createContext, useContext, useState, useEffect } from 'react';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryListContextType {
  items: GroceryItem[];
  addItem: (name: string, quantity: string) => void;
  removeItem: (id: string) => void;
}

const GroceryListContext = createContext<GroceryListContextType | null>(null);

export const GroceryListProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('groceryList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(items));
  }, [items]);

  const value = {
    items,
    addItem: (name: string, quantity: string) => {
      setItems(prev => [...prev, { id: Date.now().toString(), name, quantity }]);
    },
    removeItem: (id: string) => {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <GroceryListContext.Provider value={value}>
      {children}
    </GroceryListContext.Provider>
  );
};

export const useGroceryList = () => {
  const context = useContext(GroceryListContext);
  if (!context) {
    throw new Error('useGroceryList must be used within GroceryListProvider');
  }
  return context;
};

export default GroceryListContext;
