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
import { Commentary } from '../commentary/commentary.entity';

import { Invoice } from '../invoice/invoice.entity';
import { PersonProject } from '../person-project/person-project.entity';
import { Requirement } from '../requirement/requirement.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, default: true })
  inProgress: boolean;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PersonProject, (personProject) => personProject.project)
  personProjects: PersonProject[];

  @OneToMany(() => Requirement, (requirement) => requirement)
  requirements: Requirement[];

  @OneToMany(() => Invoice, (invoice) => invoice.project)
  invoices: Invoice[];

  @OneToMany(() => Commentary, (commentary) => commentary.project)
  commentaries: Commentary[];
}
