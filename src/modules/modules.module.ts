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
  ],
  exports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
    PetitionModule,
  ]
})
export class ModulesModule {}
