import { TestBed } from '@angular/core/testing';

import { UserKnowledgeService } from './user-knowledge.service';

describe('UserKnowledgeService', () => {
  let service: UserKnowledgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserKnowledgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
