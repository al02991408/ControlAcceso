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
        const body = request.body || {};
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const domicile = typeof body.domicile === 'string' ? body.domicile.trim() : '';

        if (!name || !domicile) {
            return response.status(400).json({
                error: 'El nombre y el departamento son obligatorios.'
            });
        }

        const residentIndex = residents.findIndex((resident) => resident.id === request.params.id);

        if (residentIndex === -1) {
            return response.status(404).json({
                error: 'Residente no encontrado.'
            });
        }

        residents[residentIndex] = {
            ...residents[residentIndex],
            name,
            domicile
        };

        return response.status(200).json(residents[residentIndex]);
    });

    app.delete('/api/residentes/:id', (request, response) => {
        const residentIndex = residents.findIndex((resident) => resident.id === request.params.id);

        if (residentIndex === -1) {
            return response.status(404).json({
                error: 'Residente no encontrado.'
            });
        }

        residents.splice(residentIndex, 1);
        return response.status(200).json({ message: 'Residente eliminado.' });
    });

    return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
