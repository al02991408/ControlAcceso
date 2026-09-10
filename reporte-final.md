# Reporte final: Control de Acceso

## Trabajo realizado

### Persona 1

- Se creó la estructura `public/` y `src/`.
- Se configuró Express para servir `public/`.
- Se implementaron `GET /api/residentes` y `POST /api/residentes`.
- Se validaron nombre y departamento obligatorios.
- Se agregaron las primeras cinco pruebas automatizadas.

### Persona 2

- Se implementaron `PUT /api/residentes/:id` y `DELETE /api/residentes/:id`.
- Se agregó el manejo de residentes inexistentes con respuesta `404`.
- Se conservaron los datos de visitantes durante la actualización.

### Persona 3

- Se creó `server.js` para iniciar el servidor en el puerto `3000`.
- Se configuró `npm start`.
- Se implementó `POST /api/residentes/:id/visitantes`.
- Se validó el nombre del visitante y la existencia del residente.
- Se actualizó `public/cliente.js` para usar `fetch` con la API.
- Se mantuvo el diseño visual existente.
- Se creó `.gitignore` para excluir `node_modules/`.

## Pruebas

Comando ejecutado:

```text
npm test -- --runInBand
```

Resultado:

```text
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
```

Pruebas de visitantes:

- Registrar un visitante correctamente.
- Rechazar un visitante vacío con `400`.
- Rechazar un residente inexistente con `404`.

Prueba adicional de integración:

- Actualizar y eliminar un residente correctamente.

No hubo pruebas fallidas en la ejecución final.

## Ejecución manual

```text
npm start
http://localhost:3000
```

## Commit

Descripción solicitada:

```text
hecho por diego
```
