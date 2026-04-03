import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, MessageSquare, Send, UserPlus } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateTask, addComment, toggleAssignee } from '../../store/boardSlice';
import { addToast } from '../../store/toastSlice';
import { getStoredUsers } from '../../store/authSlice';
import type { Task } from '../../types';
import styles from './taskModal.module.css';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500),
  priority:    z.enum(['low', 'medium', 'high']),
  progress:    z.coerce.number().min(0).max(100),
  deadline:    z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface TaskModalProps { taskId: string; onClose: () => void; }

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function TaskModal({ taskId, onClose }: TaskModalProps) {
  const dispatch = useAppDispatch();
  const task   = useAppSelector((s) => s.board.tasks[taskId]) as Task;
  const user   = useAppSelector((s) => s.auth.user);
  const column = useAppSelector((s) => s.board.columns.find((c) => c.id === task.columnId));

  const [commentText,       setCommentText]       = useState('');
  const [showAssigneePanel, setShowAssigneePanel] = useState(false);
  const commentsEndRef   = useRef<HTMLDivElement>(null);
  const assigneePanelRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  // Список доступных для назначения пользователей:
  // - Админ видит всех
  // - Обычный пользователь видит только себя и всех админов
  const allUsers = getStoredUsers().map(({ id, name, avatarColor, role }) => ({ id, name, avatarColor, role }));
  const selectableUsers = isAdmin
    ? allUsers
    : allUsers.filter((u) => u.id === user?.id || u.role === 'admin');

  const commentsCount = task.comments.length;
  const assigneeCount = task.assignees.length;

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      progress:    task.progress,
      deadline:    task.deadline ?? '',
    },
  });

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsCount]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (assigneePanelRef.current && !assigneePanelRef.current.contains(e.target as Node))
        setShowAssigneePanel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onSubmit = (data: FormValues) => {
    dispatch(updateTask({ taskId, changes: { ...data, deadline: data.deadline || null } }));
    dispatch(addToast('Task saved', 'success'));
    onClose();
  };

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text || !user) return;
    dispatch(addComment({ taskId, comment: { authorName: user.name, authorColor: user.avatarColor, text } }));
    setCommentText('');
  };

  const isAssigned = (userId: string) => task.assignees.some((a) => a.id === userId);

  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.headerMeta}>
            {column && (
              <span className={styles.columnBadge} style={{ background: column.color + '22', color: column.color }}>
                {column.name}
              </span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.body}>
          {/* ── Left: form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

            <div className={styles.field}>
              <input className={styles.titleInput} placeholder="Task title" {...register('title')} />
              {errors.title && <span className={styles.error}>{errors.title.message}</span>}
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Priority</span>
                <select
                  className={styles.prioritySelect}
                  style={{ color: priorityColors[watch('priority')] }}
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={13} />
                <span className={styles.metaValue}>{formattedDate}</span>
              </div>
              <div className={styles.metaItem}>
                <MessageSquare size={13} />
                <span className={styles.metaValue}>{commentsCount}</span>
              </div>
            </div>

            {/* Assignees */}
            <div className={styles.field}>
              <label className={styles.label}>
                Assignees
                <span className={styles.countBadge}>{assigneeCount}</span>
              </label>
              <div className={styles.assigneesRow}>
                {assigneeCount === 0 ? (
                  <span className={styles.noAssigneesTxt}>No one assigned</span>
                ) : (
                  <div className={styles.assigneeAvatarStack}>
                    {task.assignees.map((a) => (
                      <div
                        key={a.id}
                        className={styles.assigneeChip}
                        style={{ background: a.avatarColor }}
                        title={a.name}
                      >
                        {a.name.charAt(0).toUpperCase()}
                        {/* Снять назначение: админ может снять любого, обычный — только себя */}
                        {(isAdmin || a.id === user?.id) && (
                          <button
                            type="button"
                            className={styles.removeAssignee}
                            onClick={() => dispatch(toggleAssignee({ taskId, assignee: a }))}
                            aria-label={`Remove ${a.name}`}
                          >
                            <X size={9} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.addAssigneeWrap} ref={assigneePanelRef}>
                  <button
                    type="button"
                    className={styles.addAssigneeBtn}
                    onClick={() => setShowAssigneePanel((v) => !v)}
                    title="Add assignee"
                  >
                    <UserPlus size={14} />
                  </button>

                  {showAssigneePanel && (
                    <div className={styles.assigneeDropdown}>
                      {selectableUsers.length === 0 ? (
                        <p className={styles.assigneeDropdownEmpty}>No users available</p>
                      ) : (
                        <>
                          {!isAdmin && (
                            <p className={styles.assigneeDropdownHint}>
                              You can assign yourself or admins
                            </p>
                          )}
                          {selectableUsers.map((u) => {
                            const assigned = isAssigned(u.id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                className={clsx(styles.assigneeOption, assigned && styles.assigneeOptionActive)}
                                onClick={() => dispatch(toggleAssignee({ taskId, assignee: u }))}
                              >
                                <div className={styles.assigneeOptionAvatar} style={{ background: u.avatarColor }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.assigneeOptionInfo}>
                                  <span className={styles.assigneeOptionName}>{u.name}</span>
                                  {u.role === 'admin' && (
                                    <span className={styles.adminBadge}>admin</span>
                                  )}
                                </div>
                                {assigned && <span className={styles.assigneeCheck}>✓</span>}
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className={styles.field}>
              <label className={styles.label}>Deadline</label>
              <input
                type="date"
                className={styles.input}
                {...register('deadline')}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.textarea} placeholder="Add a description..." rows={4} {...register('description')} />
              {errors.description && <span className={styles.error}>{errors.description.message}</span>}
            </div>

            <div className={styles.field}>
              <div className={styles.progressHeader}>
                <label className={styles.label}>Progress</label>
                <span className={styles.progressValue}>{watch('progress')}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} className={styles.slider} {...register('progress')} />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.saveBtn} disabled={!isDirty}>Save changes</button>
            </div>
          </form>

          {/* ── Right: comments ── */}
          <div className={styles.commentsPanel}>
            <div className={styles.commentsPanelHeader}>
              <MessageSquare size={15} />
              <span>Comments</span>
              <span className={styles.commentsCount}>{commentsCount}</span>
            </div>

            <div className={styles.commentsList}>
              {commentsCount === 0 ? (
                <div className={styles.emptyComments}>No comments yet</div>
              ) : (
                task.comments.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentAvatar} style={{ background: c.authorColor }}>
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>{c.authorName}</span>
                        <span className={styles.commentTime}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            <div className={styles.commentInput}>
              <div className={styles.commentInputAvatar} style={{ background: user?.avatarColor ?? '#6366f1' }}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <textarea
                className={styles.commentTextarea}
                placeholder="Write a comment… (Enter to send)"
                value={commentText}
                rows={1}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
                }}
              />
              <button type="button" className={styles.sendBtn} onClick={handleAddComment} disabled={!commentText.trim()}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
