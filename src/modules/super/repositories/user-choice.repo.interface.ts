import { Runner } from '../../../common/thirdparties/typeorm/run.in.transaction';
import { UserChoiceEntity } from '../entities/user_choice.entity';

export interface IUserChoiceRepository {
  /**
   * Find all user choices today
   *
   * @param user_id : logged-in user.
   * @param chosen_user_id : id of chosen user.
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to the ID of the newly created user.
   */
  findAllUserChoiceToday(
    user_id: number,
    chosen_user_id?: number,
    runner?: Runner,
  ): Promise<number[]>;

  /**
   * Create a chosen user from specific user
   *
   * @param user_id : id of logged-in user.
   * @param chosen_user_id : id of chosen user.
   * @param status : action, enum: [1 - like, 0 - pass].
   * @param runner An optional database transaction runner.
   * @returns A promise that resolves to the ID of the newly created user.
   */
  createUserChoice(
    user_id: number,
    chosen_user_id: number,
    status: number,
    runner?: Runner,
  ): Promise<UserChoiceEntity>;
}

export const IUserChoiceRepository = Symbol('IUserChoiceRepository');
