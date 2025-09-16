import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { get } from 'env-var';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: get('POSTGRES_HOST').required().asString(),
  port: get('POSTGRES_PORT').required().asPortNumber(),
  username: get('POSTGRES_USER').required().asString(),
  password: get('POSTGRES_PASSWORD').required().asString(),
  database: get('POSTGRES_DB').required().asString(),
  autoLoadEntities: true,
  synchronize: get('ENVIRONMENT').asString() !== 'production',
});
