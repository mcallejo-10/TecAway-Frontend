import { TestBed } from '@angular/core/testing';
import { TechnicianStateService } from './technician-state.service';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('TechnicianStateService', () => {
  let service: TechnicianStateService;

  // Mock data
  const mockTechnicians: User[] = [
    {
      id_user: 1,
      email: 'tech1@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_1,
      name: 'Tech One',
      roles: ['user'],
      title: 'Frontend Developer',
      description: 'Expert in Angular',
      town: 'Madrid',
      can_move: true
    },
    {
      id_user: 2,
      email: 'tech2@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_2,
      name: 'Tech Two',
      roles: ['user'],
      title: 'Backend Developer',
      description: 'Expert in Node.js',
      town: 'Barcelona',
      can_move: false
    }
  ];

  const mockSections: Section[] = [
    { id_section: 1, section: 'Frontend' },
    { id_section: 2, section: 'Backend' }
  ];

  const mockKnowledges: Knowledge[] = [
    { id_knowledge: 1, knowledge: 'Angular', section_id: 1 },
    { id_knowledge: 2, knowledge: 'Node.js', section_id: 2 }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TechnicianStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should start with empty technicians list', () => {
      expect(service.allTechnicians()).toEqual([]);
      expect(service.filteredTechnicians()).toEqual([]);
    });

    it('should start with loading true', () => {
      expect(service.isLoading()).toBe(true);
    });

    it('should start with no filters selected', () => {
      expect(service.selectedSections()).toEqual([]);
      expect(service.selectedKnowledges()).toEqual([]);
    });

    it('should have zero counts initially', () => {
      expect(service.totalTechnicians()).toBe(0);
      expect(service.filteredCount()).toBe(0);
    });

    it('should indicate no active filters initially', () => {
      expect(service.hasActiveFilters()).toBe(false);
    });
  });

  describe('setAllTechnicians', () => {
    it('should set all technicians', () => {
      service.setAllTechnicians(mockTechnicians);
      
      expect(service.allTechnicians()).toEqual(mockTechnicians);
      expect(service.totalTechnicians()).toBe(2);
    });

    it('should also set filtered technicians on first call', () => {
      service.setAllTechnicians(mockTechnicians);
      
      expect(service.filteredTechnicians()).toEqual(mockTechnicians);
    });
  });

  describe('setFilteredTechnicians', () => {
    it('should update filtered technicians', () => {
      const filtered = [mockTechnicians[0]];
      service.setFilteredTechnicians(filtered);
      
      expect(service.filteredTechnicians()).toEqual(filtered);
      expect(service.filteredCount()).toBe(1);
    });
  });

  describe('setSelectedSections', () => {
    it('should update selected sections', () => {
      service.setSelectedSections(mockSections);
      
      expect(service.selectedSections()).toEqual(mockSections);
      expect(service.hasActiveFilters()).toBe(true);
    });

    it('should compute section IDs correctly', () => {
      service.setSelectedSections(mockSections);
      
      expect(service.selectedSectionIds()).toEqual([1, 2]);
    });
  });

  describe('setSelectedKnowledges', () => {
    it('should update selected knowledges', () => {
      service.setSelectedKnowledges(mockKnowledges);
      
      expect(service.selectedKnowledges()).toEqual(mockKnowledges);
      expect(service.hasActiveFilters()).toBe(true);
    });

    it('should compute knowledge IDs correctly', () => {
      service.setSelectedKnowledges(mockKnowledges);
      
      expect(service.selectedKnowledgeIds()).toEqual([1, 2]);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters', () => {
      // Setup: set some filters
      service.setAllTechnicians(mockTechnicians);
      service.setSelectedSections(mockSections);
      service.setSelectedKnowledges(mockKnowledges);
      service.setFilteredTechnicians([mockTechnicians[0]]);
      
      // Clear filters
      service.clearFilters();
      
      expect(service.selectedSections()).toEqual([]);
      expect(service.selectedKnowledges()).toEqual([]);
      expect(service.filteredTechnicians()).toEqual(mockTechnicians);
      expect(service.hasActiveFilters()).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
      
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      // Setup: populate state
      service.setAllTechnicians(mockTechnicians);
      service.setSelectedSections(mockSections);
      service.setSelectedKnowledges(mockKnowledges);
      service.setLoading(false);
      
      // Reset
      service.reset();
      
      expect(service.allTechnicians()).toEqual([]);
      expect(service.filteredTechnicians()).toEqual([]);
      expect(service.selectedSections()).toEqual([]);
      expect(service.selectedKnowledges()).toEqual([]);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('Computed Signals', () => {
    it('should reactively compute totalTechnicians', () => {
      expect(service.totalTechnicians()).toBe(0);
      
      service.setAllTechnicians([mockTechnicians[0]]);
      expect(service.totalTechnicians()).toBe(1);
      
      service.setAllTechnicians(mockTechnicians);
      expect(service.totalTechnicians()).toBe(2);
    });

    it('should reactively compute filteredCount', () => {
      service.setFilteredTechnicians([mockTechnicians[0]]);
      expect(service.filteredCount()).toBe(1);
      
      service.setFilteredTechnicians(mockTechnicians);
      expect(service.filteredCount()).toBe(2);
    });

    it('should reactively compute hasActiveFilters', () => {
      expect(service.hasActiveFilters()).toBe(false);
      
      service.setSelectedSections([mockSections[0]]);
      expect(service.hasActiveFilters()).toBe(true);
      
      service.setSelectedSections([]);
      service.setSelectedKnowledges([mockKnowledges[0]]);
      expect(service.hasActiveFilters()).toBe(true);
      
      service.setSelectedKnowledges([]);
      expect(service.hasActiveFilters()).toBe(false);
    });
  });
});
