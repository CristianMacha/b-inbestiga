import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { EPetitionStatus } from './enum/petition-status.enum';

@Entity()
export class Petition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surnames: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: EPetitionStatus,
    default: EPetitionStatus.PENDING,
  })
  status: EPetitionStatus;

  @Column()
  fileName: string;

  @Column()
  url: string;

  @Column()
  message: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: false, default: false })
  accepted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, category => category.petitions)
  category: Category;
}
