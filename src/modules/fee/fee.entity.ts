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
import {EInvoicePaymentMethod, EStatusPay} from "../../core/enums/status-pay.enum";

@Entity()
export class Fee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
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
    code: string;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column({nullable: false, type: 'enum', enum: EInvoicePaymentMethod, default: EInvoicePaymentMethod.CASH_PAYMENT})
    paymentMethod: EInvoicePaymentMethod;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Invoice, (invoice) => invoice.fees, {nullable: false})
    invoice: Invoice;

    @ManyToOne(() => Person, (person) => person.fees, {nullable: true})
    person: Person;
}
