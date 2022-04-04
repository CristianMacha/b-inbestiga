import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { RequirementModule } from './requirement/requirement.module';
import { ProjectModule } from './project/project.module';
import { PersonProjectModule } from './person-project/person-project.module';

@Module({
  imports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
  ],
  exports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
  ]
})
export class ModulesModule {}
