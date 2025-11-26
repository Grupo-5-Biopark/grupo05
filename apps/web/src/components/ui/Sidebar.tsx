import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard',
      adminOnly: false,
    },
    {
      id: 'cursos',
      label: 'Cursos',
      icon: '🎓',
      route: '/courses',
      adminOnly: false,
    },
    {
      id: 'salas',
      label: 'Salas',
      icon: '🏢',
      route: '/rooms',
      adminOnly: false,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: '⚙️',
      route: '/settings',
      adminOnly: false,
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📈',
      route: '/reports',
      adminOnly: false,
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: '👥',
      route: '/users',
      adminOnly: true,
    },
    {
      id: 'turmas',
      label: 'Turmas',
      icon: '🏫',
      route: '/classes',
      adminOnly: false,
    },
  ];

  // Filtrar itens baseado no papel do usuário
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  const handleItemClick = (item: MenuItem) => {
    onPageChange(item.id);
    router.push(item.route);
  };

  return (
    <nav className={`${styles.sidebar} ${styles.open}`}>
      <ul className={styles.navMenu}>
        {filteredMenuItems.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <button
              className={`${styles.navLink} ${currentPage === item.id ? styles.active : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon} {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
