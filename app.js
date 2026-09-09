```javascript
// --- STATE MANAGEMENT ---
const DB = {
    getResidents: () => JSON.parse(localStorage.getItem('building_residents')) || [],
    saveResidents: (data) => localStorage.setItem('building_residents', JSON.stringify(data))
};

// --- CRUD OPERATIONS ---
const App = {
    residents: DB.getResidents(),

    createResident(name, domicile) {
        const newResident = {
            id: Date.now().toString(),
            name,
            domicile,
            visitors: []
        };

        this.residents.push(newResident);
        DB.saveResidents(this.residents);
        this.render();
    },

    deleteResident(id) {
        this.residents = this.residents.filter(r => r.id !== id);
        DB.saveResidents(this.residents);
        this.render();
    },

    updateResident(id, newName, newDomicile) {
        const resident = this.residents.find(r => r.id === id);

        if (resident) {
            resident.name = newName;
            resident.domicile = newDomicile;

            DB.saveResidents(this.residents);
            this.render();
        }
    },

    // --- VISITORS ---

    addVisitor(residentId, visitorName) {
        const resident = this.residents.find(r => r.id === residentId);

        if (resident) {
            resident.visitors.push({
                id: 'v_' + Date.now().toString(),
                name: visitorName,
                date: new Date().toLocaleString()
            });

            DB.saveResidents(this.residents);
            this.render();
        }
    },

    // NUEVO: EDITAR VISITANTE
    updateVisitor(residentId, visitorId, newName) {
        const resident = this.residents.find(r => r.id === residentId);

        if (resident) {
            const visitor = resident.visitors.find(v => v.id === visitorId);

            if (visitor) {
                visitor.name = newName;

                DB.saveResidents(this.residents);
                this.render();
            }
        }
    },

    // NUEVO: ELIMINAR VISITANTE
    deleteVisitor(residentId, visitorId) {
        const resident = this.residents.find(r => r.id === residentId);

        if (resident) {
            resident.visitors = resident.visitors.filter(v => v.id !== visitorId);

            DB.saveResidents(this.residents);
            this.render();
        }
    },

    // --- DOM RENDERING ---
    render() {
        const listContainer = document.getElementById('residentsList');

        document.getElementById('residentCount').innerText =
            `(${this.residents.length})`;

        listContainer.innerHTML = '';

        this.residents.forEach(resident => {

            const card = document.createElement('div');
            card.className = 'resident-card';

            // VISITORS
            const visitorsHTML = resident.visitors.map(v => `
                <li>
                    <strong>${v.name}</strong>

                    <span style="color: #64748b;">
                        (Expected: ${v.date})
                    </span>

                    <button
                        onclick="editVisitor('${resident.id}', '${v.id}')"
                        style="margin-left: 10px; padding: 4px 8px;">
                        Editar
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteVisitor('${resident.id}', '${v.id}')"
                        style="padding: 4px 8px;">
                        Eliminar
                    </button>
                </li>
            `).join('');

            card.innerHTML = `
                <div class="resident-header">

                    <div>
                        <h3 style="margin:0;">
                            ${resident.name}
                        </h3>

                        <span style="color: #64748b;">
                            ${resident.domicile}
                        </span>
                    </div>

                    <div>
                        <button onclick="editResident('${resident.id}')">
                            Editar
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteResident('${resident.id}')">
                            Eliminar
                        </button>
                    </div>

                </div>

                <div class="visitor-section">

                    <strong>Visitors</strong>

                    <div style="display:flex; gap:5px; margin-top:5px;">

                        <input
                            type="text"
                            id="vis_${resident.id}"
                            placeholder="Nuevo Visitante Nombre">

                        <button onclick="addVisitor('${resident.id}')">
                            Add
                        </button>

                    </div>

                    <ul class="visitor-list">

                        ${
                            visitorsHTML ||
                            '<li>No expected visitors</li>'
                        }

                    </ul>

                </div>
            `;

            listContainer.appendChild(card);
        });
    }
};


// --- RESIDENT FORM ---

document.getElementById('residentForm').addEventListener('submit', (e) => {

    e.preventDefault();

    const name = document.getElementById('resName').value;
    const domicile = document.getElementById('resDomicile').value;

    App.createResident(name, domicile);

    e.target.reset();
});


// --- RESIDENT FUNCTIONS ---

window.deleteResident = (id) => {

    if (confirm('¿Eliminar este residente?')) {
        App.deleteResident(id);
    }

};


window.editResident = (id) => {

    const resident = App.residents.find(r => r.id === id);

    if (!resident) return;

    const newName = prompt(
        'Nuevo Nombre:',
        resident.name
    );

    const newDomicile = prompt(
        'Nuevo Domicilio (Apt):',
        resident.domicile
    );

    if (newName && newDomicile) {

        App.updateResident(
            id,
            newName.trim(),
            newDomicile.trim()
        );

    }

};


// --- VISITOR FUNCTIONS ---

window.addVisitor = (id) => {

    const input = document.getElementById(`vis_${id}`);

    if (input && input.value.trim() !== '') {

        App.addVisitor(
            id,
            input.value.trim()
        );

    }

};


// NUEVO: EDITAR VISITANTE

window.editVisitor = (residentId, visitorId) => {

    const resident = App.residents.find(
        r => r.id === residentId
    );

    if (!resident) return;

    const visitor = resident.visitors.find(
        v => v.id === visitorId
    );

    if (!visitor) return;

    const newName = prompt(
        'Nuevo nombre del visitante:',
        visitor.name
    );

    if (newName && newName.trim() !== '') {

        App.updateVisitor(
            residentId,
            visitorId,
            newName.trim()
        );

    }

};


// NUEVO: ELIMINAR VISITANTE

window.deleteVisitor = (residentId, visitorId) => {

    if (confirm('¿Eliminar este visitante?')) {

        App.deleteVisitor(
            residentId,
            visitorId
        );

    }

};


// --- INITIAL LOAD ---

App.render();
```
