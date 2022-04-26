import { EStatusPay } from 'src/core/enums/status-pay.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Fee } from '../fee/fee.entity';
import { Project } from '../project/project.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column({ nullable: false, default: 1 })
  feesNumber: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EStatusPay,
    default: EStatusPay.PENDING,
  })
  status: EStatusPay;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Fee, fee => fee.invoice)
  fees: Fee[];
}