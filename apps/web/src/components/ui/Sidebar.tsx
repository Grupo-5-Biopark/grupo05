import styles from './Sidebar.module.css';

interface SidebarProps {
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      id: 'cursos',
      label: 'Cursos',
      icon: '🎓',
    },
    {
      id: 'salas',
      label: 'Salas',
      icon: '🏢',
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: '⚙️',
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📈',
    },
  ];

  return (
    <nav className={`${styles.sidebar} ${styles.open}`}>
      <ul className={styles.navMenu}>
        {menuItems.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <button
              className={`${styles.navLink} ${currentPage === item.id ? styles.active : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              {item.icon} {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
