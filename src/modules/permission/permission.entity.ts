import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ResourceEntity} from "../resource/resourceEntity";
import {RolePermission} from "../role-permission/role-permission.entity";

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

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];

    @ManyToOne(() => ResourceEntity, (resource) => resource.permissions)
    resource: ResourceEntity;
}
