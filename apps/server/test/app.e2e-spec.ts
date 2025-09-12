import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';

describe('App (e2e)', () => {
  let app: INestApplication;

  // This part boots up your entire NestJS application for testing.
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // This is the updated test case for your health check.
  it('/health (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/health') // 1. Call the /health endpoint
      .expect(200) // 2. Expect a 200 OK status
      .expect((res) => {
        // 3. Expect the response body to have the correct shape
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
      });
  });
});
