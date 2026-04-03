import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FilterState, Priority } from '../types';

const THEME_KEY = 'kanban_theme';

interface UiState {
  theme: 'light' | 'dark';
  filter: FilterState;
}

function loadTheme(): 'light' | 'dark' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
}

const initialState: UiState = {
  theme: loadTheme(),
  filter: { search: '', priority: 'all' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, state.theme);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filter.search = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<Priority | 'all'>) {
      state.filter.priority = action.payload;
    },
  },
});

export const { toggleTheme, setSearch, setPriorityFilter } = uiSlice.actions;
export default uiSlice.reducer;
