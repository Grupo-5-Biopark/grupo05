import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // Get only the first error
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
