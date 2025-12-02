import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  Course,
  ClassData,
  Room,
  RoomCalculationResponse,
  DashboardStats,
} from '../types';

const INITIAL_STATS: DashboardStats = {
  totalRooms: 0,
  totalStudents: 0,
  totalCourses: 0,
  occupancyRate: 0,
  roomsBySize: { small: 0, medium: 0, big: 0 },
  roomsByBlock: {},
  coursesByArea: {},
  totalClasses: 0,
};

function calculateStats(
  coursesData: Course[],
  classesData: ClassData[],
  roomsData: Room[],
): DashboardStats {
  // Filtrar apenas turmas reais (não projetadas) para as estatísticas
  const actualSemester = new Date().getMonth() < 6 ? 1 : 2;
  const actualYear = new Date().getFullYear();
  const realClasses = classesData.filter(
    (cls) =>
      !cls.isAssumed &&
      cls.year === actualYear &&
      cls.semester === actualSemester,
  );

  const totalStudents = realClasses.reduce(
    (sum, cls) => sum + (cls.currentStudents || 0),
    0,
  );

  const roomsBySize = { small: 0, medium: 0, big: 0 };
  const roomsByBlock: Record<string, number> = {};

  for (const room of roomsData) {
    if (room.size === 'P') roomsBySize.small++;
    else if (room.size === 'M') roomsBySize.medium++;
    else if (room.size === 'G') roomsBySize.big++;
    roomsByBlock[room.block] = (roomsByBlock[room.block] || 0) + 1;
  }

  const coursesByArea: Record<string, number> = {};
  for (const course of coursesData) {
    coursesByArea[course.knowledgeArea] =
      (coursesByArea[course.knowledgeArea] || 0) + 1;
  }

  const occupiedRooms = roomsData.filter((room) => room.classId != null).length;
  const occupancyRate =
    roomsData.length > 0
      ? Math.round((occupiedRooms / roomsData.length) * 100)
      : 0;

  return {
    totalRooms: roomsData.length,
    totalStudents,
    totalCourses: coursesData.length,
    occupancyRate,
    roomsBySize,
    roomsByBlock,
    coursesByArea,
    totalClasses: realClasses.length,
  };
}

export function useDashboardData(isAuthenticated: boolean) {
  const { get } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  // Usar ref para evitar loop infinito com a função get
  const getRef = useRef(get);
  getRef.current = get;

  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || dataLoaded) {
      return;
    }

    let cancelled = false;

    const loadStaticData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, classesRes, roomsRes] = await Promise.all([
          getRef.current<Course[]>('/api/courses'),
          getRef.current<ClassData[]>('/api/classes'),
          getRef.current<Room[]>('/api/rooms'),
        ]);

        if (!cancelled) {
          const coursesData = coursesRes.data || [];
          const classesData = classesRes.data || [];
          const roomsData = roomsRes.data || [];

          setCourses(coursesData);
          setStats(calculateStats(coursesData, classesData, roomsData));
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadStaticData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dataLoaded]);

  return { stats, courses, isLoading, dataLoaded };
}

export function useRoomCalculation(
  isAuthenticated: boolean,
  dataLoaded: boolean,
  selectedYear: number,
  selectedSemester: number,
) {
  const { get } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  // Usar ref para evitar loop infinito com a função get
  const getRef = useRef(get);
  getRef.current = get;

  const [roomCalculation, setRoomCalculation] =
    useState<RoomCalculationResponse | null>(null);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !dataLoaded) {
      return;
    }

    let cancelled = false;

    const loadRoomCalculation = async () => {
      setIsLoadingCalculation(true);
      try {
        const roomCalcRes = await getRef.current<RoomCalculationResponse>(
          `/api/room-calculation?year=${selectedYear}&semester=${selectedSemester}`,
        );
        if (!cancelled) {
          setRoomCalculation(roomCalcRes.data);
        }
      } catch (err) {
        console.error('Erro ao carregar cálculo de salas:', err);
        if (!cancelled) {
          setRoomCalculation(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCalculation(false);
        }
      }
    };

    void loadRoomCalculation();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dataLoaded, selectedYear, selectedSemester]);

  return { roomCalculation, isLoadingCalculation };
}

export function usePeriodSelector() {
  const currentYear = new Date().getFullYear();
  const currentSemester = new Date().getMonth() < 6 ? 1 : 2;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSemester, setSelectedSemester] = useState(currentSemester);

  const canGoPrevious =
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedSemester > currentSemester);

  const isProjection =
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedSemester > currentSemester);

  const handlePreviousPeriod = useCallback(() => {
    if (!canGoPrevious) return;

    if (selectedSemester === 1) {
      setSelectedYear((prev) => prev - 1);
      setSelectedSemester(2);
    } else {
      setSelectedSemester(1);
    }
  }, [canGoPrevious, selectedSemester]);

  const handleNextPeriod = useCallback(() => {
    if (selectedSemester === 2) {
      setSelectedYear((prev) => prev + 1);
      setSelectedSemester(1);
    } else {
      setSelectedSemester(2);
    }
  }, [selectedSemester]);

  const handleGoToCurrentPeriod = useCallback(() => {
    setSelectedYear(currentYear);
    setSelectedSemester(currentSemester);
  }, [currentYear, currentSemester]);

  return {
    selectedYear,
    selectedSemester,
    canGoPrevious,
    isProjection,
    handlePreviousPeriod,
    handleNextPeriod,
    handleGoToCurrentPeriod,
  };
}
