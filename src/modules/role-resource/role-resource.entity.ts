import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

import {Role} from "../role/role.entity";
import {ResourceEntity} from "../resource/resource.entity";

@Entity({name: 'role_resource'})
export class RoleResourceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, default: true})
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Role, role => role.roleResources)
    role: Role;

    @ManyToOne(() => ResourceEntity, resource => resource.roleResources)
    resource: ResourceEntity;
}