# TecAway

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


src
├── app
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.component.spec.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── components
│   │   ├── add-knowledges
│   │   │   ├── add-knowledges.component.html
│   │   │   ├── add-knowledges.component.scss
│   │   │   ├── add-knowledges.component.spec.ts
│   │   │   └── add-knowledges.component.ts
│   │   ├── edit-user
│   │   │   ├── edit-user.component.html
│   │   │   ├── edit-user.component.scss
│   │   │   ├── edit-user.component.spec.ts
│   │   │   └── edit-user.component.ts
│   │   ├── footer
│   │   │   ├── footer.component.html
│   │   │   ├── footer.component.scss
│   │   │   ├── footer.component.spec.ts
│   │   │   └── footer.component.ts
│   │   ├── header
│   │   │   ├── header.component.html
│   │   │   ├── header.component.scss
│   │   │   ├── header.component.spec.ts
│   │   │   └── header.component.ts
│   │   ├── home
│   │   │   ├── home.component.html
│   │   │   ├── home.component.scss
│   │   │   ├── home.component.spec.ts
│   │   │   └── home.component.ts
│   │   ├── login
│   │   │   ├── login.component.html
│   │   │   ├── login.component.scss
│   │   │   ├── login.component.spec.ts
│   │   │   └── login.component.ts
│   │   ├── register
│   │   │   ├── register.component.html
│   │   │   ├── register.component.scss
│   │   │   ├── register.component.spec.ts
│   │   │   └── register.component.ts
│   │   ├── technician-detail
│   │   │   ├── technician-detail.component.html
│   │   │   ├── technician-detail.component.scss
│   │   │   ├── technician-detail.component.spec.ts
│   │   │   └── technician-detail.component.ts
│   │   ├── technicians
│   │   │   ├── technicians.component.html
│   │   │   ├── technicians.component.scss
│   │   │   ├── technicians.component.spec.ts
│   │   │   └── technicians.component.ts
│   │   └── user-info
│   │       ├── user-info.component.html
│   │       ├── user-info.component.scss
│   │       ├── user-info.component.spec.ts
│   │       └── user-info.component.ts
│   ├── guards
│   │   ├── auth.guard.spec.ts
│   │   ├── auth.guard.ts
│   │   └── auth.service.guard.ts
│   ├── interceptors
│   │   ├── auth.interceptor.spec.ts
│   │   └── auth.interceptor.ts
│   ├── interfaces
│   │   ├── knowledge.ts
│   │   ├── login.ts
│   │   ├── recovery-token.ts
│   │   ├── section.ts
│   │   ├── user-knowledge.ts
│   │   └── user.ts
│   ├── services
│   │   ├── authService
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.service.ts
│   │   ├── filterService
│   │   │   ├── filter.service.spec.ts
│   │   │   └── filter.service.ts
│   │   ├── knowledgeService
│   │   │   ├── knowledge.service.spec.ts
│   │   │   └── knowledge.service.ts
│   │   ├── sectionService
│   │   │   ├── section.service.spec.ts
│   │   │   └── section.service.ts
│   │   ├── userKowledgeService
│   │   │   ├── user-knowledge.service.spec.ts
│   │   │   └── user-knowledge.service.ts
│   │   └── userService
│   │       ├── user.service.spec.ts
│   │       └── user.service.ts
│   └── validators
│       └── must-match.validator.ts
├── assets
│   └── img
│       ├── Logo_TecAway_yellow.svg
│       ├── tecnic_1.png
│       └── user_image.png
├── environments
│   ├── environment.development.ts
│   └── environment.ts
├── index.html
├── main.ts
└── styles.scss