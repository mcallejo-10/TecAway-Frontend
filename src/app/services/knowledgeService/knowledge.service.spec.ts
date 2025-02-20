import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { KnowledgeService } from './knowledge.service';

describe('KnowledgeService', () => {
  let service: KnowledgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        KnowledgeService
      ]
    });
    service = TestBed.inject(KnowledgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
