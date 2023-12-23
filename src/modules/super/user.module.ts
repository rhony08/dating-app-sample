import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../common/loggers/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './services/user.service.interface';
import { UserService } from './services/user.service';
import { IUserRepository } from './repositories/user.repo.interface';
import { UserRepository } from './repositories/user.repo';
import { UserChoiceEntity } from './entities/user_choice.entity';
import { IUserChoiceRepository } from './repositories/user-choice.repo.interface';
import { UserChoiceRepository } from './repositories/user-choice.repo';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    TypeOrmModule.forFeature([UserEntity, UserChoiceEntity]),
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
      provide: IUserChoiceRepository,
      useClass: UserChoiceRepository,
    },
  ],
})
export class UserModule {}
