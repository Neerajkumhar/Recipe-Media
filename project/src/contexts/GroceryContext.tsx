import React, { createContext, useContext, useState, useEffect } from 'react';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryContextType {
  items: GroceryItem[];
  addItem: (name: string, quantity: string) => void;
  removeItem: (id: string) => void;
}

const GroceryContext = createContext<GroceryContextType | null>(null);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('groceryList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(items));
  }, [items]);

  const addItem = (name: string, quantity: string) => {
    setItems(prev => [...prev, { id: Date.now().toString(), name, quantity }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <GroceryContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </GroceryContext.Provider>
  );
};

export const useGroceryList = () => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGroceryList must be used within GroceryProvider');
  }
  return context;
};

export default GroceryContext;
