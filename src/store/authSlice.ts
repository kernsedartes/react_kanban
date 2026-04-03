import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, StoredUser } from '../types';

interface AuthState {
  user: User | null;
}

const SESSION_KEY = 'kanban_user';
const USERS_KEY   = 'kanban_users';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: loadUser() } as AuthState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem(SESSION_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem(SESSION_KEY);
    },
    updateProfile(state, action: PayloadAction<Partial<Pick<User, 'name' | 'avatarColor'>>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(SESSION_KEY, JSON.stringify(state.user));
      const users   = getStoredUsers();
      const updated = users.map((u) =>
        u.id === state.user!.id ? { ...u, ...action.payload } : u
      );
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    },
  },
});

export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredUser(user: StoredUser): void {
  const users = getStoredUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export function changePassword(userId: string, newPassword: string): boolean {
  try {
    const users = getStoredUsers();
    const idx   = users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], password: newPassword };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

export const { loginSuccess, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
