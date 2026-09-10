const request = require('supertest');
const appModule = require('./app');

describe('Creación y consulta de residentes', () => {
    let app;

    beforeEach(() => {
        app = appModule.createApp();
    });

    test('crea un residente', async () => {
        const response = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Ana López');
        expect(response.body.domicile).toBe('Apt 1A');
    });

    test('rechaza un nombre vacío', async () => {
        const response = await request(app)
            .post('/api/residentes')
            .send({ name: '   ', domicile: 'Apt 1A' });

        expect(response.status).toBe(400);
    });

    test('rechaza un departamento vacío', async () => {
        const response = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: '' });

        expect(response.status).toBe(400);
    });

    test('consulta la lista de residentes', async () => {
        await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app).get('/api/residentes');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test('incluye identificador, nombre, departamento y visitantes', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        expect(created.body).toEqual({
            id: expect.any(String),
            name: 'Ana López',
            domicile: 'Apt 1A',
            visitors: []
        });
    });
});

describe('Actualización y eliminación de residentes', () => {
    let app;

    beforeEach(() => {
        app = appModule.createApp();
    });

    test('actualiza nombre y departamento', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .put(`/api/residentes/${created.body.id}`)
            .send({ name: 'Ana García', domicile: 'Apt 3C' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ name: 'Ana García', domicile: 'Apt 3C' });
    });

    test('confirma los datos actualizados', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        await request(app)
            .put(`/api/residentes/${created.body.id}`)
            .send({ name: 'Ana García', domicile: 'Apt 3C' });

        const response = await request(app).get('/api/residentes');
        expect(response.body[0]).toMatchObject({ name: 'Ana García', domicile: 'Apt 3C' });
    });

    test('elimina un residente y confirma que dejó de existir', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const deleted = await request(app).delete(`/api/residentes/${created.body.id}`);
        expect(deleted.status).toBe(200);

        const response = await request(app).get('/api/residentes');
        expect(response.body).toEqual([]);
    });

    test('responde 404 al actualizar un residente inexistente', async () => {
        const response = await request(app)
            .put('/api/residentes/residente-inexistente')
            .send({ name: 'Ana García', domicile: 'Apt 3C' });

        expect(response.status).toBe(404);
    });

    test('responde 404 al eliminar un residente inexistente', async () => {
        const response = await request(app).delete('/api/residentes/residente-inexistente');
        expect(response.status).toBe(404);
    });
});

describe('Visitantes', () => {
    let app;

    beforeEach(() => {
        app = appModule.createApp();
    });

    test('registra un visitante para un residente', async () => {
        const resident = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .post(`/api/residentes/${resident.body.id}/visitantes`)
            .send({ name: 'Carlos Pérez', type: 'familiar' });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            id: expect.any(String),
            name: 'Carlos Pérez',
            type: 'familiar',
            date: expect.any(String)
        });
    });

    test('rechaza un visitante vacío', async () => {
        const resident = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .post(`/api/residentes/${resident.body.id}/visitantes`)
            .send({ name: '   ' });

        expect(response.status).toBe(400);
    });

    test('responde 404 para un residente inexistente', async () => {
        const response = await request(app)
            .post('/api/residentes/residente-inexistente/visitantes')
            .send({ name: 'Carlos Pérez' });

        expect(response.status).toBe(404);
    });
});
