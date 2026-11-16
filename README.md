# Seguridad CryptoLab

Aplicación educativa local para explorar las 64 lecciones del Bloque 1 de Seguridad mediante entradas editables, resultados reales y trazas estructuradas. Está construida con Vite, React y TypeScript estricto; no usa backend, cuentas, analítica ni servicios remotos.

## Uso

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Validación completa: `npm run check`. Pruebas de navegador: instalar Chromium una vez con `npx playwright install chromium` y ejecutar `npm run test:e2e`.

## Estructura

- `src/data`: temario, alfabetos y convenciones.
- `src/domain`: protocolo de motores y trazas.
- `src/engines`: motores puros clásicos, de análisis, modernos y de teoría de números.
- `src/components/lab`: shell, normalización y reproductor de pasos.
- `src/store`: progreso y preferencias locales.
- `e2e`: recorridos críticos.

El proyecto es un laboratorio docente, no una biblioteca criptográfica de producción. Los algoritmos históricos, claves pequeñas y ejemplos sin padding se identifican como inseguros.
