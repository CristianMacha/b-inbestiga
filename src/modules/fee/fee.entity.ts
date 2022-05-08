import { EStatusPay } from 'src/core/enums/status-pay.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from '../invoice/invoice.entity';

@Entity()
export class Fee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  total: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EStatusPay,
    default: EStatusPay.PENDING,
  })
  status: EStatusPay;

  @Column()
  fileName: string;

  @Column()
  url: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Invoice, (invoice) => invoice.fees, { nullable: false })
  invoice: Invoice;
}
