# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete migration from Karma+Jasmine to Jest+Playwright testing stack
- Jest configuration with Angular preset for unit testing
- Playwright configuration for cross-browser E2E testing
- Custom Angular testing helpers and utilities
- Comprehensive test coverage reporting (47.63%)
- Modern testing scripts in package.json
- Documentation for testing and migration process

### Changed
- Test runner changed from Karma to Jest for better performance (~40% faster)
- E2E testing now uses Playwright instead of Protractor
- Updated npm scripts to use new testing tools
- Improved developer experience with better error messages and debugging

### Removed
- Karma and all related dependencies (73 packages removed)
- Jasmine core dependencies (replaced with Jest compatibility layer)
- Angular CLI default test configuration
- Legacy testing configuration files

### Technical Details
- **Unit Tests**: 24 test suites, 33 tests passing ✅
- **E2E Tests**: 6 tests across 3 browsers (Chromium, Firefox, Webkit) ✅
- **Performance**: Tests run ~40% faster than previous setup
- **Coverage**: Detailed coverage reports with 47.63% code coverage
- **CI/CD Ready**: Optimized configuration for continuous integration

### Migration Commits
- `b4fd823`: Complete migration from Karma+Jasmine to Jest
- `0e72b74`: Add Playwright for end-to-end testing  
- `b9e27df`: Remove Karma and Jasmine dependencies

---

## [Previous Versions]

### [1.0.0] - 2025-01-XX
- Initial release of TecAway Frontend
- Angular 19 implementation
- Bootstrap UI with Bootswatch theme
- User registration and authentication
- Technician profile management
- Search and filtering functionality
- Contact system between users and technicians
- GDPR-compliant cookie consent banner
- Responsive design for mobile and desktop

### Features
- **User Management**: Registration, login, profile editing
- **Technician Profiles**: Detailed profiles with skills and knowledge areas
- **Search & Filter**: Advanced filtering by skills, location, availability
- **Contact System**: Direct communication between users and technicians
- **Responsive Design**: Mobile-first approach with Bootstrap
- **Modern UI**: Clean, professional interface design

### Technical Stack
- Angular 19 with standalone components
- Bootstrap 5.3 with custom SCSS
- NgRx for state management
- Angular Router for navigation
- HTTP interceptors for API communication
- Form validation with custom validators
- Cloudinary integration for image management
