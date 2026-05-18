# Playwright Framework Template
Base limpia para arrancar frameworks de automatizacion con Playwright y TypeScript.

## Prerrequisitos
 
- Node.js 18 o superior
- npm 9 o superior
- Acceso a internet (los tests corren contra `https://www.driverevel.com`)
- Java 8 o superior si quieres generar reportes Allure en local (el CLI de Allure lo requiere)
No se necesitan credenciales ni variables de entorno para ejecutar la suite actual. Los tests corren en modo anónimo contra la web pública de REVEL.

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
https://janmorata.github.io/Prueba_Practica_Revel/
```
Tambien puedes lanzar la suite manualmente desde la pestana `Actions` del repositorio.
## Estructura base
- `tests/`: specs de Playwright.
- `pages/`: page objects.
- `utils/`: helpers compartidos.
La suite esta orientada al caso practico de REVEL sobre `https://www.driverevel.com`.
- Page Objects iniciales: `pages/revel.page.ts`: acciones y elementos de la web publica de REVEL para grid, ficha de coche, formulario de lead y filtros.
- Tests iniciales en formato plantilla: `tests/revel-flows.spec.ts`: Flujo A, escenario negativo del lead y Flujo B de filtros.

## Pasos fuera de scope: supuestos si hubiera que automatizar más allá
 
El funnel de REVEL continúa tras el formulario de lead con al menos tres pasos: "Tus datos", configurador y validación financiera. Quedan fuera del scope actual, pero estos son los supuestos que manejaría antes de automatizarlos:
 
**"Tus datos"**
Este paso requiere datos personales reales o semirreales (DNI, dirección, fecha de nacimiento). El supuesto principal es que el entorno de test tenga un backend que acepte datos ficticios sin disparar validaciones reales contra bases de datos externas (padrón, DGT, etc.). Si no es así, habría que acordar con el equipo un conjunto de datos de test whitelisted que pasen esas validaciones sin efectos secundarios.
 
**Validación financiera**
Es el paso más delicado. El supuesto es que hay un modo sandbox o una respuesta mockeada para el entorno de test, porque automatizar contra una financiera real generaría solicitudes de crédito reales. Habría que confirmar con el equipo si existe ese sandbox antes de escribir una sola línea.
 
**Supuesto transversal**
Para poder automatizar el funnel completo de extremo a extremo sin dejar basura, lo ideal es tener un mecanismo de limpieza: una API interna o un script que elimine los leads de test tras cada ejecución. Sin eso, los datos de test se acumulan y pueden interferir con métricas de negocio reales.

## Datos de test

### Email

Se genera dinámicamente en cada ejecución usando un timestamp:

```
test.automation+[timestamp]@driverevel.com
```

**Por qué este enfoque:**
- El dominio `@driverevel.com` garantiza que el formulario no rechace el email por dominio desconocido o bloqueado.
- El alias `+[timestamp]` hace que cada ejecución use una dirección única, evitando colisiones con leads ya existentes.
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

### Colisiones en ejecuciones concurrentes
 
Dos ejecuciones que arranquen en el mismo milisegundo generarían el mismo `timestamp` y por tanto el mismo email. En la práctica esto es muy improbable, pero en un entorno con paralelismo real (varios workers de CI corriendo a la vez) conviene tenerlo en cuenta.
 
**Email:** `Date.now()` devuelve milisegundos desde epoch. Dos procesos distintos que llamen a `Date.now()` en el mismo milisegundo obtendrían el mismo valor. La probabilidad es baja pero no nula en pipelines paralelos. Si fuera un problema real, la solución es añadir un sufijo aleatorio al timestamp:
 
```ts
const timestamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
// resultado: test.automation+1716123456789-k3f9x@driverevel.com
```
 
**Teléfono:** `Math.random()` es independiente entre procesos — cada worker tiene su propia semilla — por lo que dos ejecuciones concurrentes generan números distintos de forma natural. El espacio de valores posibles es de 90.000.000 combinaciones, lo que hace la colisión estadísticamente irrelevante.
 
**Conclusión:** Con la implementación actual el riesgo de colisión es prácticamente nulo. Si en el futuro la suite escala a decenas de workers en paralelo, añadir el sufijo aleatorio al email es el único ajuste necesario.

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

## Limpieza en un entorno real
 
La suite actual corre contra producción y genera leads reales con cada ejecución. En un entorno profesional esto es un problema: los datos de test contaminan métricas de negocio, informes de ventas y listas de contacto.
 
Estas son las estrategias que aplicaría, por orden de preferencia:
 
**1. Entorno de QA dedicado**
Lo ideal es que los tests nunca corran contra producción. Un entorno de QA con base de datos propia hace que la limpieza sea trivial: se puede truncar o restaurar el estado entre ejecuciones sin riesgo.
 
**2. API de limpieza post-test**
Si no hay QA Page, la siguiente opción es una API interna que permita eliminar leads por email o por un tag de test. El identificador ya está integrado: el alias `test.automation+[timestamp]@driverevel.com` permite filtrar todos los registros generados por la suite. Un `globalTeardown` en Playwright puede hacer esa llamada al final de cada ejecución.
 
**3. Tag de test en los datos**
Si tampoco hay API de borrado, al menos conviene etiquetar los leads de test de forma consistente — por ejemplo, con el nombre "Test Automation" y el dominio `@driverevel.com` — para que el equipo de negocio pueda filtrarlos y excluirlos de sus métricas manualmente.
 
**4. Mock de la capa de red**
Para tests que no necesiten validar la integración real con el backend, Playwright permite interceptar y mockear peticiones de red con `page.route()`. Esto evita que los datos lleguen a la Base de Datos y elimina la necesidad de limpieza. Es especialmente útil para el escenario negativo (email inválido), donde la red no debería llegar nunca al servidor.
 
## Qué automatizaría a continuación y por qué
 
Partiendo de lo que ya está cubierto — lead válido desde ficha de coche, escenario negativo de email inválido, y filtro con vuelta al estado inicial — estos serían los siguientes pasos, ordenados por valor y riesgo:
 
**1. Filtros combinados y persistencia de estado**
El Flujo B actual valida un solo filtro. La web de REVEL permite combinar marca, tipo de combustible, precio y permanencia simultáneamente. Un test que combine dos o tres filtros y verifique que los resultados son coherentes con la selección cubre un área de alta probabilidad de regresión: los filtros son lógica de frontend con muchas combinaciones posibles. Además, verificar que al limpiar los filtros el grid vuelve al estado original completo es una aserción de valor real para el negocio.
 
**3. Página de oferta o promoción**
La web tiene una sección `/promocion-coches-por-renting` que probablemente muestra un subconjunto del catálogo con condiciones especiales. Automatizar que esa página carga, muestra coches y permite abrir una ficha garantiza que las campañas de marketing no están rotas. Es un flujo de alto valor de negocio porque el tráfico de esas páginas suele venir de anuncios de pago.
 
**4. Cambio de idioma o mercado**
La URL tiene estructura `/es/es/` (país/idioma). Si REVEL opera en más mercados, un test que cambie el idioma y verifique que los textos clave cambian detectaría regresiones en la internacionalización sin necesidad de revisar manualmente cada variante.

## Integración con CI
 
El repositorio incluye un workflow de GitHub Actions que se ejecuta automáticamente en cada push a `main` y en cada Pull Request, y también puede lanzarse manualmente desde la pestaña `Actions`.
 
El pipeline hace lo siguiente en orden:
 
1. Instala Node.js y las dependencias del proyecto
2. Instala los navegadores de Playwright
3. Ejecuta la suite completa con `npm test`
4. Sube el reporte HTML nativo de Playwright como artefacto descargable
5. Genera el reporte Allure y lo sube como artefacto descargable
6. Publica el reporte Allure en GitHub Pages
Los artefactos `playwright-report` y `allure-report` están siempre disponibles desde la pestaña `Actions` independientemente de si Pages está activo, lo que permite revisar los resultados de cualquier ejecución sin configuración adicional.
 
Para lanzar la suite manualmente desde GitHub:
 
1. Ve a la pestaña `Actions` del repositorio
2. Selecciona el workflow en el panel izquierdo
3. Haz clic en `Run workflow` y confirma
## Uso de herramientas de IA
 
Durante el desarrollo de este framework se han utilizado dos herramientas de IA con propósitos distintos:
 
**OpenAI Codex**
Se usó para adaptar el framework base de Playwright al proyecto concreto de REVEL. El punto de partida era una plantilla genérica (guardad en Repos mios de distintos frameworks, con la misma disposición y estructura) y Codex ayudó a actualizarla con la configuración del workflow de GitHub Actions con los pasos de Allure y GitHub Pages. El resultado se revisó manualmente: que el workflow ejecutaba correctamente en GitHub Actions antes de darlo por válido.
 
**Claude (Anthropic)**
Se usó para resolver dudas generales durante el desarrollo: comportamiento de Playwright en casos concretos, razonamiento sobre estrategias de datos de test, decisiones de arquitectura del framework y redacción de esta documentación. Las respuestas se contrastaron con la documentación oficial de Playwright y con el comportamiento real observado en las ejecuciones.
 
En ningún caso se incorporó código o documentación generado por IA sin revisión previa. La validación final fue siempre la ejecución real de los tests y la observación del comportamiento en el navegador.
