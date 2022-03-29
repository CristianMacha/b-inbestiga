import { Test, TestingModule } from '@nestjs/testing';
import { PersonProjectService } from './person-project.service';

describe('PersonProjectService', () => {
  let service: PersonProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonProjectService],
    }).compile();

    service = module.get<PersonProjectService>(PersonProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
