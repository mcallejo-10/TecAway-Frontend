import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact.service';
import { configureServiceTestingModule } from '../../../testing/angular-test-helpers';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    configureServiceTestingModule();
    service = TestBed.inject(ContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
