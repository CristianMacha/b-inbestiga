import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Role} from "../role/role.entity";
import {Permission} from "../permission/permission.entity";

@Entity()
export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, default: true})
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Role, (role) => role.rolePermissions)
    role: Role;

    @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
    permission: Permission;
}
