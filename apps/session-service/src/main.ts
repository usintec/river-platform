import { NestFactory } from '@nestjs/core';
import { AppModule } from './session-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(Number(process.env.PORT ?? 3002));
  await app.listen(Number(3002));
}
bootstrap();
