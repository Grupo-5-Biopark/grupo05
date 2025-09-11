import { ReactNode } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  children?: ReactNode;
  onMenuToggle?: () => void;
}

export default function Header({
  title = 'BIOPARK',
  children,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onMenuToggle && (
          <button onClick={onMenuToggle} className={styles.menuToggle}>
            ☰
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>{children}</div>
    </header>
  );
}
