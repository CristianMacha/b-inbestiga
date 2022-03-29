import { Test, TestingModule } from '@nestjs/testing';
import { PersonProjectController } from './person-project.controller';

describe('PersonProjectController', () => {
  let controller: PersonProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonProjectController],
    }).compile();

    controller = module.get<PersonProjectController>(PersonProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
