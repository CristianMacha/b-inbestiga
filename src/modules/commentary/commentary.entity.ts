import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Person } from '../person/person.entity';
import { Project } from '../project/project.entity';
import { Requirement } from '../requirement/requirement.entity';

@Entity()
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Person, (person) => person.commentaries, { nullable: false })
  person: Person;

  @ManyToOne(() => Project, (project) => project.commentaries, {
    nullable: true,
  })
  project: Project;

  @ManyToOne(() => Requirement, (requirement) => requirement.commentaries, {
    nullable: true,
  })
  requirement: Requirement;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
