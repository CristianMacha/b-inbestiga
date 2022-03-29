import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRequirementService } from './project-requirement.service';

describe('ProjectRequirementService', () => {
  let service: ProjectRequirementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectRequirementService],
    }).compile();

    service = module.get<ProjectRequirementService>(ProjectRequirementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
