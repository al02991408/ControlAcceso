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
