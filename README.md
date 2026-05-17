# Playwright Framework Template
Base limpia para arrancar frameworks de automatizacion con Playwright y TypeScript.
## Uso
```bash
npm install
npm run install:browsers
npm test
```
## Reportes Allure
Cada ejecucion de `npm test` genera resultados en `allure-results/`.
Para generar el reporte HTML:
```bash
npm run report:generate
```
Para abrir el ultimo reporte generado:
```bash
npm run report:open
```
Para generar y abrir un reporte temporal en un solo paso:
```bash
npm run report:serve
```
Para limpiar resultados y reportes:
```bash
npm run report:clean
```
En GitHub Actions, el workflow genera y sube:
- `playwright-report`: reporte HTML nativo de Playwright como artefacto descargable.
- `allure-report`: reporte HTML de Allure como artefacto descargable.
- GitHub Pages: publica el ultimo reporte Allure de la rama `main`.
Cuando GitHub Pages este activo, el reporte Allure se vera en:
```text
https://janmorata.github.io/Suite-Revel/
```
Tambien puedes lanzar la suite manualmente desde la pestana `Actions` del repositorio.
## Estructura base
- `tests/`: specs de Playwright.
- `pages/`: page objects.
- `utils/`: helpers compartidos.
La suite esta orientada al caso practico de REVEL sobre `https://www.driverevel.com`.
Page Objects iniciales:
- `pages/revel.page.ts`: acciones y elementos de la web publica de REVEL para grid, ficha de coche, formulario de lead y filtros.
Tests iniciales en formato plantilla:
- `tests/revel-flows.spec.ts`: Flujo A, escenario negativo del lead y Flujo B de filtros.
## Que recrear cuando empieces un framework
Estas piezas suelen aparecer en casi cualquier framework de Playwright:
### `tests/`
Aqui van los tests `.spec.ts`.
Ejemplo:
```ts
import { test, expect } from '@playwright/test';
test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/home/i);
});
```
### `pages/`
Aqui van los Page Objects. Sirven para centralizar acciones y localizadores de una pantalla concreta.
Ejemplo de nombre:
```text
pages/login.page.ts
pages/home.page.ts
```
### `utils/methods.ts`
Aqui puedes poner acciones comunes que no pertenecen a una sola pagina: generar datos, login por API, limpiar estado, esperar una respuesta concreta, leer fixtures, etc.
Usalo solo cuando haya logica repetida en varios tests o pages.
### `utils/assertions.ts`
Aqui puedes poner aserciones reutilizables del dominio: comprobar un toast, validar una tabla, confirmar que un usuario aparece en una lista, etc.
Usalo cuando una expectativa tenga varios pasos o se repita mucho.
### `utils/locators.ts`
Aqui puedes poner localizadores compartidos de elementos globales: header, menu lateral, botones comunes, modales reutilizables.
Para localizadores especificos de una pantalla, normalmente es mejor dejarlos dentro de su Page Object.
## Recomendacion
Empieza adaptando `tests/`. Cuando veas repeticion real, mueve logica a `pages/` y despues a `utils/`. Asi el framework crece por necesidad y no por costumbre.

## Datos de test

### Email

Se genera dinámicamente en cada ejecución usando un timestamp:

```
test.automation+[timestamp]@driverevel.com
```

**Por qué este enfoque:**
- El dominio `@driverevel.com` garantiza que el formulario no rechace el email por dominio desconocido o bloqueado.
- El alias `+[timestamp]` hace que cada ejecución use una dirección única, evitando colisiones con leads ya existentes en el CRM.
- No requiere ninguna dependencia externa ni fichero de fixtures: se genera inline con `Date.now()`.

```ts
const timestamp = Date.now();
const email = `test.automation+${timestamp}@driverevel.com`;
```

### Teléfono

Se genera dinámicamente en cada ejecución combinando el prefijo `6` con un número aleatorio de 8 dígitos:

```
6XXXXXXXX  (ej: 634821905)
```

**Por qué este enfoque:**
- El prefijo `6` garantiza que el número tenga formato de móvil español válido (9 dígitos, empieza por 6).
- `Math.random()` asegura que cada ejecución use un número distinto, evitando posibles bloqueos por repetición en el formulario.
- No requiere librerías externas: se genera inline con una sola línea.

```ts
const telefono = '6' + Math.floor(10000000 + Math.random() * 90000000);
```

### Dónde se generan

Ambos datos se pasan desde el test directamente a `fillLeadData()`, que los recibe como parámetros tipados. La generación ocurre en el nivel del spec, no dentro del Page Object, para mantener los datos visibles y controlables desde el test.

```ts
const timestamp = Date.now();
const telefono = '6' + Math.floor(10000000 + Math.random() * 90000000);
await revelPage.fillLeadData(
  'Test Automation',
  `test.automation+${timestamp}@driverevel.com`,
  telefono
);
```