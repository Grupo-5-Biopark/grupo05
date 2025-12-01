import { DashboardStats } from '../types';

interface StatsCardsProps {
  readonly stats: DashboardStats;
}

export function StatsCards({ stats }: Readonly<StatsCardsProps>) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">🏢</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalRooms}</div>
          <div className="stat-label">Salas Cadastradas</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👨‍🎓</div>
        <div className="stat-content">
          <div className="stat-value">
            {stats.totalStudents.toLocaleString('pt-BR')}
          </div>
          <div className="stat-label">Total de Alunos</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🎓</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Cursos Ativos</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalClasses}</div>
          <div className="stat-label">Turmas Ativas</div>
        </div>
      </div>
    </div>
  );
}
