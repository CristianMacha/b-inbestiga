import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { RequirementModule } from './requirement/requirement.module';
import { ProjectModule } from './project/project.module';
import { PersonProjectModule } from './person-project/person-project.module';
import { PetitionModule } from './petition/petition.module';
import { InvoiceModule } from './invoice/invoice.module';
import { FeeModule } from './fee/fee.module';
import { CommentaryModule } from './commentary/commentary.module';
import { PersonRoleModule } from './person-role/person-role.module';
import { CategoryModule } from './category/category.module';
import { ResourceModule } from './resource/resource.module';
import { PermissionModule } from './permission/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { RoleResourceModule } from './role-resource/role-resource.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
    PetitionModule,
    InvoiceModule,
    FeeModule,
    CommentaryModule,
    PersonRoleModule,
    CategoryModule,
    ResourceModule,
    PermissionModule,
    RolePermissionModule,
    RoleResourceModule,
    PaymentModule,
  ],
  exports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
    PetitionModule,
  ],
})
export class ModulesModule {}
