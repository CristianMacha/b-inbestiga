import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Role} from "../role/role.entity";
import {Resource} from "../resource/resource.entity";

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column({nullable: false, default: false})
    deleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Role, (role) => role.permissions)
    role: Role;

    @ManyToOne(() => Resource, (resource) => resource.permissions)
    resource: Resource;
}
