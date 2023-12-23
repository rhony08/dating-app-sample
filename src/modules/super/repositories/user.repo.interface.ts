import { Runner } from '../../../common/thirdparties/typeorm/run.in.transaction';
import { UserEntity } from '../entities/user.entity';

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
   * @param entity The user entity to update.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves when the entity has been updated.
   */
  updateUser(entity: UserEntity, runner?: Runner): Promise<UserEntity>;

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
}

export const IUserRepository = Symbol('IUserRepository');
