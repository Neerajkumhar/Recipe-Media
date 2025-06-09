import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryListState {
  items: GroceryItem[];
}

const initialState: GroceryListState = {
  items: [],
};

const groceryListSlice = createSlice({
  name: 'groceryList',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<GroceryItem>) {
      state.items.push(action.payload);
    },
    updateItem(state, action: PayloadAction<{ id: string; updates: Partial<GroceryItem> }>) {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { addItem, updateItem, removeItem } = groceryListSlice.actions;
export default groceryListSlice.reducer;
