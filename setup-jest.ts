// Global test configuration for Angular + Jest
import 'zone.js'; // Import Zone.js first
import 'zone.js/testing';   // Then import Zone.js testing
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console outputs
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Add Jasmine compatibility for existing tests
(global as any).jasmine = {
  createSpyObj: (baseName: string, methodNames: string[], propertyNames?: any) => {
    const obj: any = {};
    
    if (Array.isArray(methodNames)) {
      methodNames.forEach(methodName => {
        obj[methodName] = jest.fn();
        obj[methodName].and = {
          returnValue: (value: any) => {
            obj[methodName].mockReturnValue(value);
            return obj[methodName];
          },
          callFake: (fn: any) => {
            obj[methodName].mockImplementation(fn);
            return obj[methodName];
          }
        };
      });
    }
    
    if (propertyNames) {
      Object.keys(propertyNames).forEach(prop => {
        obj[prop] = propertyNames[prop];
      });
    }
    
    return obj;
  }
};

// Add spyOn global function for Jasmine compatibility
(global as any).spyOn = jest.spyOn;

// Add Jasmine-like matchers for Jest
expect.extend({
  toBeTrue(received) {
    const pass = received === true;
    return {
      message: () => `expected ${received} to be true`,
      pass,
    };
  },
  toBeFalse(received) {
    const pass = received === false;
    return {
      message: () => `expected ${received} to be false`,
      pass,
    };
  },
});

// Declare additional matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTrue(): R;
      toBeFalse(): R;
    }
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as Storage;
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as Storage;
global.sessionStorage = sessionStorageMock;

// Note: jsdom provides a working window.location mock by default
// If specific location mocking is needed in individual tests, mock it there

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords() { return []; }
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Auto-import testing helpers for convenience
import './src/testing/angular-test-helpers';
