# Project Management POC

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6, and configured with **Tailwind CSS** and **Flowbite** for modern UI development.

## 🚀 Features

- **Angular 19** - Modern web framework
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite** - Beautiful components built on Tailwind CSS
- **TypeScript** - Type-safe development
- **Responsive Design** - Mobile-first approach

## 📦 Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## 🛠️ Development

To start a local development server, run:

```bash
ng serve
# or
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🎨 UI Components

This project is configured with Flowbite components. You can use any Flowbite component by:

1. Including the HTML structure from [Flowbite Documentation](https://flowbite.com/)
2. Using the FlowbiteService for JavaScript functionality:

```typescript
import { FlowbiteService } from './flowbite.service';

constructor(private flowbiteService: FlowbiteService) {}

ngOnInit(): void {
  this.flowbiteService.loadFlowbite(flowbite => {
    // Initialize Flowbite components
  });
}
```

## 🎯 Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## 🔧 Configuration

### Tailwind CSS
- Configuration: `tailwind.config.js`
- Styles: `src/styles.css` (includes Tailwind directives)

### Flowbite
- Included in `tailwind.config.js` plugins
- JavaScript added to `angular.json` scripts

## 🏗️ Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🧪 Testing

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 📖 Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Flowbite Components](https://flowbite.com/docs/components/alerts/)
- [Angular Documentation](https://angular.dev/)