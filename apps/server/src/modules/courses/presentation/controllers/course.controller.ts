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
import { CreateCourseUseCase } from '../../application/use-cases/create-course.usecase';
import { FindAllCoursesUseCase } from '../../application/use-cases/find-all-courses.usecase';
import { FindCourseByIdUseCase } from '../../application/use-cases/find-course-by-id.usecase';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.usecase';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.usecase';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { CourseResponseDto } from '../dtos/course-response.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiTags('Courses')
@ApiBearerAuth()
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly findAllCoursesUseCase: FindAllCoursesUseCase,
    private readonly findCourseByIdUseCase: FindCourseByIdUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.createCourseUseCase.execute(createCourseDto);
    return {
      id: course.id,
      name: course.name,
      knowledgeArea: course.knowledgeArea,
      announcement: course.announcement,
      status: course.status,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  async findAll(): Promise<CourseResponseDto[]> {
    const courses = await this.findAllCoursesUseCase.execute();
    return courses.map((course) => ({
      id: course.id,
      name: course.name,
      knowledgeArea: course.knowledgeArea,
      announcement: course.announcement,
      status: course.status,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    const course = await this.findCourseByIdUseCase.execute(id);
    return {
      id: course.id,
      name: course.name,
      knowledgeArea: course.knowledgeArea,
      announcement: course.announcement,
      status: course.status,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<void> {
    await this.updateCourseUseCase.execute(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteCourseUseCase.execute(id);
  }
}
