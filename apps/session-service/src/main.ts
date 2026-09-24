import { NestFactory } from '@nestjs/core';
import { SessionServiceModule } from './session-service.module';

async function bootstrap() {
  const app = await NestFactory.create(SessionServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
