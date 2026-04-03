import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Column, Comment, Assignee } from '../types';

const BOARD_KEY = 'kanban_board';

interface BoardState {
  columns: Column[];
  tasks: Record<string, Task>;
}

const defaultState: BoardState = {
  columns: [
    { id: 'todo',        name: 'To Do',       color: '#6366f1', taskIds: ['task-1', 'task-2'] },
    { id: 'in-progress', name: 'In Progress',  color: '#f59e0b', taskIds: ['task-3'] },
    { id: 'done',        name: 'Done',         color: '#10b981', taskIds: ['task-4'] },
  ],
  tasks: {
    'task-1': {
      id: 'task-1', title: 'Design UI mockups',
      description: 'Create wireframes for the main screens',
      priority: 'high', columnId: 'todo', progress: 0,
      assignees: [], deadline: null, createdAt: new Date().toISOString(),
      comments: [
        { id: 'c1', authorName: 'Alice', authorColor: '#6366f1', text: 'Should we use Figma or Sketch?', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: 'c2', authorName: 'Bob',   authorColor: '#f59e0b', text: 'Figma works great, already started a draft.', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: 'c3', authorName: 'Alice', authorColor: '#6366f1', text: 'Perfect, will review tomorrow.', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ],
    },
    'task-2': {
      id: 'task-2', title: 'Set up project structure',
      description: 'Initialize repo and configure build tools',
      priority: 'medium', columnId: 'todo', progress: 20,
      assignees: [], deadline: null, createdAt: new Date().toISOString(), comments: [],
    },
    'task-3': {
      id: 'task-3', title: 'Implement authentication',
      description: 'Add login and registration pages',
      priority: 'high', columnId: 'in-progress', progress: 60,
      assignees: [], deadline: null, createdAt: new Date().toISOString(),
      comments: [
        { id: 'c4', authorName: 'Carol', authorColor: '#10b981', text: 'JWT or session-based auth?', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
        { id: 'c5', authorName: 'Bob',   authorColor: '#f59e0b', text: 'JWT with refresh tokens. More scalable.', createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
      ],
    },
    'task-4': {
      id: 'task-4', title: 'Write project docs',
      description: 'Document the API and component library',
      priority: 'low', columnId: 'done', progress: 100,
      assignees: [], deadline: null, createdAt: new Date().toISOString(),
      comments: [
        { id: 'c6', authorName: 'Alice', authorColor: '#6366f1', text: 'Docs look great, good job!', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 'c7', authorName: 'Carol', authorColor: '#10b981', text: 'Added a few missing endpoint descriptions.', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ],
    },
  },
};

function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? (JSON.parse(raw) as BoardState) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveBoard(state: BoardState) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(state));
  } catch {}
}

const boardSlice = createSlice({
  name: 'board',
  initialState: loadBoard(),
  reducers: {
    addTask(state, action: PayloadAction<{ columnId: string; taskData: Omit<Task, 'id' | 'columnId' | 'createdAt' | 'comments' | 'assignees'> }>) {
      const { columnId, taskData } = action.payload;
      const id = uuidv4();
      state.tasks[id] = { id, columnId, createdAt: new Date().toISOString(), comments: [], assignees: [], ...taskData };
      state.columns.find((c) => c.id === columnId)?.taskIds.push(id);
      saveBoard({ columns: state.columns, tasks: state.tasks });
    },
    moveTask(state, action: PayloadAction<{ taskId: string; fromColumnId: string; toColumnId: string; overTaskId?: string }>) {
      const { taskId, fromColumnId, toColumnId, overTaskId } = action.payload;
      const fromCol = state.columns.find((c) => c.id === fromColumnId);
      const toCol   = state.columns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return;
      fromCol.taskIds = fromCol.taskIds.filter((id) => id !== taskId);
      toCol.taskIds   = toCol.taskIds.filter((id) => id !== taskId);
      if (overTaskId) {
        const idx = toCol.taskIds.indexOf(overTaskId);
        idx >= 0 ? toCol.taskIds.splice(idx, 0, taskId) : toCol.taskIds.push(taskId);
      } else {
        toCol.taskIds.push(taskId);
      }
      state.tasks[taskId]!.columnId = toColumnId;
      saveBoard({ columns: state.columns, tasks: state.tasks });
    },
    deleteTask(state, action: PayloadAction<{ taskId: string; columnId: string }>) {
      const { taskId, columnId } = action.payload;
      delete state.tasks[taskId];
      const col = state.columns.find((c) => c.id === columnId);
      if (col) col.taskIds = col.taskIds.filter((id) => id !== taskId);
      saveBoard({ columns: state.columns, tasks: state.tasks });
    },
    updateTask(state, action: PayloadAction<{ taskId: string; changes: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'progress' | 'deadline'>> }>) {
      const { taskId, changes } = action.payload;
      if (state.tasks[taskId]) {
        Object.assign(state.tasks[taskId]!, changes);
        saveBoard({ columns: state.columns, tasks: state.tasks });
      }
    },
    toggleAssignee(state, action: PayloadAction<{ taskId: string; assignee: Assignee }>) {
      const { taskId, assignee } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return;
      const idx = task.assignees.findIndex((a) => a.id === assignee.id);
      if (idx >= 0) task.assignees.splice(idx, 1);
      else           task.assignees.push(assignee);
      saveBoard({ columns: state.columns, tasks: state.tasks });
    },
    addComment(state, action: PayloadAction<{ taskId: string; comment: Omit<Comment, 'id' | 'createdAt'> }>) {
      const { taskId, comment } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return;
      task.comments.push({ id: uuidv4(), createdAt: new Date().toISOString(), ...comment });
      saveBoard({ columns: state.columns, tasks: state.tasks });
    },
  },
});

export const { addTask, moveTask, deleteTask, updateTask, toggleAssignee, addComment } = boardSlice.actions;
export default boardSlice.reducer;
