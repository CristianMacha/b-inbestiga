import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Person } from "../person/person.entity";
import { Project } from "../project/project.entity";

@Entity()
export class PersonProject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Person, person => person.personProjects)
    person: Person;

    @ManyToOne(() => Project, project => project.personProjects, { nullable: false })
    project: Project;
};