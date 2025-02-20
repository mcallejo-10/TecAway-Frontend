import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserKnowledgeService } from './user-knowledge.service';

describe('UserKnowledgeService', () => {
  let service: UserKnowledgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        UserKnowledgeService
      ]
    });
    service = TestBed.inject(UserKnowledgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
