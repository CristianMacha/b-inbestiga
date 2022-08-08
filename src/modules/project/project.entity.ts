import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Category} from '../category/category.entity';
import {Commentary} from '../commentary/commentary.entity';

import {Invoice} from '../invoice/invoice.entity';
import {PersonProject} from '../person-project/person-project.entity';
import {Requirement} from '../requirement/requirement.entity';
import {EStatusPay} from "../../core/enums/status-pay.enum";
import {EProjectStatus} from "../../core/enums/project.enum";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    code: string;

    @Column({nullable: false})
    name: string;

    @Column({nullable: true})
    description: string;

    @Column()
    progress: number;

    @Column({nullable: false, default: true})
    inProgress: boolean;

    @Column({type: 'enum', enum: EStatusPay, nullable: false, default: EStatusPay.PENDING})
    statusPay: EStatusPay;

    @Column({type: 'enum', enum: EProjectStatus, default: EProjectStatus.ACCEPTED})
    status: EProjectStatus;

    @Column({type: 'date', nullable: true})
    expirationDate: Date;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column({nullable: false, default: false})
    deleted: boolean;

    @Column({nullable: false, default: false})
    archived: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => PersonProject, (personProject) => personProject.project)
    personProjects: PersonProject[];

    @OneToMany(() => Requirement, (requirement) => requirement.project)
    requirements: Requirement[];

    @OneToMany(() => Invoice, (invoice) => invoice.project)
    invoices: Invoice[];

    @OneToMany(() => Commentary, (commentary) => commentary.project)
    commentaries: Commentary[];

    @ManyToOne(() => Category, (category) => category.projects, {
        nullable: false,
    })
    category: Category;
}
