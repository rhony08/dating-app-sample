import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Runner } from '../../../common/thirdparties/typeorm/run.in.transaction';
import { User } from '../dtos/user.dto';
import { UserEntity } from '../entities/user.entity';
import { UpdateResult } from 'typeorm';

export interface IUserRepository {
  /**
   * Creates a new user entity.
   *
   * @param entity The user entity to create.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to the ID of the newly created user.
   */
  createUser(entity: UserEntity, runner?: Runner): Promise<number>;

  /**
   * Updates an existing user entity.
   *
   * @param user_id Logged-in user.
   * @param updateFields All fields that need to update.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves when the entity has been updated.
   */
  updateUser(
    user_id: number,
    updateFields: QueryDeepPartialEntity<UserEntity>,
    runner?: Runner,
  ): Promise<UpdateResult>;

  /**
   * Finds a user entity by its ID.
   *
   * @param id The ID of the user to find.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to the user entity, or null if not found.
   */
  findUserById(id: number, runner?: Runner): Promise<UserEntity>;

  /**
   * Finds a user entity by its mail.
   *
   * @param email The email of the user to find.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to the user entity, or null if not found.
   */
  findUserByMail(email: string, runner?: Runner): Promise<UserEntity>;

  /**
   * Finds users to swipe.
   *
   * @param exclude_ids : ids of users that already got chose/passed.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to array of users.
   */
  findUserToChoose(exclude_ids: number[], runner?: Runner): Promise<User[]>;
}

export const IUserRepository = Symbol('IUserRepository');
