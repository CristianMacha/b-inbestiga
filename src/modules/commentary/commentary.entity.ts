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

@Entity()
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Person, (person) => person.commentaries, { nullable: false })
  person: Person;

  @ManyToOne(() => Project, (project) => project.commentaries, {
    nullable: false,
  })
  project: Project;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
