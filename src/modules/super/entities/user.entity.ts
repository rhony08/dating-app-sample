import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Index,
  Column,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn()
  @Index()
  id: number;

  @Column({
    type: 'varchar',
    length: 191,
    default: null,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 191,
    default: null,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 191,
    default: null,
  })
  password: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  status: number;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  is_verify: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: null,
  })
  remember_token: string;

  @Column({
    type: 'datetime',
    default: null,
  })
  deleted_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: null })
  updated_at: Date;
}
