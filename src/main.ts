import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GGLK Ai PoC')
    .setDescription('GGLK Ai PoC API')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    explorer: true,
    swaggerOptions: {
      displayRequestDuration: true,
      operationsSorter: 'method',
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
