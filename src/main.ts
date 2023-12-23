import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { format, transports } from 'winston';
import * as WinstonTransport from 'winston-transport';
import { WinstonModule } from 'nest-winston';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SuperLogger } from './common/loggers/logger.service';
import { Logger, VersioningType } from '@nestjs/common';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';

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
  // app.useGlobalInterceptors(
  //   new TransactionInterceptor({
  //     default: app.get(Sequelize),
  //   }),
  //   new LoggerInterceptor(),
  // );
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //   }),
  // );
  // app.setGlobalPrefix(configService.get('api.prefix') || 'api');

  //Set Handle gRPC Exception (Middleware)
  // const logger = grpcServer.get(SuperLogger);
  // grpcServer.useGlobalFilters(new GrpcExceptionFilter(logger));

  //Set Validationpipe for handle class-validator
  app.useGlobalPipes(new ValidationPipe());

  //Start server
  await app.listen(configService.get('PORT') || 5100, '0.0.0.0');
}
bootstrap().then(() => Logger.log(`App Started: ` + process.env.PORT || 5100));
