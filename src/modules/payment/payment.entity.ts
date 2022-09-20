import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Person} from "../person/person.entity";
import {PaymentConceptEnum, PaymentMethodEnum, PaymentStatusEnum} from "../../core/enums/payment.enum";

@Entity({name: 'payment'})
export class PaymentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    amount: number;

    @Column({nullable: false})
    code: string;

    @Column({type: 'enum', enum: PaymentConceptEnum, nullable: false})
    concept: PaymentConceptEnum;

    @Column({nullable: false})
    conceptId: number;

    @Column({type: 'enum', enum: PaymentMethodEnum, default: null})
    paymentMethod: PaymentMethodEnum;

    @Column({type: 'enum', enum: PaymentStatusEnum, default: PaymentStatusEnum.PROCESSING})
    status: PaymentStatusEnum;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column({nullable: false, default: false})
    deleted: boolean;

    @ManyToOne(() => Person, person => person.payments, {nullable: false})
    person: Person;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
