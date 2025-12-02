import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RoomCalculationController } from './room-calculation.controller';
import { CalculateRoomRequirementsUseCase } from '../../application/use-cases/calculate-room-requirements.usecase';

describe('RoomCalculationController', () => {
  let controller: RoomCalculationController;
  let calculateRoomRequirementsUseCase: CalculateRoomRequirementsUseCase;

  const mockCalculateRoomRequirementsUseCase = {
    execute: jest.fn(),
  };

  const mockResult = {
    exceededLimits: [],
    totalRoomsRequired: {
      small: 5,
      medium: 10,
      big: 3,
    },
    details: {
      classes: [
        {
          classId: 1,
          courseName: 'Software Engineering',
          studentCount: 35,
          roomSize: 'M',
          isAssumed: false,
          startYear: 2024,
          semester: 1,
        },
      ],
    },
    metadata: {
      requestedYear: 2024,
      requestedSemester: 1,
      isProjection: false,
      simulatedClassesCount: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomCalculationController],
      providers: [
        {
          provide: CalculateRoomRequirementsUseCase,
          useValue: mockCalculateRoomRequirementsUseCase,
        },
      ],
    }).compile();

    controller = module.get<RoomCalculationController>(
      RoomCalculationController,
    );
    calculateRoomRequirementsUseCase =
      module.get<CalculateRoomRequirementsUseCase>(
        CalculateRoomRequirementsUseCase,
      );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return room calculation results for valid semester 1', async () => {
      mockCalculateRoomRequirementsUseCase.execute.mockResolvedValue(
        mockResult,
      );

      const result = await controller.findAll(2024, 1);

      expect(calculateRoomRequirementsUseCase.execute).toHaveBeenCalledWith(
        2024,
        1,
      );
      expect(result).toEqual(mockResult);
    });

    it('should return room calculation results for valid semester 2', async () => {
      mockCalculateRoomRequirementsUseCase.execute.mockResolvedValue(
        mockResult,
      );

      const result = await controller.findAll(2024, 2);

      expect(calculateRoomRequirementsUseCase.execute).toHaveBeenCalledWith(
        2024,
        2,
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException for invalid semester 0', async () => {
      await expect(controller.findAll(2024, 0)).rejects.toThrow(
        BadRequestException,
      );
      expect(calculateRoomRequirementsUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid semester 3', async () => {
      await expect(controller.findAll(2024, 3)).rejects.toThrow(
        BadRequestException,
      );
      expect(calculateRoomRequirementsUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException with proper message for invalid semester', async () => {
      try {
        await controller.findAll(2024, 5);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).message).toBe(
          'Query parameter `semester` must be 1 or 2',
        );
      }
    });

    it('should handle future year calculations (projections)', async () => {
      const futureResult = {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          requestedYear: 2030,
          isProjection: true,
          simulatedClassesCount: 5,
        },
      };

      mockCalculateRoomRequirementsUseCase.execute.mockResolvedValue(
        futureResult,
      );

      const result = await controller.findAll(2030, 1);

      expect(calculateRoomRequirementsUseCase.execute).toHaveBeenCalledWith(
        2030,
        1,
      );
      expect(result.metadata.isProjection).toBe(true);
    });

    it('should propagate errors from use case', async () => {
      mockCalculateRoomRequirementsUseCase.execute.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findAll(2024, 1)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
