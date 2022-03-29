import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRequirementController } from './project-requirement.controller';

describe('ProjectRequirementController', () => {
  let controller: ProjectRequirementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectRequirementController],
    }).compile();

    controller = module.get<ProjectRequirementController>(ProjectRequirementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
