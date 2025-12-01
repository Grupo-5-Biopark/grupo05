interface PeriodSelectorProps {
  readonly selectedYear: number;
  readonly selectedSemester: number;
  readonly canGoPrevious: boolean;
  readonly isProjection: boolean;
  readonly onPreviousPeriod: () => void;
  readonly onNextPeriod: () => void;
  readonly onGoToCurrentPeriod: () => void;
}

export function PeriodSelector({
  selectedYear,
  selectedSemester,
  canGoPrevious,
  isProjection,
  onPreviousPeriod,
  onNextPeriod,
  onGoToCurrentPeriod,
}: Readonly<PeriodSelectorProps>) {
  const disabledClass = canGoPrevious ? '' : 'disabled';
  const tooltipText = canGoPrevious
    ? 'Período anterior'
    : 'Não é possível visualizar períodos anteriores ao atual';

  return (
    <div className="period-selector">
      {isProjection && (
        <button
          className="period-today-btn"
          onClick={onGoToCurrentPeriod}
          title="Voltar ao período atual"
        >
          Hoje
        </button>
      )}

      <button
        className={`period-nav-btn ${disabledClass}`}
        onClick={onPreviousPeriod}
        disabled={!canGoPrevious}
        title={tooltipText}
      >
        ‹
      </button>

      <div className="period-display">
        <span className="period-year">{selectedYear}</span>
        <span className="period-separator">•</span>
        <span className="period-semester">{selectedSemester}º Semestre</span>
        {isProjection ? (
          <span className="period-badge projection">Projeção</span>
        ) : (
          <span className="period-badge current">Atual</span>
        )}
      </div>

      <button
        className="period-nav-btn"
        onClick={onNextPeriod}
        title="Próximo período"
      >
        ›
      </button>
    </div>
  );
}
