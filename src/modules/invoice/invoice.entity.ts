import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Fee } from '../fee/fee.entity';
import { Project } from '../project/project.entity';
import { InvoiceStatusEnum } from "../../core/enums/invoice.enum";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    total: number;

    @Column({ default: 0 })
    feesPaidOut: number;

    @Column({ nullable: false, default: 1 })
    feesNumber: number;

    @Column({
        nullable: false,
        type: 'enum',
        enum: InvoiceStatusEnum,
        default: InvoiceStatusEnum.PENDING,
    })
    status: InvoiceStatusEnum;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: false, default: true })
    active: boolean;

    @Column()
    expirationDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Project, (project) => project.invoices, { nullable: false })
    project: Project;

    @OneToMany(() => Fee, (fee) => fee.invoice)
    fees: Fee[];
}
