import { useState } from 'react';
import { Trash2, MessageSquare, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/toastSlice';
import { deleteTask } from '../../store/boardSlice';
import TaskModal from '../taskModal/TaskModal';
import type { Task } from '../../types';
import styles from './card.module.css';

interface CardProps { task: Task; }

const priorityConfig = {
  low:    { label: 'Low',    className: styles.priorityLow    },
  medium: { label: 'Medium', className: styles.priorityMedium },
  high:   { label: 'High',   className: styles.priorityHigh   },
};

const MAX_VISIBLE = 3;

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const days  = Math.ceil(diff / 86400000);
  if (days < 0)  return { label: `Overdue ${Math.abs(days)}d`, cls: styles.deadlineOverdue };
  if (days <= 2) return { label: days === 0 ? 'Due today' : `${days}d left`, cls: styles.deadlineSoon };
  return { label: `${days}d left`, cls: styles.deadlineOk };
}

function Card({ task }: CardProps) {
  const [isHovered,   setIsHovered]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style    = { transform: CSS.Transform.toString(transform), transition };
  const priority = priorityConfig[task.priority];
  const deadline = getDeadlineInfo(task.deadline);
  const visibleAssignees = task.assignees.slice(0, MAX_VISIBLE);
  const extraCount = task.assignees.length - MAX_VISIBLE;

  return (
    <>
      <div
        ref={setNodeRef} style={style}
        className={clsx(styles.card, isDragging && styles.dragging)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => !isDragging && setIsModalOpen(true)}
      >
        <div className={styles.dragHandle} {...attributes} {...listeners} />

        <div className={styles.cardHeader}>
          <span className={clsx(styles.priority, priority.className)}>{priority.label}</span>
          {isHovered && (
            <button className={styles.deleteBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); dispatch(deleteTask({ taskId: task.id, columnId: task.columnId }));
                dispatch(addToast('Task deleted', 'info')); }}
            ><Trash2 size={14} /></button>
          )}
        </div>

        <h4 className={styles.title}>{task.title}</h4>
        {task.description && <p className={styles.description}>{task.description}</p>}

        {deadline && (
          <div className={clsx(styles.deadline, deadline.cls)}>
            <Calendar size={10} /> {deadline.label}
          </div>
        )}

        {task.progress > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressValue}>{task.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.assignees}>
            {task.assignees.length === 0 ? (
              <span className={styles.noAssignees}>No assignees</span>
            ) : (
              <>
                {visibleAssignees.map((a) => (
                  <div key={a.id} className={styles.assigneeAvatar} style={{ background: a.avatarColor }} title={a.name}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {extraCount > 0 && <div className={styles.assigneeExtra}>+{extraCount}</div>}
              </>
            )}
          </div>
          <div className={styles.footerItem}>
            <MessageSquare size={13} /><span>{task.comments.length}</span>
          </div>
        </div>
      </div>

      {isModalOpen && <TaskModal taskId={task.id} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default Card;
