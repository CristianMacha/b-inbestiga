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
import { Invoice } from '../invoice/invoice.entity';
import { PersonProject } from '../person-project/person-project.entity';
import { Requirement } from '../requirement/requirement.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: true })
  inProgress: boolean;

  @Column({ nullable: false })
  status: string;

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

  @OneToOne(() => Invoice, { nullable: false })
  @JoinColumn()
  invoice: Invoice;
}
