import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, UserPlus, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { getStoredUsers, saveStoredUser } from '../store/authSlice';
import type { StoredUser, UserRole } from '../types';
import styles from './AdminPage.module.css';

const schema = z.object({
  name:     z.string().min(2, 'At least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  role:     z.enum(['admin', 'user']),
});
type FormValues = z.infer<typeof schema>;

const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

function AdminPage() {
  const navigate  = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user)!;

  // Читаем пользователей из localStorage, перерисовываем при изменениях через локальный стейт
  const [users, setUsers] = useState<StoredUser[]>(() => getStoredUsers());
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  });

  const refresh = () => setUsers(getStoredUsers());

  const onSubmit = (data: FormValues) => {
    const existing = getStoredUsers();
    if (existing.find((u) => u.email === data.email)) {
      setServerError('Email already in use');
      return;
    }
    const newUser: StoredUser = {
      id:          uuidv4(),
      name:        data.name,
      email:       data.email,
      password:    data.password,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!,
      role:        data.role as UserRole,
    };
    saveStoredUser(newUser);
    refresh();
    reset({ role: 'user' });
    setShowForm(false);
    setServerError('');
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser.id) return; // нельзя удалить себя
    const updated = getStoredUsers().filter((u) => u.id !== userId);
    localStorage.setItem('kanban_users', JSON.stringify(updated));
    refresh();
  };

  const handleToggleRole = (userId: string, currentRole: UserRole) => {
    if (userId === currentUser.id) return; // нельзя снять роль у себя
    const updated = getStoredUsers().map((u) =>
      u.id === userId ? { ...u, role: currentRole === 'admin' ? 'user' : 'admin' } : u
    ) as StoredUser[];
    localStorage.setItem('kanban_users', JSON.stringify(updated));
    refresh();
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back to board
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>User Management</h1>
            <button className={styles.createBtn} onClick={() => { setShowForm((v) => !v); setServerError(''); }}>
              <UserPlus size={16} />
              {showForm ? 'Cancel' : 'Create user'}
            </button>
          </div>

          {/* Create user form */}
          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.createForm}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input className={styles.input} placeholder="Full name" {...register('name')} />
                  {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" placeholder="user@example.com" {...register('email')} />
                  {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input className={styles.input} type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Role</label>
                  <select className={styles.select} {...register('role')}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {serverError && <p className={styles.error}>{serverError}</p>}
              <button type="submit" className={styles.submitBtn}>Create user</button>
            </form>
          )}

          {/* Users table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={{ background: u.avatarColor }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={styles.userName}>
                            {u.name}
                            {isSelf && <span className={styles.youBadge}>you</span>}
                          </span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.emailCell}>{u.email}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.rolePill} data-role={u.role}>
                          {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={isSelf}
                            title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                          >
                            {u.role === 'admin'
                              ? <ShieldOff size={15} />
                              : <ShieldCheck size={15} />
                            }
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDelete(u.id)}
                            disabled={isSelf}
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
