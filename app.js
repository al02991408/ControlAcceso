
// --- STATE MANAGEMENT (Storage Abstraction) ---
// This is decoupled so you can easily swap localStorage for an API call later.
const DB = {
    getResidents: () => JSON.parse(localStorage.getItem('building_residents')) || [],
    saveResidents: (data) => localStorage.setItem('building_residents', JSON.stringify(data))
};

// Centralized catalog so visitor types can be changed without touching the UI logic.
const VISITOR_TYPES = Object.freeze([
    { value: 'personal', label: 'Visita personal' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'proveedor', label: 'Proveedor' },
    { value: 'servicio', label: 'Personal de servicio' },
    { value: 'repartidor', label: 'Repartidor' },
    { value: 'otro', label: 'Otro' }
]);

const DEFAULT_VISITOR_TYPE = VISITOR_TYPES[0].value;

const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
})[character]);

const getVisitorType = (type) => VISITOR_TYPES.find(visitorType => visitorType.value === type);

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

    addVisitor(residentId, visitorName, visitorType = DEFAULT_VISITOR_TYPE) {
        const resident = this.residents.find(r => r.id === residentId);
        if (resident) {
            const validVisitorType = getVisitorType(visitorType)
                ? visitorType
                : DEFAULT_VISITOR_TYPE;

            if (!Array.isArray(resident.visitors)) resident.visitors = [];
            resident.visitors.push({
                id: 'v_' + Date.now().toString(),
                name: visitorName,
                type: validVisitorType,
                date: new Date().toLocaleString()
            });
            DB.saveResidents(this.residents);
            this.render();
        }
    },

    // --- DOM RENDERING (List Operation) ---
    render() {
        const listContainer = document.getElementById('residentsList');
        document.getElementById('residentCount').innerText = `(${this.residents.length})`;
        listContainer.innerHTML = ''; // Clear current list

        this.residents.forEach(resident => {
            const card = document.createElement('div');
            card.className = 'resident-card';

            const visitors = Array.isArray(resident.visitors) ? resident.visitors : [];

            // Build Visitor HTML
            const visitorsHTML = visitors.map(visitor => {
                const visitorType = getVisitorType(visitor.type);
                const typeValue = visitorType ? visitorType.value : 'sin-especificar';
                const typeLabel = visitorType ? visitorType.label : 'Sin especificar';

                return `
                    <li>
                        <div class="visitor-details">
                            <strong>${escapeHTML(visitor.name)}</strong>
                            <span class="visitor-date">Esperado: ${escapeHTML(visitor.date)}</span>
                        </div>
                        <span class="visitor-type visitor-type--${typeValue}">${typeLabel}</span>
                    </li>
                `;
            }).join('');

            const visitorTypeOptions = VISITOR_TYPES.map(visitorType =>
                `<option value="${visitorType.value}">${visitorType.label}</option>`
            ).join('');

            card.innerHTML = `
                <div class="resident-header">
                    <div>
                        <h3 style="margin:0;">${escapeHTML(resident.name)}</h3>
                        <span style="color: #64748b;">${escapeHTML(resident.domicile)}</span>
                    </div>
                    <div>
                        <button onclick="editResident('${resident.id}')">Editar</button>
                        <button class="delete-btn" onclick="deleteResident('${resident.id}')">Eliminar</button>
                    </div>
                </div>
                
                <div class="visitor-section">
                    <strong>Visitantes</strong>
                    <div class="visitor-form" role="group" aria-label="Agregar visitante para ${escapeHTML(resident.name)}">
                        <input
                            type="text"
                            id="vis_${resident.id}"
                            placeholder="Nombre del visitante"
                            aria-label="Nombre del visitante"
                        >
                        <select id="visType_${resident.id}" aria-label="Tipo de visitante">
                            ${visitorTypeOptions}
                        </select>
                        <button onclick="addVisitor('${resident.id}')">Agregar</button>
                    </div>
                    <ul class="visitor-list">
                        ${visitorsHTML || '<li class="visitor-empty">No hay visitantes esperados</li>'}
                    </ul>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
};

// --- EVENT LISTENERS & GLOBAL BINDINGS ---
document.getElementById('residentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('resName').value;
    const domicile = document.getElementById('resDomicile').value;
    App.createResident(name, domicile);
    e.target.reset(); // Clear form
});

// Global functions so inline HTML onclick handlers can reach them
window.deleteResident = (id) => {
    if(confirm('Eliminar este residente?')) App.deleteResident(id);
};

window.editResident = (id) => {
    const newName = prompt('Nuevo Nombre:');
    const newDomicile = prompt('Nuevo Domiclio (Apt):');
    if (newName && newDomicile) {
        App.updateResident(id, newName, newDomicile);
    }
};

window.addVisitor = (id) => {
    const input = document.getElementById(`vis_${id}`);
    const typeSelect = document.getElementById(`visType_${id}`);
    if(input.value.trim() !== '') {
        App.addVisitor(id, input.value.trim(), typeSelect.value);
    }
};

// Initial Load
App.render();

