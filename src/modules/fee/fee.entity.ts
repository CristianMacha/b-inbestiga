import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Invoice} from '../invoice/invoice.entity';
import {EFeeStatus} from "../../core/enums/fee-status.enum";

@Entity()
export class Fee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    total: number;

    @Column({default: 0})
    numberFee: number;

    @Column({
        nullable: false,
        type: 'enum',
        enum: EFeeStatus,
        default: EFeeStatus.PENDING,
    })
    status: EFeeStatus;

    @Column({nullable: false})
    paymentDate: Date;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column()
    observation: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Invoice, (invoice) => invoice.fees, {nullable: false})
    invoice: Invoice;
}
