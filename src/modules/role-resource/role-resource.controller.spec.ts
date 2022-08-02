import { Test, TestingModule } from '@nestjs/testing';
import { RoleResourceController } from './role-resource.controller';

describe('RoleResourceController', () => {
  let controller: RoleResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleResourceController],
    }).compile();

    controller = module.get<RoleResourceController>(RoleResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
