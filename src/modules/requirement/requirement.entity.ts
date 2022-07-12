import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Commentary } from '../commentary/commentary.entity';

import { Project } from '../project/project.entity';

@Entity()
export class Requirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column()
  description: string;

  @Column({ nullable: false })
  filename: string;

  @Column()
  url: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.requirements, {
    nullable: false,
  })
  project: Project;

  @OneToMany(() => Commentary, (commentary) => commentary.requirement)
  commentaries: Commentary[];
}
