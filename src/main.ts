import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Top Trump')
    .setDescription('API developed to build a card game')
    .setVersion('1.0.0')
    .addTag('status')
    .addTag('create-user')
    .addTag('auth')
    .addTag('user-admin')
    .addTag('user-my-account')
    .addTag('collection')
    .addTag('card')
    .addTag('pack')
    .addTag('deck')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
