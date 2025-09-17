const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * Controller Template Generator with Swagger Documentation
 * Responsible for generating NestJS controller templates with simplified Swagger decorators
 */
class ControllerTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate controller template with simplified Swagger decorators
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated controller template with simplified Swagger
   */
  generate(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);
    const lowerCaseName = this.toLowerCase(featureName);

    return `import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
} from '@/infrastructure/decorators';
import { Create${capitalizedName}Dto, Update${capitalizedName}Dto } from './dtos/${lowerCaseName}.dto';

@ApiTags('${lowerCaseName}')
@ApiBearerAuth()
@Controller('${lowerCaseName}')
export class ${capitalizedName}Controller {
  // TODO: Inject your use cases here
  // private readonly create${capitalizedName}UseCase: Create${capitalizedName}UseCase,
  // private readonly find${capitalizedName}UseCase: Find${capitalizedName}UseCase,
  // private readonly update${capitalizedName}UseCase: Update${capitalizedName}UseCase,
  // private readonly delete${capitalizedName}UseCase: Delete${capitalizedName}UseCase,
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperation(
    {
      summary: 'Create a new ${lowerCaseName}',
      description: 'Creates a new ${lowerCaseName} with the provided data',
      entityName: '${capitalizedName}',
    },
    Create${capitalizedName}Dto,
  )
  async create(@Body() create${capitalizedName}Dto: Create${capitalizedName}Dto) {
    // TODO: Implement create logic
    // return this.create${capitalizedName}UseCase.execute(create${capitalizedName}Dto);
    throw new Error('Not implemented yet');
  }

  @Get()
  @ApiFindAllOperation({
    summary: 'Get all ${lowerCaseName}s',
    description:
      'Retrieves a paginated list of ${lowerCaseName}s with optional filtering',
    entityName: '${capitalizedName}',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    // TODO: Implement find all logic
    // return this.find${capitalizedName}UseCase.findAll({ page, limit, search });
    throw new Error('Not implemented yet');
  }

  @Get(':id')
  @ApiFindOneOperation({
    summary: 'Get ${lowerCaseName} by ID',
    description: 'Retrieves a specific ${lowerCaseName} by its unique identifier',
    entityName: '${capitalizedName}',
  })
  async findOne(@Param('id') id: string) {
    // TODO: Implement find one logic
    // return this.find${capitalizedName}UseCase.findById(id);
    throw new Error('Not implemented yet');
  }

  @Patch(':id')
  @ApiUpdateOperation(
    {
      summary: 'Update ${lowerCaseName}',
      description: 'Updates an existing ${lowerCaseName} with the provided data',
      entityName: '${capitalizedName}',
    },
    Update${capitalizedName}Dto,
  )
  async update(
    @Param('id') id: string,
    @Body() update${capitalizedName}Dto: Update${capitalizedName}Dto,
  ) {
    // TODO: Implement update logic
    // return this.update${capitalizedName}UseCase.execute(id, update${capitalizedName}Dto);
    throw new Error('Not implemented yet');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteOperation({
    summary: 'Delete ${lowerCaseName}',
    description: 'Deletes an existing ${lowerCaseName} by its unique identifier',
    entityName: '${capitalizedName}',
  })
  async remove(@Param('id') id: string) {
    // TODO: Implement delete logic
    // return this.delete${capitalizedName}UseCase.execute(id);
    throw new Error('Not implemented yet');
  }
}
`;
  }
}

module.exports = { ControllerTemplateGenerator };
