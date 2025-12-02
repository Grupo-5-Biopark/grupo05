'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import {
  useDashboardData,
  useRoomCalculation,
  usePeriodSelector,
} from './hooks';
import {
  StatsCards,
  PeriodSelector,
  ForecastContent,
  ForecastLoading,
  ForecastEmpty,
  DashboardCharts,
  CourseSummary,
  ExportModal,
} from './components';
import { COLORS, RoomCalculationResponse, DashboardStats } from './types';
import './dashboard.css';

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">🔄</div>
      <p>Carregando...</p>
    </div>
  );
}

function LoadingData() {
  return (
    <div className="loading-data">
      <div className="loading-spinner">🔄</div>
      <p>Carregando dados...</p>
    </div>
  );
}

interface RoomsBySize {
  readonly small: number;
  readonly medium: number;
  readonly big: number;
}

function prepareRoomSizeData(roomsBySize: RoomsBySize) {
  return [
    { name: 'Pequenas (P)', value: roomsBySize.small, color: COLORS.small },
    { name: 'Médias (M)', value: roomsBySize.medium, color: COLORS.medium },
    { name: 'Grandes (G)', value: roomsBySize.big, color: COLORS.big },
  ].filter((item) => item.value > 0);
}

function prepareCoursesByAreaData(coursesByArea: Record<string, number>) {
  return Object.entries(coursesByArea).map(([area, count]) => ({
    name: area.length > 15 ? `${area.substring(0, 15)}...` : area,
    fullName: area,
    cursos: count,
  }));
}

function prepareRoomsByBlockData(roomsByBlock: Record<string, number>) {
  return Object.entries(roomsByBlock).map(([block, count]) => ({
    name: block,
    salas: count,
  }));
}

interface ForecastSectionProps {
  readonly isLoadingCalculation: boolean;
  readonly roomCalculation: RoomCalculationResponse | null;
  readonly stats: DashboardStats;
  readonly isProjection: boolean;
}

function ForecastSection({
  isLoadingCalculation,
  roomCalculation,
  stats,
  isProjection,
}: Readonly<ForecastSectionProps>) {
  if (isLoadingCalculation) {
    return <ForecastLoading />;
  }

  if (roomCalculation) {
    return (
      <ForecastContent
        roomCalculation={roomCalculation}
        stats={stats}
        isProjection={isProjection}
      />
    );
  }

  return <ForecastEmpty />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();

  // Custom hooks para gerenciar estado
  const { stats, courses, isLoading, dataLoaded } =
    useDashboardData(isAuthenticated);

  const {
    selectedYear,
    selectedSemester,
    canGoPrevious,
    isProjection,
    handlePreviousPeriod,
    handleNextPeriod,
    handleGoToCurrentPeriod,
  } = usePeriodSelector();

  const [isExportOpen, setIsExportOpen] = useState(false);

  const { roomCalculation, isLoadingCalculation } = useRoomCalculation(
    isAuthenticated,
    dataLoaded,
    selectedYear,
    selectedSemester,
  );

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Preparar dados para gráficos
  const roomSizeData = prepareRoomSizeData(stats.roomsBySize);
  const coursesByAreaData = prepareCoursesByAreaData(stats.coursesByArea);
  const roomsByBlockData = prepareRoomsByBlockData(stats.roomsByBlock);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="dashboard" onPageChange={() => {}} />

      <main className="main-content">
        <div className="page active">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Visão geral do sistema de controle de salas
            </p>
          </div>

          {isLoading ? (
            <LoadingData />
          ) : (
            <>
              <StatsCards stats={stats} />

              <div className="forecast-section">
                <div className="forecast-header">
                  <div className="forecast-title-area">
                    <h2 className="forecast-title">Previsão de Salas</h2>
                    <p className="forecast-subtitle">
                      Análise de demanda por período acadêmico
                    </p>
                  </div>

                  <PeriodSelector
                    selectedYear={selectedYear}
                    selectedSemester={selectedSemester}
                    canGoPrevious={canGoPrevious}
                    isProjection={isProjection}
                    onPreviousPeriod={handlePreviousPeriod}
                    onNextPeriod={handleNextPeriod}
                    onGoToCurrentPeriod={handleGoToCurrentPeriod}
                  />
                  <button
                    className="export-btn"
                    onClick={() => setIsExportOpen(true)}
                    title="Exportar dados do dashboard"
                    aria-label="Exportar dados do dashboard"
                    style={{
                      marginLeft: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Exportar</span>
                  </button>
                </div>

                <ForecastSection
                  isLoadingCalculation={isLoadingCalculation}
                  roomCalculation={roomCalculation}
                  stats={stats}
                  isProjection={isProjection}
                />
                <ExportModal
                  isOpen={isExportOpen}
                  onClose={() => setIsExportOpen(false)}
                  defaultYear={selectedYear}
                  defaultSemester={selectedSemester}
                />
              </div>

              <DashboardCharts
                roomSizeData={roomSizeData}
                coursesByAreaData={coursesByAreaData}
                roomsByBlockData={roomsByBlockData}
              />

              <CourseSummary courses={courses} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
