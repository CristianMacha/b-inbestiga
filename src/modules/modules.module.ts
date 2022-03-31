import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { RequirementModule } from './requirement/requirement.module';
import { ProjectModule } from './project/project.module';
import { PersonProjectModule } from './person-project/person-project.module';
import { ProjectRequirementModule } from './project-requirement/project-requirement.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
    ProjectRequirementModule,
  ],
  exports: [
    RoleModule,
    UserModule,
    PersonModule,
    RequirementModule,
    ProjectModule,
    PersonProjectModule,
    ProjectRequirementModule,
  ]
})
export class ModulesModule {}
