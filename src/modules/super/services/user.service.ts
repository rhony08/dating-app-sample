import {
  runInTransaction,
  Runner,
} from '../../../common/thirdparties/typeorm/run.in.transaction';
import { UserEntity } from '../entities/user.entity';
import { IUserService } from './user.service.interface';
import { DataSource } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../repositories/user.repo.interface';
import { NotFoundError, UnauthorizedError } from '../../../common/errors';
import {
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
  User,
} from '../dtos/user.dto';
import { lockmode } from '../../../common/thirdparties/typeorm/runner.lock.mode';
import { compare, genSalt, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randEmail, randFullName, randQuote, rand } from '@ngneat/falso';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly configSvc: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    this.createFakeUser();
  }

  async createFakeUser() {
    if (this.configSvc.get('IS_SEED') == 'true') {
      const totalRow = Number(this.configSvc.get('TOTAL_USER_SEED')) || 0;
      console.log('totalRow', totalRow);

      if (totalRow) {
        try {
          for (let i = 0; i < totalRow; i++) {
            const user = new UserEntity();
            user.status = 1;
            user.email = randEmail();
            user.name = randFullName();
            user.password = await this.generatePassword(randQuote());
            user.is_verify = rand([0, 0, 1]);

            await this.userRepository.createUser(user);
          }
        } catch (err) {
          console.log(err);
          return Promise.reject();
        }
      }
    }
  }

  async loginUser(req: LoginUserRequestDto): Promise<LoggedIn> {
    try {
      const data = await this.userRepository.findUserByMail(req.email);
      if (!data) {
        throw new NotFoundError('User Tidak ditemukan');
      }

      const valid = await compare(req.password, data.password);
      if (!valid) {
        throw new UnauthorizedError(
          'Email/Password yang dimasukkan tidak benar',
        );
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        is_verify: data.is_verify == 1,
      };

      const result: LoggedIn = {
        user,
        token: jwt.sign(
          {
            id: data.id,
            name: data.name,
          },
          'test_123A',
        ),
      };

      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async generatePassword(password: string): Promise<string> {
    const saltRound = Number(this.configSvc.get('SALT_ROUND')) || 10;
    const salt = await genSalt(saltRound);

    return hash(password, salt);
  }

  async createUser(req: CreateUserRequestDto): Promise<number> {
    try {
      return await runInTransaction(this.dataSource, async (em) => {
        const runner: Runner = {
          manager: em,
          lock_mode: lockmode.pessimistic_write, //--> Lock on the affected row
        };

        const user = new UserEntity();
        user.name = req.name;
        user.email = req.email;
        user.password = await this.generatePassword(req.password);
        user.status = 1;

        const insertedId = await this.userRepository.createUser(user, runner);

        return insertedId;
      });
    } catch (err) {
      console.log(`Got an error: ` + err);
      return Promise.reject(err);
    }
  }
}
