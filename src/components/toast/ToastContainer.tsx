import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { removeToast } from '../../store/toastSlice';
import styles from './toast.module.css';

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle    size={16} />,
  info:    <Info       size={16} />,
};

const AUTO_DISMISS = 3500;

function ToastItem({ id, message, type }: { id: string; message: string; type: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(id)), AUTO_DISMISS);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{ICONS[type as keyof typeof ICONS]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={() => dispatch(removeToast(id))}>
        <X size={13} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useAppSelector((s) => s.toast);
  return (
    <div className={styles.container}>
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </div>
  );
}
