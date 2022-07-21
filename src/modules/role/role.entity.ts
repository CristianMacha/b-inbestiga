import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import {PersonRole} from '../person-role/person-role.entity';
import {RolePermission} from "../role-permission/role-permission.entity";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, unique: true})
    name: string;

    @Column({nullable: false, default: true})
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => PersonRole, (personRole) => personRole.role)
    personRoles: PersonRole[];

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    rolePermissions: RolePermission[];
}
