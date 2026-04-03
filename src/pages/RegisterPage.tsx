import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, getStoredUsers, saveStoredUser } from '../store/authSlice';
import styles from './authPage.module.css';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    const users = getStoredUsers();
    if (users.find((u) => u.email === data.email)) {
      setServerError('Email already in use');
      return;
    }

    // Первый зарегистрированный пользователь — admin, остальные — user
    const role = users.length === 0 ? 'admin' : 'user';

    const newUser = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: data.password,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!,
      role,
    } as const;

    saveStoredUser(newUser);
    const { password: _, ...user } = newUser;
    dispatch(loginSuccess(user));
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>K</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start managing your tasks</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} placeholder="Your name" {...register('name')} />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          {serverError && <p className={styles.error}>{serverError}</p>}
          <button type="submit" className={styles.submitBtn}>Create account</button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
