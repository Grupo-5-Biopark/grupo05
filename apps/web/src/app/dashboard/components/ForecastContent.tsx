import { RoomCalculationResponse, DashboardStats, COLORS } from '../types';

interface ForecastContentProps {
  readonly roomCalculation: RoomCalculationResponse;
  readonly stats: DashboardStats;
  readonly isProjection: boolean;
}

interface ExecutiveSummaryProps {
  readonly totalRequired: number;
  readonly totalExisting: number;
  readonly roomBalance: number;
}

function ExecutiveSummary({
  totalRequired,
  totalExisting,
  roomBalance,
}: Readonly<ExecutiveSummaryProps>) {
  const balanceClass = roomBalance >= 0 ? 'positive' : 'negative';
  const balancePrefix = roomBalance >= 0 ? '+' : '';
  const balanceLabel = roomBalance >= 0 ? 'Saldo' : 'Déficit';

  return (
    <div className="executive-summary">
      <div className="summary-metric">
        <div className="metric-value primary">{totalRequired}</div>
        <div className="metric-label">Salas Necessárias</div>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric">
        <div className="metric-value">{totalExisting}</div>
        <div className="metric-label">Salas Disponíveis</div>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric">
        <div className={`metric-value ${balanceClass}`}>
          {balancePrefix}
          {roomBalance}
        </div>
        <div className="metric-label">{balanceLabel}</div>
      </div>
    </div>
  );
}

interface BreakdownCardProps {
  readonly type: string;
  readonly color: string;
  readonly required: number;
  readonly available: number;
}

function BreakdownCard({
  type,
  color,
  required,
  available,
}: Readonly<BreakdownCardProps>) {
  const balance = available - required;
  const balanceClass = balance >= 0 ? 'positive' : 'negative';
  const balancePrefix = balance >= 0 ? '+' : '';

  return (
    <div className="breakdown-card">
      <div className="breakdown-header">
        <span className="breakdown-dot" style={{ background: color }} />
        <span className="breakdown-type">{type}</span>
      </div>
      <div className="breakdown-numbers">
        <div className="breakdown-row">
          <span className="breakdown-label">Necessárias</span>
          <span className="breakdown-value">{required}</span>
        </div>
        <div className="breakdown-row">
          <span className="breakdown-label">Disponíveis</span>
          <span className="breakdown-value">{available}</span>
        </div>
        <div className="breakdown-row result">
          <span className="breakdown-label">Saldo</span>
          <span className={`breakdown-value ${balanceClass}`}>
            {balancePrefix}
            {balance}
          </span>
        </div>
      </div>
    </div>
  );
}

interface RoomBreakdownProps {
  readonly roomCalculation: RoomCalculationResponse;
  readonly stats: DashboardStats;
}

function RoomBreakdown({
  roomCalculation,
  stats,
}: Readonly<RoomBreakdownProps>) {
  return (
    <div className="room-breakdown">
      <h4 className="breakdown-title">Detalhamento por Tamanho</h4>
      <div className="breakdown-grid">
        <BreakdownCard
          type="Pequenas"
          color={COLORS.small}
          required={roomCalculation.totalRoomsRequired.small}
          available={stats.roomsBySize.small}
        />
        <BreakdownCard
          type="Médias"
          color={COLORS.medium}
          required={roomCalculation.totalRoomsRequired.medium}
          available={stats.roomsBySize.medium}
        />
        <BreakdownCard
          type="Grandes"
          color={COLORS.big}
          required={roomCalculation.totalRoomsRequired.big}
          available={stats.roomsBySize.big}
        />
      </div>
    </div>
  );
}

interface ForecastAlertsProps {
  readonly exceededLimits: RoomCalculationResponse['exceededLimits'];
}

function ForecastAlerts({ exceededLimits }: Readonly<ForecastAlertsProps>) {
  if (exceededLimits.length === 0) {
    return null;
  }

  return (
    <div className="forecast-alerts">
      <div className="alert-header">
        <span className="alert-icon">⚠️</span>
        <span className="alert-title">Atenção: Capacidade Excedida</span>
      </div>
      <div className="alert-items">
        {exceededLimits.map((item) => (
          <div key={item.name} className="alert-item">
            <span className="alert-name">{item.name}</span>
            <span className="alert-detail">
              {item.studentCount} alunos
              <span className="alert-max">(máx: {item.maxLimit})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProjectionInfoProps {
  readonly isProjection: boolean;
  readonly simulatedCount: number;
}

function ProjectionInfo({
  isProjection,
  simulatedCount,
}: Readonly<ProjectionInfoProps>) {
  // Mostra a mensagem se houver turmas simuladas, independente de ser projeção futura
  if (simulatedCount === 0) {
    return null;
  }

  const message = isProjection
    ? `Esta projeção inclui <strong>${simulatedCount} turmas simuladas</strong> baseadas nas vagas dos cursos cadastrados.`
    : `Este período inclui <strong>${simulatedCount} turmas projetadas</strong> que foram criadas automaticamente para preencher anos sem turmas cadastradas.`;

  return (
    <div className="projection-info">
      <span className="info-icon">ℹ️</span>
      <span
        className="info-text"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </div>
  );
}

export function ForecastContent({
  roomCalculation,
  stats,
  isProjection,
}: Readonly<ForecastContentProps>) {
  const totalRequired =
    roomCalculation.totalRoomsRequired.small +
    roomCalculation.totalRoomsRequired.medium +
    roomCalculation.totalRoomsRequired.big;

  const totalExisting =
    stats.roomsBySize.small + stats.roomsBySize.medium + stats.roomsBySize.big;

  const roomBalance = totalExisting - totalRequired;

  return (
    <div className="forecast-content">
      <ExecutiveSummary
        totalRequired={totalRequired}
        totalExisting={totalExisting}
        roomBalance={roomBalance}
      />

      <RoomBreakdown roomCalculation={roomCalculation} stats={stats} />

      <ForecastAlerts exceededLimits={roomCalculation.exceededLimits} />

      <ProjectionInfo
        isProjection={isProjection}
        simulatedCount={roomCalculation.metadata.simulatedClassesCount}
      />
    </div>
  );
}

export function ForecastLoading() {
  return (
    <div className="forecast-loading">
      <div className="loading-spinner small">⏳</div>
      <span>Calculando previsão...</span>
    </div>
  );
}

export function ForecastEmpty() {
  return (
    <div className="forecast-empty">
      <p>Não foi possível calcular a previsão para este período.</p>
    </div>
  );
}
