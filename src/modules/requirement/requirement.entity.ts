import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Requirement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:false})
    name: string;

    
}