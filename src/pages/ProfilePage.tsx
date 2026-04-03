import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, logout, changePassword, getStoredUsers } from '../store/authSlice';
import { ArrowLeft, LogOut, Check, Eye, EyeOff } from 'lucide-react';
import styles from './ProfilePage.module.css';

const AVATAR_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user)!;

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = (data: ProfileValues) => {
    dispatch(updateProfile({ name: data.name }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    profileForm.reset({ name: data.name });
  };

  const onPasswordSubmit = (data: PasswordValues) => {
    setPasswordError('');
    const users = getStoredUsers();
    const stored = users.find((u) => u.id === user.id);
    if (!stored || stored.password !== data.currentPassword) {
      setPasswordError('Current password is incorrect');
      return;
    }
    const ok = changePassword(user.id, data.newPassword);
    if (ok) {
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
      passwordForm.reset();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Back to board
          </button>
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Profile</h1>

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar} style={{ background: user.avatarColor }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p className={styles.email}>{user.email}</p>
            <span
              className={styles.roleBadge}
              data-admin={String(user.role === 'admin')}
            >
              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>

          {/* Color picker */}
          <div className={styles.colorSection}>
            <p className={styles.colorLabel}>Avatar color</p>
            <div className={styles.colorGrid}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  className={styles.colorSwatch}
                  style={{
                    background: color,
                    outline: user.avatarColor === color ? `3px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                  onClick={() => dispatch(updateProfile({ avatarColor: color }))}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Display name form */}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className={styles.form}>
            <div className={styles.sectionTitle}>Display name</div>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <span className={styles.error}>{profileForm.formState.errors.name.message}</span>
              )}
            </div>
            <button
              type="submit"
              className={profileSaved ? styles.saveBtnSuccess : styles.saveBtn}
              disabled={!profileForm.formState.isDirty}
            >
              {profileSaved ? <><Check size={15} /> Saved</> : 'Save changes'}
            </button>
          </form>

          {/* Password form */}
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className={styles.form}>
            <div className={styles.sectionTitle}>Change password</div>

            <div className={styles.field}>
              <label className={styles.label}>Current password</label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type={showCurrent ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrent(v => !v)}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <span className={styles.error}>{passwordForm.formState.errors.currentPassword.message}</span>
              )}
              {passwordError && <span className={styles.error}>{passwordError}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>New password</label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type={showNew ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <span className={styles.error}>{passwordForm.formState.errors.newPassword.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm new password</label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type={showConfirm ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <span className={styles.error}>{passwordForm.formState.errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={passwordSaved ? styles.saveBtnSuccess : styles.saveBtn}
            >
              {passwordSaved ? <><Check size={15} /> Password updated</> : 'Update password'}
            </button>
          </form>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
