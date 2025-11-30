export class RoomCalculationResponseDto {
  totalRooms: {
    small: number;
    medium: number;
    big: number;
  };
  courses: Array<{
    courseName: string;
    roomSize: 'P' | 'M' | 'G';
  }>;
  classes: Array<{
    classId: number;
    courseName: string | null;
    roomSize: 'P' | 'M' | 'G';
  }>;
  // `totalRooms` already contains the combined counts for courses + classes.
}
