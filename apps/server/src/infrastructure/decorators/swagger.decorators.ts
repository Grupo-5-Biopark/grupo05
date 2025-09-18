import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

/**
 * Swagger decorators for standardized API documentation
 * Following DDD principles - these are infrastructure concerns
 */

interface CrudOperation {
  summary: string;
  description: string;
  entityName: string;
}

interface ResponseSchema {
  type: 'object';
  properties: Record<string, any>;
}

/**
 * Standard error response schemas
 */
const ERROR_SCHEMAS = {
  badRequest: {
    type: 'object' as const,
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { type: 'array', items: { type: 'string' } },
      error: { type: 'string', example: 'Bad Request' },
    },
  },
  notFound: {
    type: 'object' as const,
    properties: {
      statusCode: { type: 'number', example: 404 },
      message: { type: 'string', example: 'Resource not found' },
      error: { type: 'string', example: 'Not Found' },
    },
  },
  internalServerError: {
    type: 'object' as const,
    properties: {
      statusCode: { type: 'number', example: 500 },
      message: { type: 'string', example: 'Internal server error' },
      error: { type: 'string', example: 'Internal Server Error' },
    },
  },
};

/**
 * Generates a standard entity response schema
 */
function createEntitySchema(entityName: string): ResponseSchema {
  return {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid-here' },
      name: { type: 'string', example: `Example ${entityName}` },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

/**
 * Generates a paginated response schema
 */
function createPaginatedSchema(entityName: string): ResponseSchema {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: createEntitySchema(entityName),
      },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 10 },
          total: { type: 'number', example: 100 },
          totalPages: { type: 'number', example: 10 },
        },
      },
    },
  };
}

/**
 * Create operation decorator
 */
export function ApiCreateOperation(operation: CrudOperation, dtoClass: any) {
  return applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiBody({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: dtoClass,
      description: `The ${operation.entityName.toLowerCase()} data to create`,
    }),
    ApiCreatedResponse({
      description: `The ${operation.entityName.toLowerCase()} has been successfully created`,
      schema: createEntitySchema(operation.entityName),
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      schema: ERROR_SCHEMAS.badRequest,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: ERROR_SCHEMAS.internalServerError,
    }),
  );
}

/**
 * Find all operation decorator
 */
export function ApiFindAllOperation(operation: CrudOperation) {
  return applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: `Search term for filtering ${operation.entityName.toLowerCase()}s`,
    }),
    ApiOkResponse({
      description: `List of ${operation.entityName.toLowerCase()}s retrieved successfully`,
      schema: createPaginatedSchema(operation.entityName),
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: ERROR_SCHEMAS.internalServerError,
    }),
  );
}

/**
 * Find one operation decorator
 */
export function ApiFindOneOperation(operation: CrudOperation) {
  return applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: `The unique identifier of the ${operation.entityName.toLowerCase()}`,
      example: 'uuid-here',
    }),
    ApiOkResponse({
      description: `The ${operation.entityName.toLowerCase()} was found and returned successfully`,
      schema: createEntitySchema(operation.entityName),
    }),
    ApiNotFoundResponse({
      description: `${operation.entityName} not found`,
      schema: ERROR_SCHEMAS.notFound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: ERROR_SCHEMAS.internalServerError,
    }),
  );
}

/**
 * Update operation decorator
 */
export function ApiUpdateOperation(operation: CrudOperation, dtoClass: any) {
  return applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: `The unique identifier of the ${operation.entityName.toLowerCase()} to update`,
      example: 'uuid-here',
    }),
    ApiBody({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: dtoClass,
      description: `The ${operation.entityName.toLowerCase()} data to update`,
    }),
    ApiOkResponse({
      description: `The ${operation.entityName.toLowerCase()} has been successfully updated`,
      schema: createEntitySchema(operation.entityName),
    }),
    ApiNotFoundResponse({
      description: `${operation.entityName} not found`,
      schema: ERROR_SCHEMAS.notFound,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      schema: ERROR_SCHEMAS.badRequest,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: ERROR_SCHEMAS.internalServerError,
    }),
  );
}

/**
 * Delete operation decorator
 */
export function ApiDeleteOperation(operation: CrudOperation) {
  return applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: `The unique identifier of the ${operation.entityName.toLowerCase()} to delete`,
      example: 'uuid-here',
    }),
    ApiOkResponse({
      description: `The ${operation.entityName.toLowerCase()} has been successfully deleted`,
    }),
    ApiNotFoundResponse({
      description: `${operation.entityName} not found`,
      schema: ERROR_SCHEMAS.notFound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: ERROR_SCHEMAS.internalServerError,
    }),
  );
}
