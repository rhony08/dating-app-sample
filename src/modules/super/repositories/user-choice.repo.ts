import { Runner } from '../../../common/thirdparties/typeorm/run.in.transaction';
import { IUserChoiceRepository } from './user-choice.repo.interface';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserChoiceEntity } from '../entities/user_choice.entity';
import * as moment from 'moment';

@Injectable()
export class UserChoiceRepository implements IUserChoiceRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAllUserChoiceToday(
    user_id: number,
    chosen_user_id?: number,
    runner?: Runner,
  ): Promise<number[]> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const today = moment().format('YYYY-MM-DD');

      const data = entityManager
        .createQueryBuilder()
        .select('uc.chose_user_id')
        .from(UserChoiceEntity, 'uc')
        .andWhere('uc.user_id = :user_id', { user_id })
        .andWhere('uc.submitted_date = :date', { date: today });

      if (chosen_user_id) {
        data.andWhere('uc.chose_user_id = :chosen_user_id', { chosen_user_id });
      }

      if (runner && runner.lock_mode) {
        data.setLock(runner.lock_mode);
      }

      const items = await data.getMany();
      return items.map((val) => val.chose_user_id);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async createUserChoice(
    user_id: number,
    chosen_user_id: number,
    status: number,
    runner?: Runner,
  ): Promise<UserChoiceEntity> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const userChoice = new UserChoiceEntity();
      userChoice.user_id = user_id;
      userChoice.chose_user_id = chosen_user_id;
      userChoice.status = status;
      userChoice.submitted_date = new Date();

      return await entityManager.save(userChoice);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
