import { Outlet } from 'react-router-dom';
import { Search, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import SideMenu from '../sideMenu/SideMenu';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleTheme, setSearch, setPriorityFilter } from '../../store/uiSlice';
import type { Priority } from '../../types';
import styles from './boardLayout.module.css';

const PRIORITIES: { value: Priority | 'all'; label: string }[] = [
  { value: 'all',    label: 'All'    },
  { value: 'high',   label: 'High'   },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low'    },
];

function BoardLayout() {
  const dispatch = useAppDispatch();
  const user   = useAppSelector((s) => s.auth.user);
  const theme  = useAppSelector((s) => s.ui.theme);
  const filter = useAppSelector((s) => s.ui.filter);

  return (
    <div className={styles.layout}>
      <aside className={styles.sideMenu}><SideMenu /></aside>
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Kanban Board</h1>

          <div className={styles.headerRight}>
            {/* Search */}
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search tasks…"
                value={filter.search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
            </div>

            {/* Priority filter */}
            <div className={styles.filterWrap}>
              <SlidersHorizontal size={15} className={styles.filterIcon} />
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  className={styles.filterBtn}
                  data-active={filter.priority === p.value}
                  onClick={() => dispatch(setPriorityFilter(p.value as Priority | 'all'))}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button className={styles.themeBtn} onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {user && <span className={styles.greeting}>Hello, {user.name}</span>}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BoardLayout;
