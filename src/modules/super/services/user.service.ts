import {
  runInTransaction,
  Runner,
} from '../../../common/thirdparties/typeorm/run.in.transaction';
import { UserEntity } from '../entities/user.entity';
import { IUserService } from './user.service.interface';
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../repositories/user.repo.interface';
import {
  ChooseUserRequestDto,
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
  User,
} from '../dtos/user.dto';
import { lockmode } from '../../../common/thirdparties/typeorm/runner.lock.mode';
import { compare, genSalt, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randEmail, randFullName, randQuote, rand } from '@ngneat/falso';
import { IUserChoiceRepository } from '../repositories/user-choice.repo.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly configSvc: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IUserChoiceRepository)
    private readonly userChosenRepository: IUserChoiceRepository,
  ) {
    this.createFakeUser();
  }

  async createFakeUser() {
    if (this.configSvc.get('IS_SEED') == 'true') {
      const totalRow = Number(this.configSvc.get('TOTAL_USER_SEED')) || 0;

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
          console.log(`Got an error: ` + err);
          return Promise.reject();
        }
      }
    }
  }

  async loginUser(req: LoginUserRequestDto): Promise<LoggedIn> {
    try {
      const data = await this.userRepository.findUserByMail(req.email);
      if (!data) {
        throw new NotFoundException('User Tidak ditemukan');
      }

      const valid = await compare(req.password, data.password);
      if (!valid) {
        throw new UnauthorizedException({
          message: 'Email/Password yang dimasukkan tidak benar',
        });
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
          String(this.configSvc.get(process.env.JWT_SECRET) || 'test_123A'),
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

  async getUserChoices(user: User): Promise<User[]> {
    try {
      let is_verify = user.is_verify;
      // if not verify, recheck from db, in case user verify it after logged-in
      if (!is_verify) {
        const checkUserStatus = await this.userRepository.findUserById(user.id);

        is_verify = checkUserStatus.is_verify == 1;
      }

      const maxUserToSwipePerDay =
        (await Number(this.configSvc.get('MAX_CHOSE_PER_DAY'))) || 10;
      const chosenUsers =
        await this.userChosenRepository.findAllUserChoiceToday(user.id);

      if (!is_verify && chosenUsers.length >= maxUserToSwipePerDay) {
        return [];
      } else {
        chosenUsers.push(user.id);
        return this.userRepository.findUserToChoose(chosenUsers);
      }
    } catch (err) {
      console.log(`Got an error: ` + err);
      return Promise.reject(err);
    }
  }

  async chooseAUser(user: User, body: ChooseUserRequestDto): Promise<string> {
    try {
      return await runInTransaction(this.dataSource, async (em) => {
        const runner: Runner = {
          manager: em,
          lock_mode: lockmode.pessimistic_write, //--> Lock on the affected row
        };

        if (user.id == body.chosen_user_id) {
          throw new BadRequestException({
            message: 'You cant swipe to yourself',
          });
        }
        const chosenUsers =
          await this.userChosenRepository.findAllUserChoiceToday(
            user.id,
            body.chosen_user_id,
          );

        if (chosenUsers.length) {
          throw new BadRequestException({
            message: 'You cant swipe same user twice at the same day!',
          });
        }

        await this.userChosenRepository.createUserChoice(
          user.id,
          body.chosen_user_id,
          body.status,
          runner,
        );

        return 'Successfully chose the user';
      });
    } catch (err) {
      console.log(`Got an error: ` + err);
      return Promise.reject(err);
    }
  }

  async upgradeUser(user: User): Promise<string> {
    try {
      return await runInTransaction(this.dataSource, async (em) => {
        const runner: Runner = {
          manager: em,
          lock_mode: lockmode.pessimistic_write, //--> Lock on the affected row
        };

        const result = await this.userRepository.updateUser(
          user.id,
          {
            is_verify: 1,
          },
          runner,
        );

        if (!result.affected) {
          throw new BadRequestException({
            message: 'Invalid user account!',
          });
        }

        return 'Successfully verified your account!';
      });
    } catch (err) {
      console.log(`Got an error: ` + err);
      return Promise.reject(err);
    }
  }
}
