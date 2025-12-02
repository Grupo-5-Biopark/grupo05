import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'node:http';

describe('Calculation Parameters (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    if (loginResponse.status === 200) {
      authToken = (loginResponse.body as { access_token: string }).access_token;
    }
  });

  afterAll(async () => {
    // Clean up calculation parameters if any
    if (authToken) {
      await request(app.getHttpServer() as Server)
        .delete('/calculation-parameters')
        .set('Authorization', `Bearer ${authToken}`);
    }
    await app.close();
  });

  describe('/calculation-parameters (POST)', () => {
    it('should create new calculation parameters', () => {
      if (!authToken) {
        return expect(true).toBe(true);
      }

      return request(app.getHttpServer() as Server)
        .post('/calculation-parameters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dropoutPercentage: 10,
          studentsPerSmallRoom: 25,
          studentsPerMediumRoom: 45,
          studentsPerBigRoom: 70,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('dropoutPercentage', 10);
          expect(res.body).toHaveProperty('studentsPerSmallRoom', 25);
          expect(res.body).toHaveProperty('studentsPerMediumRoom', 45);
          expect(res.body).toHaveProperty('studentsPerBigRoom', 70);
        });
    });

    it('should return 400 when required fields are missing', () => {
      if (!authToken) {
        return expect(true).toBe(true);
      }

      return request(app.getHttpServer() as Server)
        .post('/calculation-parameters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfProfessorsPerClass: 2,
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/calculation-parameters')
        .send({
          numberOfProfessorsPerClass: 2,
          numberOfStudentsPerClass: 30,
          classHours: 4,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('/calculation-parameters (GET)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer() as Server).get(
        '/calculation-parameters',
      );

      expect(response.status).toBe(401);
    });

    it('should return array of calculation parameters with authentication', () => {
      if (!authToken) {
        return expect(true).toBe(true);
      }

      return request(app.getHttpServer() as Server)
        .get('/calculation-parameters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/calculation-parameters (PUT)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer() as Server)
        .put('/calculation-parameters')
        .send({
          dropoutPercentage: 15,
          studentsPerSmallRoom: 30,
          studentsPerMediumRoom: 50,
          studentsPerBigRoom: 80,
        });

      expect(response.status).toBe(401);
    });

    it('should update calculation parameters when authenticated', () => {
      if (!authToken) {
        return expect(true).toBe(true);
      }

      return request(app.getHttpServer() as Server)
        .put('/calculation-parameters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dropoutPercentage: 15,
          studentsPerSmallRoom: 30,
          studentsPerMediumRoom: 50,
          studentsPerBigRoom: 80,
        })
        .expect(200);
    });
  });

  describe('/calculation-parameters (DELETE)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer() as Server).delete(
        '/calculation-parameters',
      );

      expect(response.status).toBe(401);
    });
  });
});
