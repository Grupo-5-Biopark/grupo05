export interface Course {
  id: number;
  name: string;
  knowledgeArea: string;
  vacancies: number;
  periodQuantities: number;
  openingYear: number;
}

export interface ClassData {
  id: number;
  courseId: number;
  shiftId: number;
  year: number;
  semester: number;
  currentStudents: number;
  isAssumed?: boolean;
}

export interface Room {
  id: number;
  block: string;
  number: number;
  size: string;
  classId?: number;
}

export interface RoomCalculationResponse {
  totalRoomsRequired: {
    small: number;
    medium: number;
    big: number;
  };
  details: {
    classes: Array<{
      classId: number;
      courseName: string | null;
      studentCount: number;
      roomSize: 'P' | 'M' | 'G' | 'EXCEDIDO' | null;
      isAssumed: boolean;
      startYear: number;
      semester: number;
    }>;
  };
  exceededLimits: Array<{
    type: string;
    name: string;
    studentCount: number;
    maxLimit: number;
    isProjected?: boolean;
  }>;
  metadata: {
    requestedYear: number;
    requestedSemester: number;
    isProjection: boolean;
    simulatedClassesCount: number;
  };
}

export interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  totalCourses: number;
  occupancyRate: number;
  roomsBySize: {
    small: number;
    medium: number;
    big: number;
  };
  roomsByBlock: Record<string, number>;
  coursesByArea: Record<string, number>;
  totalClasses: number;
}

export const COLORS = {
  primary: '#eb0644',
  secondary: '#233444',
  accent: '#667eea',
  small: '#4CAF50',
  medium: '#FF9800',
  big: '#F44336',
  chart: ['#eb0644', '#233444', '#667eea', '#4CAF50', '#FF9800', '#9C27B0'],
};
