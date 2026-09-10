const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');

function createApp() {
    const app = express();
    const residents = [];

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.get('/api/residentes', (request, response) => {
        response.status(200).json(residents);
    });

    app.post('/api/residentes', (request, response) => {
        const body = request.body || {};
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const domicile = typeof body.domicile === 'string' ? body.domicile.trim() : '';

        if (!name || !domicile) {
            return response.status(400).json({
                error: 'El nombre y el departamento son obligatorios.'
            });
        }

        const resident = {
            id: crypto.randomUUID(),
            name,
            domicile,
            visitors: []
        };

        residents.push(resident);
        return response.status(201).json(resident);
    });

    app.put('/api/residentes/:id', (request, response) => {
        const resident = residents.find(item => item.id === request.params.id);

        if (!resident) {
            return response.status(404).json({ error: 'Residente no encontrado.' });
        }

        const body = request.body || {};
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const domicile = typeof body.domicile === 'string' ? body.domicile.trim() : '';

        if (!name || !domicile) {
            return response.status(400).json({
                error: 'El nombre y el departamento son obligatorios.'
            });
        }

        resident.name = name;
        resident.domicile = domicile;
        return response.status(200).json(resident);
    });

    app.delete('/api/residentes/:id', (request, response) => {
        const residentIndex = residents.findIndex(item => item.id === request.params.id);

        if (residentIndex === -1) {
            return response.status(404).json({ error: 'Residente no encontrado.' });
        }

        const [deletedResident] = residents.splice(residentIndex, 1);
        return response.status(200).json(deletedResident);
    });

    app.post('/api/residentes/:id/visitantes', (request, response) => {
        const resident = residents.find(item => item.id === request.params.id);

        if (!resident) {
            return response.status(404).json({ error: 'Residente no encontrado.' });
        }

        const body = request.body || {};
        const name = typeof body.name === 'string' ? body.name.trim() : '';

        if (!name) {
            return response.status(400).json({
                error: 'El nombre del visitante es obligatorio.'
            });
        }

        const visitor = {
            id: crypto.randomUUID(),
            name,
            type: typeof body.type === 'string' && body.type.trim() ? body.type.trim() : 'personal',
            date: new Date().toLocaleString('es-MX')
        };

        resident.visitors.push(visitor);
        return response.status(201).json(visitor);
    });

    return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
