import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { VariablesEntorno } from './config/entorno.validation';
import { ErrorConfiguracionFilter } from './infrastructure/rest/filters/error-configuracion.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ErrorConfiguracionFilter());

  const documento = new DocumentBuilder()
    .setTitle('Configuracion')
    .setDescription('Empresas emisoras, plantillas XML con versiones y conexiones al ERP')
    .setVersion('0.2.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-Token-Admin' }, 'token-admin')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, documento));

  const puerto = app.get<ConfigService<VariablesEntorno, true>>(ConfigService).get('PORT', { infer: true });
  await app.listen(puerto, '0.0.0.0');

  new Logger('Bootstrap').log(`config-service escuchando en :${puerto} (documentacion en /docs)`);
}

void bootstrap();
