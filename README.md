# Proyecto Final - Frontend

Este es el repositorio del frontend del Proyecto Final de IT-ACADEMY. Este proyecto está desarrollado con Angular y tiene como objetivo proporcionar una interfaz de usuario para la gestión de conocimientos y usuarios.

## Estructura del Proyecto

La estructura del proyecto es la siguiente:

```plaintext
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
```

## Instalación

Para instalar las dependencias del proyecto, ejecuta el siguiente comando:

```bash
npm install
```

## Ejecución

Para ejecutar el proyecto en un entorno de desarrollo, utiliza el siguiente comando:

```bash
ng serve
```

El proyecto estará disponible en `http://localhost:4200`.

## Construcción

Para construir el proyecto para producción, utiliza el siguiente comando:

```bash
ng build
```

Los archivos generados estarán en la carpeta `dist/`.

## Contribución

Si deseas contribuir a este proyecto, por favor sigue los siguientes pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

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