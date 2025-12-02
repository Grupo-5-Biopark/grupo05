'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './users.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
}

interface UserStats {
  total: number;
  admins: number;
  defaultUsers: number;
}

export default function UsersPage() {
  const router = useRouter();
  const {
    get,
    post,
    put,
    delete: del,
  } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    defaultUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos os Cargos');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
  });

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  async function loadUsers() {
    try {
      const response = await get<User[]>('/api/users');
      setUsers(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      showToast('error', 'Erro ao carregar usuários');
    }
  }

  const calculateStats = (usersList: User[]) => {
    const normalizedUsers = usersList.map((u) => ({
      ...u,
      role: u.role.toUpperCase(),
    }));

    const stats = {
      total: normalizedUsers.length,
      admins: normalizedUsers.filter((u) => u.role === 'ADMIN').length,
      defaultUsers: normalizedUsers.filter(
        (u) => u.role === 'USER' || u.role === 'USUARIO',
      ).length,
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (roleFilter !== 'Todos os Cargos') {
      filtered = filtered.filter(
        (user) => user.role.toUpperCase() === roleFilter.toUpperCase(),
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const translateErrorMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('email') && lowerMessage.includes('valid')) {
      return 'Formato de email inválido';
    }
    if (lowerMessage.includes('email') && lowerMessage.includes('exist')) {
      return 'Email já cadastrado';
    }
    // Erro de senha curta - verifica se contém "password" e "at least"
    if (
      lowerMessage.includes('password') &&
      lowerMessage.includes('at least')
    ) {
      return 'Senha muito curta (mínimo 6 caracteres)';
    }
    // Erro de senha curta alternativo
    if (
      lowerMessage.includes('password') &&
      (lowerMessage.includes('short') || lowerMessage.includes('length'))
    ) {
      return 'Senha muito curta';
    }

    return message;
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      showToast('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!editingUserId && !formData.password) {
      showToast('error', 'Por favor, informe uma senha.');
      return;
    }

    try {
      const userData: {
        name: string;
        email: string;
        role: string;
        phone: string;
        password?: string;
      } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (editingUserId !== null) {
        await put(`/api/users/${editingUserId}`, userData);
        showToast('success', 'Usuário atualizado com sucesso!');
      } else {
        await post('/api/users', userData);
        showToast('success', 'Usuário criado com sucesso!');
      }

      setShowNewUserModal(false);
      setEditingUserId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        phone: '',
      });
      await loadUsers();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      let serverMessage = 'Erro ao salvar usuário. Tente novamente.';
      if (err instanceof Error)
        serverMessage = translateErrorMessage(err.message);
      else if (err && typeof err === 'object') {
        const anyErr = err as {
          response?: { data?: { message?: string; error?: string } | string };
        };
        if (
          typeof anyErr.response?.data === 'object' &&
          anyErr.response?.data?.message
        )
          serverMessage = translateErrorMessage(anyErr.response.data.message);
        else if (
          typeof anyErr.response?.data === 'object' &&
          anyErr.response?.data?.error
        )
          serverMessage = translateErrorMessage(anyErr.response.data.error);
        else if (typeof anyErr.response?.data === 'string')
          serverMessage = translateErrorMessage(anyErr.response.data);
      }
      showToast('error', serverMessage);
    }
  };

  const handleEdit = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone,
    });
    setShowNewUserModal(true);
  };

  const handleDelete = (userId: number) => {
    const user = users.find((u) => u.id === userId) || null;
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const performDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await del(`/api/users/${userToDelete.id}`);
    } catch (err) {
      console.error('Erro na requisição de deleção:', err);
    }

    setShowConfirmModal(false);
    setUserToDelete(null);

    try {
      await loadUsers();
      showToast('success', 'Usuário deletado com sucesso!');
    } catch (err) {
      console.error('Erro ao recarregar usuários:', err);
      showToast('error', 'Erro ao atualizar a lista. Recarregue a página.');
    }
  };

  const handleNewUser = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      phone: '',
    });
    setShowNewUserModal(true);
  };

  const getRoleBadgeClass = (role: string) => {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case 'ADMIN':
        return 'badge-admin';
      case 'USER':
      case 'USUARIO':
        return 'badge-usuario';
      default:
        return 'badge-usuario';
    }
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case 'ADMIN':
        return 'ADMIN';
      case 'USER':
      case 'USUARIO':
        return 'USUÁRIO';
      default:
        return role.toUpperCase();
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return '-';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="user-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="usuarios" onPageChange={() => {}} />
      <main className="main-content">
        <div className="users-page">
          <div className="users-header">
            <h1>Gerenciamento de Usuários</h1>
            <p className="subtitle">
              Administração de contas de usuário e permissões
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total de Usuários</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.admins}</div>
              <div className="stat-label">Administradores</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.defaultUsers}</div>
              <div className="stat-label">Usuários Padrão</div>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label>Buscar usuário:</label>
              <input
                type="text"
                placeholder="Nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Filtrar por cargo:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option>Todos os Cargos</option>
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
            <button className="btn-new-user" onClick={handleNewUser}>
              + NOVO USUÁRIO
            </button>
          </div>

          <div className="users-table-container">
            <h2 className="table-title">Lista de Usuários</h2>

            {users.length === 0 ? (
              <div className="no-results">Nenhum usuário encontrado</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>USUÁRIO</th>
                    <th>CARGO</th>
                    <th>TELEFONE</th>
                    <th>DATA CRIAÇÃO</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {getInitials(user.name)}
                          </div>
                          <div className="users-info">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`role-badge ${getRoleBadgeClass(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="phone-cell">{formatPhone(user.phone)}</td>
                      <td className="date-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(user.id)}
                          >
                            EDITAR
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(user.id)}
                          >
                            EXCLUIR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredUsers.length === 0 && users.length > 0 && (
              <div className="no-results">
                Nenhum usuário encontrado com os filtros aplicados
              </div>
            )}
          </div>

          {/* Modal Novo/Editar Usuário */}
          {showNewUserModal && (
            <div className="modal active">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">
                    {editingUserId ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
                  </h3>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setShowNewUserModal(false);
                      setEditingUserId(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ex: João da Silva"
                      value={formData.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ex: joao@exemplo.com"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Senha {editingUserId ? '(deixe vazio para manter)' : '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder={
                        editingUserId ? 'Nova senha (opcional)' : 'Senha'
                      }
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Ex: (45) 99999-9999"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => void handleSaveUser()}
                  >
                    💾 {editingUserId ? 'Atualizar Usuário' : 'Salvar Usuário'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowNewUserModal(false);
                      setEditingUserId(null);
                    }}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast container */}
          {toast && (
            <div className={`toast ${toast.type}`} role="status">
              <div className="toast-icon">
                {toast.type === 'success' ? '✓' : '!'}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
          )}

          {/* Confirm Deletion Modal */}
          {showConfirmModal && userToDelete && (
            <div className="modal active">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Confirmar exclusão</h3>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setUserToDelete(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '0.5rem 0 1.25rem' }}>
                  <p>
                    Tem certeza que deseja excluir o usuário{' '}
                    <strong>{userToDelete.name}</strong>?
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setUserToDelete(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => void performDeleteUser()}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
