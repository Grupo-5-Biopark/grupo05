'use client';

import { useEffect } from 'react';
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
                </div>

                <ForecastSection
                  isLoadingCalculation={isLoadingCalculation}
                  roomCalculation={roomCalculation}
                  stats={stats}
                  isProjection={isProjection}
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
