export type Priority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'user';

export interface Comment {
  id: string;
  authorName: string;
  authorColor: string;
  text: string;
  createdAt: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  columnId: string;
  progress: number;
  assignees: Assignee[];
  comments: Comment[];
  createdAt: string;
  deadline: string | null;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  taskIds: string[];
}

export interface AddTaskFormValues {
  title: string;
  description: string;
  priority: Priority;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: UserRole;
}

export interface StoredUser extends User {
  password: string;
}

export interface FilterState {
  search: string;
  priority: Priority | 'all';
}
