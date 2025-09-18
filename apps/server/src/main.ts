import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(process.env.SERVER_PORT ?? 3000);
  console.log(
    `Server is running on http://localhost:${process.env.SERVER_PORT ?? 3000}`,
  );
}
void bootstrap();
