// --- STATE MANAGEMENT (Storage Abstraction) ---
// This is decoupled so you can easily swap localStorage for an API call later.
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

    // --- DOM RENDERING (List Operation) ---
    render() {
        const listContainer = document.getElementById('residentsList');
        document.getElementById('residentCount').innerText = `(${this.residents.length})`;
        listContainer.innerHTML = ''; // Clear current list

        this.residents.forEach(resident => {
            const card = document.createElement('div');
            card.className = 'resident-card';
            
            // Build Visitor HTML
            const visitorsHTML = resident.visitors.map(v => 
                `<li><strong>${v.name}</strong> <span style="color: #64748b;">(Expected: ${v.date})</span></li>`
            ).join('');

            card.innerHTML = `
                <div class="resident-header">
                    <div>
                        <h3 style="margin:0;">${resident.name}</h3>
                        <span style="color: #64748b;">${resident.domicile}</span>
                    </div>
                    <div>
                        <button onclick="editResident('${resident.id}')">Editar</button>
                        <button class="delete-btn" onclick="deleteResident('${resident.id}')">Eliminar</button>
                    </div>
                </div>
                
                <div class="visitor-section">
                    <strong>Visitors</strong>
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <input type="text" id="vis_${resident.id}" placeholder="Nuevo Visitante Nombre">
                        <button onclick="addVisitor('${resident.id}')">Add</button>
                    </div>
                    <ul class="visitor-list">
                        ${visitorsHTML || '<li>No expected visitors</li>'}
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
    if(input.value.trim() !== '') {
        App.addVisitor(id, input.value.trim());
    }
};

// Initial Load
App.render();
