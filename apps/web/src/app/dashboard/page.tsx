'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const showPage = (pageId: string) => {
    setCurrentPage(pageId);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#233444',
        }}
      >
        <div>🔄 Carregando...</div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={toggleSidebar} className="sidebar-toggle">
            ☰
          </button>
          <div className="logo">BIOPARK</div>
        </div>
        <div className="user-info">
          <span>{user?.name || 'Usuário'}</span>
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-small"
          >
            Sair
          </button>
        </div>
      </header>

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="nav-menu">
          <li className="nav-item">
            <button
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => showPage('dashboard')}
            >
              📊 Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentPage === 'cursos' ? 'active' : ''}`}
              onClick={() => showPage('cursos')}
            >
              🎓 Cursos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentPage === 'salas' ? 'active' : ''}`}
              onClick={() => showPage('salas')}
            >
              🏢 Salas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentPage === 'configuracoes' ? 'active' : ''}`}
              onClick={() => showPage('configuracoes')}
            >
              ⚙️ Configurações
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentPage === 'relatorios' ? 'active' : ''}`}
              onClick={() => showPage('relatorios')}
            >
              📈 Relatórios
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {/* DASHBOARD PAGE */}
        <div className={`page ${currentPage === 'dashboard' ? 'active' : ''}`}>
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Visão geral do sistema de controle de salas
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">27</div>
              <div className="stat-label">Salas Ativas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1,245</div>
              <div className="stat-label">Total de Alunos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">15</div>
              <div className="stat-label">Cursos Ativos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">85%</div>
              <div className="stat-label">Taxa de Ocupação</div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3 className="chart-title">Distribuição de Salas por Tamanho</h3>
              <div className="chart-placeholder">
                <p>Gráfico será implementado com Chart.js</p>
              </div>
            </div>
          </div>
        </div>

        {/* CURSOS PAGE */}
        <div className={`page ${currentPage === 'cursos' ? 'active' : ''}`}>
          <div className="page-header">
            <h1 className="page-title">Gerenciamento de Cursos</h1>
            <p className="page-subtitle">Controle de cursos e suas turmas</p>
          </div>

          <div className="content-placeholder">
            <h3>🚧 Em Desenvolvimento</h3>
            <p>
              Esta seção será desenvolvida para gerenciar cursos, turmas e
              cálculos de evasão.
            </p>
          </div>
        </div>

        {/* SALAS PAGE */}
        <div className={`page ${currentPage === 'salas' ? 'active' : ''}`}>
          <div className="page-header">
            <h1 className="page-title">Controle de Salas</h1>
            <p className="page-subtitle">
              Gerenciamento de salas por tamanho e ocupação
            </p>
          </div>

          <div className="content-placeholder">
            <h3>🚧 Em Desenvolvimento</h3>
            <p>
              Esta seção será desenvolvida para controlar a quantidade e tamanho
              das salas baseado na quantidade de alunos.
            </p>
          </div>
        </div>

        {/* CONFIGURAÇÕES PAGE */}
        <div
          className={`page ${currentPage === 'configuracoes' ? 'active' : ''}`}
        >
          <div className="page-header">
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Valores configuráveis do sistema</p>
          </div>

          <div className="content-placeholder">
            <h3>🚧 Em Desenvolvimento</h3>
            <p>
              Esta seção permitirá configurar valores de cálculo como taxa de
              evasão, capacidade das salas, etc.
            </p>
          </div>
        </div>

        {/* RELATÓRIOS PAGE */}
        <div className={`page ${currentPage === 'relatorios' ? 'active' : ''}`}>
          <div className="page-header">
            <h1 className="page-title">Relatórios</h1>
            <p className="page-subtitle">Relatórios e previsões semestrais</p>
          </div>

          <div className="content-placeholder">
            <h3>🚧 Em Desenvolvimento</h3>
            <p>
              Esta seção gerará relatórios de quantidade de salas por tamanho e
              previsões semestrais.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
