import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Permission} from "../permission/permission.entity";
import {RoleResourceEntity} from "../role-resource/role-resource.entity";

@Entity({name: 'resource'})
export class ResourceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    url: string;

    @Column({nullable: false, default: true})
    active: boolean;

    @Column({nullable: false, default: false})
    deleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Permission, (permission) => permission.resource)
    permissions: Permission[];

    @OneToMany(() => RoleResourceEntity, roleResource => roleResource.resource)
    roleResources: RoleResourceEntity[];
}
