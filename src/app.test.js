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

    test('rechaza visitantes para un residente inexistente', async () => {
        const response = await request(app)
            .post('/api/residentes/residente-inexistente/visitantes')
            .send({ name: 'Carlos Pérez' });

        expect(response.status).toBe(404);
    });
});

describe('Actualización y eliminación', () => {
    let app;

    beforeEach(() => {
        app = appModule.createApp();
    });

    test('actualiza y elimina un residente', async () => {
        const resident = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const updated = await request(app)
            .put(`/api/residentes/${resident.body.id}`)
            .send({ name: 'Ana García', domicile: 'Apt 2A' });

        expect(updated.status).toBe(200);
        expect(updated.body).toMatchObject({ name: 'Ana García', domicile: 'Apt 2A' });

        const deleted = await request(app).delete(`/api/residentes/${resident.body.id}`);
        expect(deleted.status).toBe(200);

        const residents = await request(app).get('/api/residentes');
        expect(residents.body).toHaveLength(0);
    });
});
