import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './boardSlice';
import authReducer  from './authSlice';
import uiReducer    from './uiSlice';
import toastReducer from './toastSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    auth:  authReducer,
    ui:    uiReducer,
    toast: toastReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
