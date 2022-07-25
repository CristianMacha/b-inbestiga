import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Invoice} from '../invoice/invoice.entity';
import {Person} from '../person/person.entity';
import {EFeeStatus} from "../../core/enums/fee-status.enum";
import {EFeePaymentMethod} from "../../core/enums/fee-payment-methods.enum";

@Entity()
export class Fee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    total: number;

    @Column({
        nullable: false,
        type: 'enum',
        enum: EFeeStatus,
        default: EFeeStatus.PENDING,
    })
    status: EFeeStatus;

    @Column()
    fileName: string;

    @Column()
    code: string;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column()
    observation: string;

    @Column({nullable: true, type: 'enum', enum: EFeePaymentMethod, default: null})
    paymentMethod: EFeePaymentMethod;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Invoice, (invoice) => invoice.fees, {nullable: false})
    invoice: Invoice;

    @ManyToOne(() => Person, (person) => person.fees, {nullable: true})
    person: Person;
}
