# 🧪 Testing Guide - Jest & Playwright

This guide covers how to write, run, and maintain tests in our Jest + Playwright testing setup.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Unit Testing with Jest](#unit-testing-with-jest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Testing Utilities](#testing-utilities)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Running Tests
```bash
# Unit tests
npm test                    # Run all unit tests once
npm run test:jest:watch     # Watch mode for development
npm run test:jest:coverage  # With coverage report

# E2E tests  
npm run e2e                 # Run E2E tests
npm run e2e:headed          # Run with browser visible
npm run e2e:ui              # Interactive UI mode
```

### File Structure
```
src/
├── app/
│   ├── components/
│   │   └── *.component.spec.ts    # Component tests
│   ├── services/
│   │   └── *.service.spec.ts      # Service tests
│   └── guards/
│       └── *.guard.spec.ts        # Guard tests
├── testing/
│   └── angular-test-helpers.ts    # Shared testing utilities
└── __mocks__/
    └── file-mock.js              # File mocks

e2e/
└── *.spec.ts                     # End-to-end tests
```

## 🔧 Unit Testing with Jest

### Basic Component Test Structure

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureAngularTestingModule } from '../../testing/angular-test-helpers';
import { YourComponent } from './your.component';

describe('YourComponent', () => {
  let component: YourComponent;
  let fixture: ComponentFixture<YourComponent>;

  beforeEach(async () => {
    await configureAngularTestingModule({
      declarations: [YourComponent],
      // Add additional config as needed
    });

    fixture = TestBed.createComponent(YourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.title).toBe('Expected Title');
    expect(component.items).toEqual([]);
  });
});
```

### Testing Services

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [YourService]
    });

    service = TestBed.inject(YourService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

### Available Matchers

Jest includes all standard matchers plus our custom ones:

```typescript
// Standard Jest matchers
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeNull();
expect(value).toBeDefined();
expect(array).toContain(item);
expect(string).toMatch(/regex/);

// Custom Angular matchers
expect(condition).toBeTrue();    // Custom matcher
expect(condition).toBeFalse();   // Custom matcher

// Jasmine compatibility (available globally)
const spy = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
spyOn(service, 'method').and.returnValue(of(mockData));
```

### Mocking Dependencies

```typescript
// Mock a service
const mockUserService = {
  getUser: jest.fn().mockReturnValue(of(mockUser)),
  updateUser: jest.fn().mockReturnValue(of(updatedUser))
};

beforeEach(async () => {
  await configureAngularTestingModule({
    declarations: [ComponentUnderTest],
    providers: [
      { provide: UserService, useValue: mockUserService }
    ]
  });
});

// Mock HTTP calls
const httpSpy = jest.spyOn(httpClient, 'get').mockReturnValue(of(mockData));
```

## 🌐 E2E Testing with Playwright

### Basic E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should display the homepage correctly', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/TecAway/);
    
    // Check for key elements
    await expect(page.locator('app-header')).toBeVisible();
    await expect(page.locator('app-footer')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Verify navigation
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('form')).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-submit"]');
  }

  async getErrorMessage() {
    return this.page.textContent('[data-testid="error-message"]');
  }
}

// In your test
import { LoginPage } from '../pages/login.page';

test('should show error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('invalid@email.com', 'wrongpassword');
  
  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

### Common Playwright Patterns

```typescript
// Wait for elements
await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });
await page.waitForLoadState('networkidle');

// Handle dialogs
page.on('dialog', dialog => dialog.accept());

// Take screenshots
await page.screenshot({ path: 'screenshot.png' });

// Test on multiple browsers
['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`${browserName} tests`, () => {
    test.use({ browserName });
    
    test('cross-browser test', async ({ page }) => {
      // Test logic here
    });
  });
});
```

## 🛠️ Testing Utilities

### Angular Test Helpers

Our custom `configureAngularTestingModule` function simplifies setup:

```typescript
import { configureAngularTestingModule } from '../testing/angular-test-helpers';

// Automatically includes common modules and providers
await configureAngularTestingModule({
  declarations: [YourComponent],
  imports: [FormsModule], // Additional imports
  providers: [
    // Additional providers
    { provide: SomeService, useValue: mockService }
  ]
});

// Includes by default:
// - HttpClientTestingModule
// - RouterTestingModule
// - ToastrModule.forRoot()
// - Common Angular modules
```

### Custom Test Data

```typescript
// testing/test-data.ts
export const TEST_USER = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  // ... other properties
};

export const TEST_RESPONSES = {
  success: { status: 'success', data: TEST_USER },
  error: { status: 'error', message: 'Something went wrong' }
};
```

## 🎯 Best Practices

### Unit Tests
- ✅ **Test behavior, not implementation**
- ✅ **Use descriptive test names**: `should display error when login fails`
- ✅ **Follow AAA pattern**: Arrange, Act, Assert
- ✅ **Mock external dependencies**
- ✅ **Test edge cases and error conditions**
- ✅ **Keep tests isolated and independent**

### E2E Tests
- ✅ **Use data-testid attributes** instead of CSS selectors
- ✅ **Test user workflows**, not individual components
- ✅ **Use Page Object Model** for reusable code
- ✅ **Wait for elements** properly with `waitForSelector`
- ✅ **Test across multiple browsers**
- ✅ **Keep tests stable** and avoid flaky tests

### General
- ✅ **Write tests first** (TDD when possible)
- ✅ **Maintain good coverage** (aim for 80%+)
- ✅ **Review failing tests** before fixing code
- ✅ **Keep tests simple** and focused
- ✅ **Use meaningful assertions**

## 🐛 Troubleshooting

### Common Jest Issues

**Zone.js errors:**
```typescript
// Ensure Zone.js is properly imported in setup-jest.ts
import 'zone.js';
import 'zone.js/testing';
```

**Module not found:**
```typescript
// Check jest.config.js moduleNameMapper
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
}
```

**Async test issues:**
```typescript
// Use fakeAsync for testing timers
import { fakeAsync, tick } from '@angular/core/testing';

it('should handle delayed operations', fakeAsync(() => {
  component.delayedMethod();
  tick(1000); // Advance time
  expect(component.result).toBe(expected);
}));
```

### Common Playwright Issues

**Element not found:**
```typescript
// Use waitForSelector
await page.waitForSelector('[data-testid="element"]');
await page.click('[data-testid="element"]');

// Or use expect with timeout
await expect(page.locator('[data-testid="element"]')).toBeVisible({ timeout: 10000 });
```

**Flaky tests:**
```typescript
// Add retry logic
test.describe.configure({ retries: 2 });

// Use waitForLoadState
await page.waitForLoadState('networkidle');

// Use proper selectors
await page.locator('[data-testid="button"]').click();
```

### Coverage Issues

**Low coverage:**
```bash
# Generate detailed coverage report
npm run test:jest:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

**Exclude files from coverage:**
```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.spec.ts',
  '!src/**/*.stories.ts',
  '!src/main.ts',
  '!src/environments/**'
]
```

## 📊 Coverage Goals

| File Type | Target Coverage |
|-----------|----------------|
| Components | 80%+ |
| Services | 90%+ |
| Guards | 85%+ |
| Pipes | 95%+ |
| Validators | 90%+ |

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [jest-preset-angular](https://github.com/thymikee/jest-preset-angular)

---

**Happy Testing! 🎉**

Remember: Good tests are your safety net for confident refactoring and feature development.
