import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addTask } from '../../store/boardSlice';
import { addToast } from '../../store/toastSlice';
import type { AddTaskFormValues } from '../../types';
import styles from './addCardModal.module.css';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters'),
  priority:    z.enum(['low', 'medium', 'high']),
});

interface AddCardModalProps { columnId: string; onClose: () => void; }

function AddCardModal({ columnId, onClose }: AddCardModalProps) {
  const dispatch = useAppDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm<AddTaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', description: '' },
  });

  const onSubmit = (data: AddTaskFormValues) => {
    dispatch(addTask({ columnId, taskData: { ...data, progress: 0, deadline: null } }));
    dispatch(addToast(`Task "${data.title}" created`, 'success'));
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Task</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">Title *</label>
            <input id="title" className={styles.input} placeholder="What needs to be done?" {...register('title')} />
            {errors.title && <span className={styles.error}>{errors.title.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea id="description" className={styles.textarea} placeholder="Add more details..." rows={3} {...register('description')} />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="priority">Priority</label>
            <select id="priority" className={styles.select} {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCardModal;
