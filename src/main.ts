import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { format, transports } from 'winston';
import * as WinstonTransport from 'winston-transport';
import { WinstonModule } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/exceptions/http.exception';

async function bootstrap() {
  //setup winston logger
  const winstonTransport: WinstonTransport[] = [
    new transports.Console({
      format: format.printf((info) => {
        return info.message;
      }),
    }),
  ];

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ transports: winstonTransport }),
  });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();


  //Set Validationpipe for handle class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  //Start server
  await app.listen(configService.get('PORT') || 5100, '0.0.0.0');
}
bootstrap().then(() => Logger.log(`App Started: ` + process.env.PORT || 5100));
