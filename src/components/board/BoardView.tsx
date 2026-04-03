import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, closestCorners, useSensor, useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { moveTask } from '../../store/boardSlice';
import Column from '../column/Column';
import Card   from '../card/Card';
import type { Task } from '../../types';
import styles from './boardView.module.css';

function BoardView() {
  const columns  = useAppSelector((s) => s.board.columns);
  const tasks    = useAppSelector((s) => s.board.tasks);
  const filter   = useAppSelector((s) => s.ui.filter);
  const dispatch = useAppDispatch();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findColumnByTaskId = (taskId: string) => columns.find((col) => col.taskIds.includes(taskId));

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks[e.active.id as string];
    if (task) setActiveTask(task);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id as string, overId = over.id as string;
    const activeColumn = findColumnByTaskId(activeId);
    const overColumn   = columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);
    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;
    dispatch(moveTask({ taskId: activeId, fromColumnId: activeColumn.id, toColumnId: overColumn.id, overTaskId: overColumn.taskIds.includes(overId) ? overId : undefined }));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string, overId = over.id as string;
    const activeColumn = findColumnByTaskId(activeId);
    const overColumn   = columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);
    if (!activeColumn || !overColumn || activeColumn.id !== overColumn.id) return;
    const overTaskId = overColumn.taskIds.includes(overId) ? overId : undefined;
    if (overTaskId && activeId !== overId)
      dispatch(moveTask({ taskId: activeId, fromColumnId: activeColumn.id, toColumnId: overColumn.id, overTaskId }));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className={styles.columnsWrapper}>
        {columns.map((column) => (
          <Column key={column.id} column={column} filter={filter} />
        ))}
      </div>
      <DragOverlay>{activeTask && <Card task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}

export default BoardView;
