// Angular testing helpers for Jest migration
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

/**
 * Configuración base para tests de componentes Angular
 * Incluye los providers más comunes necesarios para los tests
 */
export function configureAngularTestingModule() {
  return TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      BrowserAnimationsModule
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: {},
            queryParams: {},
            data: {},
            paramMap: {
              get: () => null,
              has: () => false
            }
          },
          params: of({}),
          queryParams: of({}),
          data: of({})
        }
      }
    ]
  });
}

/**
 * Mock para ToastrService con todos los métodos necesarios
 */
export const mockToastrService = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  show: jest.fn(),
  clear: jest.fn(),
  remove: jest.fn(),
  toastrConfig: {
    timeOut: 3000,
    positionClass: 'toast-top-right',
    preventDuplicates: true
  }
};

/**
 * Mock para Router con navegación simulada
 */
export const mockRouter = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  url: '/',
  events: of({})
};

/**
 * Mock para ActivatedRoute con parámetros configurables
 */
export function createMockActivatedRoute(params: { [key: string]: any } = {}, queryParams: { [key: string]: any } = {}, data: { [key: string]: any } = {}) {
  return {
    snapshot: {
      params,
      queryParams,
      data,
      paramMap: {
        get: (key: string) => params[key] || null,
        has: (key: string) => key in params
      }
    },
    params: of(params),
    queryParams: of(queryParams),
    data: of(data)
  };
}

/**
 * Configuración específica para tests de servicios
 */
export function configureServiceTestingModule() {
  return TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      { provide: ToastrService, useValue: mockToastrService },
      { provide: Router, useValue: mockRouter }
    ]
  });
}

/**
 * Mock data para UserKnowledge service
 */
export const mockUserKnowledgeData = {
  data: [
    { knowledge_id: 1, user_id: 1 },
    { knowledge_id: 2, user_id: 1 },
    { knowledge_id: 3, user_id: 1 }
  ]
};

/**
 * Mock data para Knowledge service
 */
export const mockKnowledgeData = [
  { id: 1, name: 'JavaScript', section_id: 1 },
  { id: 2, name: 'TypeScript', section_id: 1 },
  { id: 3, name: 'Angular', section_id: 1 }
];

/**
 * Mock data para Section service
 */
export const mockSectionData = [
  { id: 1, name: 'Frontend Development' },
  { id: 2, name: 'Backend Development' }
];
