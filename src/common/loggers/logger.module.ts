import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuperLogger } from './logger.service';

@Module({
  providers: [
    {
      provide: 'NODE_ENV',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return cfg.get<string>('NODE_ENV');
      },
    },
    {
      provide: 'SERVICE_NAME',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return cfg.get<string>('SERVICE_NAME');
      },
    },
    Logger,
    SuperLogger,
  ],
  exports: [SuperLogger],
})
export class LoggerModule {}
