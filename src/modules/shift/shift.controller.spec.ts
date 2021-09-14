import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('JobsController', () => {
  let controller: ShiftController;

  const mockShiftService = {
    createJob: jest.fn(() => {
      return {};
    }),

    bookTalent: jest.fn(() => {
      Promise.resolve({});
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
      providers: [ShiftService],
    })
      .overrideProvider(ShiftService)
      .useValue(mockShiftService)
      .compile();

    controller = module.get<ShiftController>(ShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
