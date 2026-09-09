const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
};

const DB = {
    getResidents: () => JSON.parse(localStorage.getItem('building_residents')) || [],
    saveResidents: (data) => localStorage.setItem('building_residents', JSON.stringify(data))
};

const App = {
    residents: DB.getResidents(),

    init() {
        this.populateApartments();
        this.render();
    },

    populateApartments() {
        const select = document.getElementById('resDomicile');
        if (window.DEPARTAMENTOS) {
            window.DEPARTAMENTOS.forEach(apt => {
                const option = document.createElement('option');
                option.value = apt;
                option.textContent = apt;
                select.appendChild(option);
            });
        }
    },

    createResident(name, domicile) {
        // BUG FIX #5: Prevent duplicate residents
        if (this.residents.some(r => r.domicile === domicile)) {
            alert(`A resident already exists for ${domicile}`);
            return;
        }

        const newResident = {
            id: Date.now().toString(),
            name: name.trim(),
            domicile: domicile,
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
            resident.name = newName.trim();
            resident.domicile = newDomicile;
            DB.saveResidents(this.residents);
            this.render();
        }
    },

    addVisitor(residentId, visitorName, visitorType) {
        const resident = this.residents.find(r => r.id === residentId);
        if (resident) {
            resident.visitors.push({
                id: 'v_' + Date.now().toString(),
                name: visitorName.trim(),
                type: visitorType,
                date: new Date().toLocaleString()
            });
            DB.saveResidents(this.residents);
            this.render();
        }
    },

    render() {
        const listContainer = document.getElementById('residentsList');
        document.getElementById('residentCount').innerText = `(${this.residents.length})`;
        listContainer.innerHTML = ''; 

        this.residents.forEach(resident => {
            const card = document.createElement('div');
            card.className = 'resident-card';
            
            const safeName = escapeHTML(resident.name);
            const safeDomicile = escapeHTML(resident.domicile);

            const visitorsHTML = resident.visitors.map(v => {
                const safeVisitorName = escapeHTML(v.name);
                return `
                    <li>
                        <strong>${safeVisitorName}</strong> 
                        <span class="badge type-${v.type}">${v.type}</span>
                        <span style="color: #64748b; font-size: 0.85em; margin-left: auto;">${v.date}</span>
                    </li>
                `;
            }).join('');

            card.innerHTML = `
                <div class="resident-header">
                    <div>
                        <h3 style="margin:0;">${safeName}</h3>
                        <span style="color: #64748b;">${safeDomicile}</span>
                    </div>
                    <div>
                        <button onclick="handleEditResident('${resident.id}')">Edit</button>
                        <button class="delete-btn" onclick="handleDeleteResident('${resident.id}')">Remove</button>
                    </div>
                </div>
                
                <div class="visitor-section">
                    <strong>Log Expected Visitor</strong>
                    <div class="visitor-controls">
                        <input type="text" id="vis_name_${resident.id}" placeholder="Visitor Name">
                        <select id="vis_type_${resident.id}">
                            <option value="personal">Personal</option>
                            <option value="family">Family</option>
                            <option value="supplier">Supplier</option>
                            <option value="service">Service</option>
                            <option value="delivery">Delivery</option>
                            <option value="other">Other</option>
                        </select>
                        <button onclick="handleAddVisitor('${resident.id}')">Add</button>
                    </div>
                    <ul class="visitor-list">
                        ${visitorsHTML || '<li style="color: #64748b; font-style: italic;">No expected visitors logged.</li>'}
                    </ul>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
};

// BUG FIX #1: Move event listener INSIDE DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Form submission listener
    document.getElementById('residentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('resName').value;
        const domicile = document.getElementById('resDomicile').value;
        
        if (name && domicile) {
            App.createResident(name, domicile);
            e.target.reset(); 
        }
    });

    // BUG FIX #3: Sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'building_residents') {
            App.residents = DB.getResidents();
            App.render();
        }
    });
});

window.handleDeleteResident = (id) => {
    if(confirm('Are you sure you want to remove this resident?')) App.deleteResident(id);
};

// BUG FIX #4: Validate domicile is in DEPARTAMENTOS
window.handleEditResident = (id) => {
    const newName = prompt('Enter new Resident Name:');
    if (!newName) return; 
    
    const aptList = window.DEPARTAMENTOS.join(', ');
    const newDomicile = prompt(`Enter new Apartment\nValid options: ${aptList}`);
    
    if (newDomicile && window.DEPARTAMENTOS.includes(newDomicile)) {
        App.updateResident(id, newName, newDomicile);
    } else if (newDomicile) {
        alert('Invalid apartment. Please select from the list.');
    }
};

window.handleAddVisitor = (id) => {
    const nameInput = document.getElementById(`vis_name_${id}`);
    const typeInput = document.getElementById(`vis_type_${id}`);
    
    if(nameInput.value.trim() !== '') {
        App.addVisitor(id, nameInput.value.trim(), typeInput.value);
        nameInput.value = ''; 
    } else {
        alert("Please enter a visitor's name.");
    }
};
