import { DashboardStats } from '../types';

interface StatsCardsProps {
  readonly stats: DashboardStats;
}

export function StatsCards({ stats }: Readonly<StatsCardsProps>) {
  // Obter período atual para exibir no label
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentSemester = currentMonth <= 6 ? 1 : 2;

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
          <div className="stat-label">
            Alunos ({currentYear}/{currentSemester}º sem)
          </div>
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
          <div className="stat-label">
            Turmas ({currentYear}/{currentSemester}º sem)
          </div>
        </div>
      </div>
    </div>
  );
}
