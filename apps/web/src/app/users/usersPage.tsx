'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import './users.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserStats {
  total: number;
  admins: number;
  defaultUsers: number;
}

export default function UsersPage() {
  const { get, isLoading, error } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    defaultUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos os Cargos');

  useEffect(() => {
    loadUsers();
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

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtro de cargo
    if (roleFilter !== 'Todos os Cargos') {
      filtered = filtered.filter(
        (user) => user.role.toUpperCase() === roleFilter.toUpperCase(),
      );
    }

    setFilteredUsers(filtered);
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

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleEdit = (userId: number) => {
    // TODO: Implementar edição
    console.log('Editar usuário:', userId);
  };

  const handleView = (userId: number) => {
    // TODO: Implementar visualização
    console.log('Ver usuário:', userId);
  };

  const handleNewUser = () => {
    // TODO: Implementar criação de novo usuário
    console.log('Novo usuário');
  };

  if (isLoading) {
    return (
      <div className="users-page">
        <div className="loading">🔄 Carregando usuários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="error-message">
          ❌ Erro ao carregar usuários: {error}
        </div>
      </div>
    );
  }

  return (
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
        <h2 className="table-title">Lista de Usuários do Sistema</h2>

        {users.length === 0 ? (
          <div className="no-results">Nenhum usuário encontrado</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>USUÁRIO</th>
                <th>CARGO</th>
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
                      <div className="user-info">
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
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user.id)}
                      >
                        EDITAR
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => handleView(user.id)}
                      >
                        VER
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
    </div>
  );
}
