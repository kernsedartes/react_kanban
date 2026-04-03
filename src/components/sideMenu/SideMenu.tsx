import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { User, LogOut, ShieldCheck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import styles from './sideMenu.module.css';

function SideMenu() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const user      = useAppSelector((s) => s.auth.user);
  const isAdmin   = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const go = (path: string) => { setMenuOpen(false); navigate(path); };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>K</span>
      </div>

      <div className={styles.bottom} ref={menuRef}>
        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.menuUser}>
              <div className={styles.menuAvatar} style={{ background: user?.avatarColor ?? '#6366f1' }}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className={styles.menuUserInfo}>
                <div className={styles.menuUserNameRow}>
                  <span className={styles.menuUserName}>{user?.name ?? 'User'}</span>
                  {isAdmin && <span className={styles.adminBadge}>admin</span>}
                </div>
                <span className={styles.menuUserEmail}>{user?.email ?? ''}</span>
              </div>
            </div>

            <div className={styles.menuDivider} />

            <button className={styles.menuItem} onClick={() => go('/profile')}>
              <User size={15} /> Profile
            </button>

            {/* Только для админа */}
            {isAdmin && (
              <button className={styles.menuItem} onClick={() => go('/admin')}>
                <ShieldCheck size={15} /> Manage users
              </button>
            )}

            <div className={styles.menuDivider} />

            <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}

        <button
          className={styles.avatarBtn}
          onClick={() => setMenuOpen((v) => !v)}
          title={user?.name ?? 'Profile'}
          style={{ background: user?.avatarColor ?? '#6366f1' }}
          aria-label="Open profile menu"
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </button>
      </div>
    </div>
  );
}

export default SideMenu;
