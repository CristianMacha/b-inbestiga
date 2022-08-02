import { Test, TestingModule } from '@nestjs/testing';
import { RoleResourceService } from './role-resource.service';

describe('RoleResourceService', () => {
  let service: RoleResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleResourceService],
    }).compile();

    service = module.get<RoleResourceService>(RoleResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
