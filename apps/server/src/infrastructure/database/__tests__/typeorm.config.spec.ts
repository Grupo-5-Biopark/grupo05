// Mock env-var before importing getTypeOrmConfig
let mockEnvironment = 'test';

jest.mock('env-var', () => {
  const mockEnv: Record<string, string | number> = {
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'testuser',
    POSTGRES_PASSWORD: 'testpass',
    POSTGRES_DB: 'testdb',
  };

  return {
    get: (key: string) => ({
      required: () => ({
        asString: () => mockEnv[key],
        asPortNumber: () => Number.parseInt(mockEnv[key] as string, 10),
      }),
      asString: () => (key === 'ENVIRONMENT' ? mockEnvironment : mockEnv[key]),
    }),
  };
});

import { getTypeOrmConfig } from '../typeorm.config';

describe('TypeORM Configuration', () => {
  beforeEach(() => {
    mockEnvironment = 'test';
  });

  it('should return valid TypeORM configuration', () => {
    const config = getTypeOrmConfig();

    expect(config).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'testuser',
      password: 'testpass',
      database: 'testdb',
      autoLoadEntities: true,
      synchronize: true,
    });
  });

  it('should set synchronize to false in production environment', () => {
    mockEnvironment = 'production';

    const config = getTypeOrmConfig();

    expect(config.synchronize).toBe(false);
  });

  it('should set synchronize to true in non-production environment', () => {
    mockEnvironment = 'development';

    const config = getTypeOrmConfig();

    expect(config.synchronize).toBe(true);
  });
});
