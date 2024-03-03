import { Test, TestingModule } from '@nestjs/testing';
import { QueryHelperService } from './query-helper.service';

describe('QueryHelperService', () => {
  let service: QueryHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryHelperService],
    }).compile();

    service = module.get<QueryHelperService>(QueryHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
