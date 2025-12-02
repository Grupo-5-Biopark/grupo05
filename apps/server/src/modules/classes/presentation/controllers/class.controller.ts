import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateClassUseCase } from '../../application/use-cases/create-class.usecase';
import { FindAllClassesUseCase } from '../../application/use-cases/find-all-classes.usecase';
import { FindClassByIdUseCase } from '../../application/use-cases/find-class-by-id.usecase';
import { UpdateClassUseCase } from '../../application/use-cases/update-class.usecase';
import { DeleteClassUseCase } from '../../application/use-cases/delete-class.usecase';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { ClassResponseDto } from '../dtos/class-response.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard)
@ApiTags('Classes')
@ApiBearerAuth()
export class ClassController {
  constructor(
    private readonly createClassUseCase: CreateClassUseCase,
    private readonly findAllClassesUseCase: FindAllClassesUseCase,
    private readonly findClassByIdUseCase: FindClassByIdUseCase,
    private readonly updateClassUseCase: UpdateClassUseCase,
    private readonly deleteClassUseCase: DeleteClassUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  async create(
    @Body() createClassDto: CreateClassDto,
  ): Promise<ClassResponseDto> {
    const classEntity = await this.createClassUseCase.execute(createClassDto);
    return {
      id: classEntity.id,
      courseId: classEntity.courseId,
      shiftId: classEntity.shiftId,
      year: classEntity.year,
      semester: classEntity.semester,
      currentStudents: classEntity.currentStudents,
      isAssumed: classEntity.isAssumed,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  async findAll(): Promise<ClassResponseDto[]> {
    const classes = await this.findAllClassesUseCase.execute();
    return classes.map((classEntity) => ({
      id: classEntity.id,
      courseId: classEntity.courseId,
      shiftId: classEntity.shiftId,
      year: classEntity.year,
      semester: classEntity.semester,
      currentStudents: classEntity.currentStudents,
      isAssumed: classEntity.isAssumed,
      course: classEntity.course
        ? { name: classEntity.course.name }
        : undefined,
      shift: classEntity.shift ? { name: classEntity.shift.name } : undefined,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ClassResponseDto> {
    const classEntity = await this.findClassByIdUseCase.execute(id);
    return {
      id: classEntity.id,
      courseId: classEntity.courseId,
      shiftId: classEntity.shiftId,
      year: classEntity.year,
      semester: classEntity.semester,
      currentStudents: classEntity.currentStudents,
      isAssumed: classEntity.isAssumed,
      course: classEntity.course
        ? { name: classEntity.course.name }
        : undefined,
      shift: classEntity.shift ? { name: classEntity.shift.name } : undefined,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update class' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<void> {
    await this.updateClassUseCase.execute(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteClassUseCase.execute(id);
  }
}
