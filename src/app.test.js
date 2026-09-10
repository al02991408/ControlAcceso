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

    test('actualiza el nombre de un residente', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .put(`/api/residentes/${created.body.id}`)
            .send({ name: 'Ana García', domicile: 'Apt 1A' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Ana García');
    });

    test('actualiza el departamento de un residente', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .put(`/api/residentes/${created.body.id}`)
            .send({ name: 'Ana López', domicile: 'Apt 2B' });

        expect(response.status).toBe(200);
        expect(response.body.domicile).toBe('Apt 2B');
    });

    test('confirma que los datos cambiaron', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        await request(app)
            .put(`/api/residentes/${created.body.id}`)
            .send({ name: 'Ana García', domicile: 'Apt 3C' });

        const response = await request(app).get('/api/residentes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                id: created.body.id,
                name: 'Ana García',
                domicile: 'Apt 3C',
                visitors: []
            }
        ]);
    });

    test('elimina un residente', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        const response = await request(app)
            .delete(`/api/residentes/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Residente eliminado.' });
    });

    test('confirma que dejó de existir', async () => {
        const created = await request(app)
            .post('/api/residentes')
            .send({ name: 'Ana López', domicile: 'Apt 1A' });

        await request(app)
            .delete(`/api/residentes/${created.body.id}`);

        const response = await request(app).get('/api/residentes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('actualiza un residente inexistente', async () => {
        const response = await request(app)
            .put('/api/residentes/00000000-0000-0000-0000-000000000000')
            .send({ name: 'Ana García', domicile: 'Apt 3C' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Residente no encontrado.' });
    });

    test('elimina un residente inexistente', async () => {
        const response = await request(app)
            .delete('/api/residentes/00000000-0000-0000-0000-000000000000');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Residente no encontrado.' });
    });
});
