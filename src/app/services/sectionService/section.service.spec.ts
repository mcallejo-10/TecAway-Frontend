import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SectionService } from './section.service';

describe('SectionService', () => {
  let service: SectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SectionService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(SectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
