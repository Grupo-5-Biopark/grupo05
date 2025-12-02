import {
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
} from '../swagger.decorators';

// Mock the @nestjs/common and @nestjs/swagger modules
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: any[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiOperation: jest.fn((config: any) => ({
    type: 'ApiOperation',
    config,
  })),
  ApiParam: jest.fn((config: any) => ({ type: 'ApiParam', config })),
  ApiQuery: jest.fn((config: any) => ({ type: 'ApiQuery', config })),
  ApiBody: jest.fn((config: any) => ({ type: 'ApiBody', config })),
  ApiCreatedResponse: jest.fn((config: any) => ({
    type: 'ApiCreatedResponse',
    config,
  })),
  ApiOkResponse: jest.fn((config: any) => ({ type: 'ApiOkResponse', config })),
  ApiNotFoundResponse: jest.fn((config: any) => ({
    type: 'ApiNotFoundResponse',
    config,
  })),
  ApiBadRequestResponse: jest.fn((config: any) => ({
    type: 'ApiBadRequestResponse',
    config,
  })),
  ApiInternalServerErrorResponse: jest.fn((config: any) => ({
    type: 'ApiInternalServerErrorResponse',
    config,
  })),
}));
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

describe('Swagger Decorators', () => {
  describe('ApiCreateOperation', () => {
    it('should return an array of decorators for create operation', () => {
      const operation = {
        summary: 'Create a user',
        description: 'Create a new user in the system',
        entityName: 'User',
      };
      class CreateUserDto {
        name?: string;
      }

      const result = ApiCreateOperation(operation, CreateUserDto);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'ApiOperation');
      expect(result[0]).toHaveProperty('config.summary', 'Create a user');
    });
  });

  describe('ApiFindAllOperation', () => {
    it('should return an array of decorators for find all operation', () => {
      const operation = {
        summary: 'Get all users',
        description: 'Retrieve all users from the system',
        entityName: 'User',
      };

      const result = ApiFindAllOperation(operation);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'ApiOperation');
      expect(result[0]).toHaveProperty('config.summary', 'Get all users');
    });
  });

  describe('ApiFindOneOperation', () => {
    it('should return an array of decorators for find one operation', () => {
      const operation = {
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by ID',
        entityName: 'User',
      };

      const result = ApiFindOneOperation(operation);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'ApiOperation');
      expect(result[0]).toHaveProperty('config.summary', 'Get user by ID');
    });
  });

  describe('ApiUpdateOperation', () => {
    it('should return an array of decorators for update operation', () => {
      const operation = {
        summary: 'Update a user',
        description: 'Update an existing user',
        entityName: 'User',
      };
      class UpdateUserDto {
        name?: string;
      }

      const result = ApiUpdateOperation(operation, UpdateUserDto);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'ApiOperation');
      expect(result[0]).toHaveProperty('config.summary', 'Update a user');
    });
  });

  describe('ApiDeleteOperation', () => {
    it('should return an array of decorators for delete operation', () => {
      const operation = {
        summary: 'Delete a user',
        description: 'Delete a user from the system',
        entityName: 'User',
      };

      const result = ApiDeleteOperation(operation);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'ApiOperation');
      expect(result[0]).toHaveProperty('config.summary', 'Delete a user');
    });
  });
});
