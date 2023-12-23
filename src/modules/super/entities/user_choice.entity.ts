import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Index,
  Column,
} from 'typeorm';
import { UserAction } from '../dtos/user.dto';

@Entity('user_choices')
export class UserChoiceEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn()
  @Index()
  id: number;

  @Column({
    type: 'int',
    width: 10,
    unsigned: true,
    default: null,
  })
  user_id: number;

  @Column({
    type: 'int',
    width: 10,
    unsigned: true,
    default: null,
  })
  chose_user_id: number;

  @Column({
    type: 'enum',
    enum: UserAction,
    default: UserAction.PASS,
  })
  status: number;

  @Column({ type: 'date', default: null })
  submitted_date: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: null })
  updated_at: Date;
}
