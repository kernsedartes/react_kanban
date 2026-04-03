import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '../../store/hooks';
import Card from '../card/Card';
import AddCardModal from '../modals/AddCardModal';
import type { Column as ColumnType, FilterState } from '../../types';
import styles from './column.module.css';

interface ColumnProps { column: ColumnType; filter: FilterState; }

function Column({ column, filter }: ColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allTasks = useAppSelector((s) =>
    column.taskIds.map((id) => s.board.tasks[id]).filter(Boolean)
  );

  // Apply search + priority filter
  const tasks = allTasks.filter((task) => {
    if (!task) return false;
    const matchSearch   = !filter.search || task.title.toLowerCase().includes(filter.search.toLowerCase()) || task.description.toLowerCase().includes(filter.search.toLowerCase());
    const matchPriority = filter.priority === 'all' || task.priority === filter.priority;
    return matchSearch && matchPriority;
  });

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <>
      <div className={styles.container} style={{ borderTopColor: column.color }}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.colName}>{column.name}</h3>
            <span className={styles.count}>{tasks.length}</span>
          </div>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)} aria-label="Add card">
            <Plus size={16} />
          </button>
        </div>

        <div ref={setNodeRef} className={styles.cardList} data-over={isOver}>
          <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => task && <Card key={task.id} task={task} />)}
          </SortableContext>
          {tasks.length === 0 && (
            <div className={styles.emptyState}>
              {filter.search || filter.priority !== 'all' ? 'No matches' : 'Drop tasks here'}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <AddCardModal columnId={column.id} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default Column;
