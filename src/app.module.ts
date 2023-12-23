import { Module } from '@nestjs/common';
import { UserModule } from './modules/super/user.module';
import { LoggerModule } from './common/loggers/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfgService: ConfigService) => {
        return {
          type: 'mysql',
          database: 'db/sql',
          entities: [__dirname + '**/**/**/*.entity.{ts,js}'],
          synchronize: true,
          replication: {
            master: {
              host: cfgService.get<string>('DBHOST'),
              port: cfgService.get<number>('DBPORT'),
              username: cfgService.get<string>('DBUSER'),
              password: cfgService.get<string>('DBPASSWORD'),
              database: cfgService.get<string>('DBNAME'),
              poolSize: +cfgService.get<string>('DBMAX'),
            },
            slaves: [
              {
                host: cfgService.get<string>('DBHOST_SLAVES'),
                port: cfgService.get<number>('DBPORT_SLAVES'),
                username: cfgService.get<string>('DBUSER_SLAVES'),
                password: cfgService.get<string>('DBPASSWORD_SLAVES'),
                database: cfgService.get<string>('DBNAME_SLAVES'),
                poolSize: +cfgService.get<string>('DBMAX_SLAVES'),
              },
            ],
          },
        };
      },
    }),
    UserModule,
  ],
})
export class AppModule {}
