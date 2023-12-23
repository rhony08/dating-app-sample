import { Runner } from '../../../common/thirdparties/typeorm/run.in.transaction';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from './user.repo.interface';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createUser(entity: UserEntity, runner?: Runner): Promise<number> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const createdUser = await entityManager.save(entity);

      return createdUser.id;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateUser(entity: UserEntity, runner?: Runner): Promise<UserEntity> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const updatedUser = await entityManager.save(entity);
      return updatedUser;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async findUserById(id: number, runner?: Runner): Promise<UserEntity> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const data = entityManager
        .createQueryBuilder()
        .select('users')
        .from(UserEntity, 'users')
        .where('users.deleted_at IS NULL')
        .andWhere('users.id = :id', { id });

      if (runner && runner.lock_mode) {
        data.setLock(runner.lock_mode);
      }

      return await data.getOne();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async findUserByMail(email: string, runner?: Runner): Promise<UserEntity> {
    try {
      let entityManager = this.dataSource.manager;
      if (runner) {
        entityManager = runner.manager;
      }

      const data = entityManager
        .createQueryBuilder()
        .select('users')
        .from(UserEntity, 'users')
        .where('users.deleted_at IS NULL')
        .andWhere('users.email = :email', { email });

      if (runner && runner.lock_mode) {
        data.setLock(runner.lock_mode);
      }

      return await data.getOne();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
