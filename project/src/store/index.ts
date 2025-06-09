import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import groceryListReducer from './groceryListSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    groceryList: groceryListReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
