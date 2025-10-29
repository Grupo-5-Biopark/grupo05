import styles from './Header.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'ADMIN', color: 'admin' };
      case 'user':
        return { text: 'USUÁRIO', color: 'user' };
      default:
        return { text: 'USUÁRIO', color: 'user' };
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <img src="/favicon.png" alt="BIOPARK" className={styles.logoImage} />
          <span className={styles.logoText}>BIOPARK</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || 'Usuário'}</span>
          <div
            className={`${styles.userBadge} ${
              styles[
                `userBadge${
                  getRoleBadge(user?.role || 'default')
                    .color.charAt(0)
                    .toUpperCase() +
                  getRoleBadge(user?.role || 'default').color.slice(1)
                }`
              ]
            }`}
          >
            {getRoleBadge(user?.role || 'default').text}
          </div>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={onLogout}
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
