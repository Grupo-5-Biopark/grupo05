import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Biopark Room Control API')
    .setDescription(
      'API documentation for the room control and forecasting system.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const error = errors[0];
        const message: string = error.constraints
          ? `The field '${error.property}' ${Object.values(error.constraints)[0]}`
          : `The field '${error.property}' is invalid`;
        return new BadRequestException({ message });
      },
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.SERVER_PORT ?? 3000);
  console.log(
    `Server is running on http://localhost:${process.env.SERVER_PORT ?? 3000}`,
  );
}
void bootstrap();
