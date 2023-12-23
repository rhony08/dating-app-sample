import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../common/loggers/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './services/user.service.interface';
import { UserService } from './services/user.service';
import { IUserRepository } from './repositories/user.repo.interface';
import { UserRepository } from './repositories/user.repo';
import { ApmStore } from '../../common/store/apm.store';
import { ApmInterceptor } from '../../common/interceptors/apm.interceptor';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApmInterceptor,
    },
    ApmStore,
  ],
})
export class UserModule {}
