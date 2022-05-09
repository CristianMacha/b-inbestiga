import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../person/person.entity';
import { Role } from '../role/role.entity';

@Entity()
export class PersonRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: true })
  aactive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Person, (person) => person.personRoles, { nullable: false })
  person: Person;

  @ManyToOne(() => Role, (role) => role.personRoles, { nullable: false })
  role: Role;
}
