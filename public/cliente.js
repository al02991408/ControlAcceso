const DEPARTAMENTOS = [
    'Apt 1A',
    'Apt 1B',
    'Apt 2A',
    'Apt 2B',
    'Apt 3A',
    'Apt 3B',
    'Apt 4A',
    'Apt 4B'
];

const VISITOR_TYPES = [
    { value: 'personal', label: 'Personal' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'proveedor', label: 'Proveedor' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'repartidor', label: 'Repartidor' },
    { value: 'otro', label: 'Otro' }
];

const form = document.getElementById('residentForm');
const nameInput = document.getElementById('resName');
const domicileInput = document.getElementById('resDomicile');
const residentsList = document.getElementById('residentsList');
const residentCount = document.getElementById('residentCount');
const formMessage = document.getElementById('formMessage');

function populateApartments() {
    DEPARTAMENTOS.forEach((department) => {
        const option = document.createElement('option');
        option.value = department;
        option.textContent = department;
        domicileInput.appendChild(option);
    });
}

function renderResidents(residents) {
    residentsList.innerHTML = '';
    residentCount.textContent = `(${residents.length})`;

    if (residents.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No hay residentes registrados.';
        residentsList.appendChild(emptyMessage);
        return;
    }

    residents.forEach((resident) => {
        const card = document.createElement('article');
        card.className = 'resident-card';

        const header = document.createElement('div');
        header.className = 'resident-header';

        const details = document.createElement('div');
        const name = document.createElement('h3');
        name.textContent = resident.name;
        name.style.margin = '0';
        const domicile = document.createElement('span');
        domicile.textContent = resident.domicile;
        domicile.style.color = '#64748b';
        details.append(name, domicile);

        const actions = document.createElement('div');
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => editResident(resident));
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => deleteResident(resident.id));
        actions.append(editButton, deleteButton);
        header.append(details, actions);

        const visitorSection = document.createElement('div');
        visitorSection.className = 'visitor-section';
        visitorSection.innerHTML = '<strong>Visitantes</strong>';

        const visitorForm = document.createElement('div');
        visitorForm.className = 'visitor-form';
        const visitorName = document.createElement('input');
        visitorName.placeholder = 'Nombre del visitante';
        const visitorType = document.createElement('select');
        VISITOR_TYPES.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            visitorType.appendChild(option);
        });
        const visitorButton = document.createElement('button');
        visitorButton.textContent = 'Agregar';
        visitorButton.addEventListener('click', () => addVisitor(resident.id, visitorName, visitorType));
        visitorForm.append(visitorName, visitorType, visitorButton);

        const visitorList = document.createElement('ul');
        visitorList.className = 'visitor-list';
        const visitors = Array.isArray(resident.visitors) ? resident.visitors : [];
        if (visitors.length === 0) {
            visitorList.innerHTML = '<li class="visitor-empty">No hay visitantes esperados</li>';
        } else {
            visitors.forEach(visitor => {
                const item = document.createElement('li');
                item.textContent = `${visitor.name} (${visitor.type}) - ${visitor.date}`;
                visitorList.appendChild(item);
            });
        }

        visitorSection.append(visitorForm, visitorList);
        card.append(header, visitorSection);
        residentsList.appendChild(card);
    });
}

async function sendRequest(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No fue posible completar la operación.');
    return result;
}

async function editResident(resident) {
    const name = prompt('Nuevo nombre:', resident.name);
    const domicile = prompt('Nuevo departamento:', resident.domicile);
    if (name === null || domicile === null) return;

    try {
        await sendRequest(`/api/residentes/${resident.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, domicile })
        });
        await loadResidents();
    } catch (error) {
        formMessage.textContent = error.message;
    }
}

async function deleteResident(id) {
    if (!confirm('¿Eliminar este residente?')) return;

    try {
        await sendRequest(`/api/residentes/${id}`, { method: 'DELETE' });
        await loadResidents();
    } catch (error) {
        formMessage.textContent = error.message;
    }
}

async function addVisitor(id, visitorName, visitorType) {
    if (!visitorName.value.trim()) {
        formMessage.textContent = 'El nombre del visitante es obligatorio.';
        return;
    }

    try {
        await sendRequest(`/api/residentes/${id}/visitantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: visitorName.value, type: visitorType.value })
        });
        visitorName.value = '';
        await loadResidents();
    } catch (error) {
        formMessage.textContent = error.message;
    }
}

async function loadResidents() {
    try {
        const response = await fetch('/api/residentes');
        if (!response.ok) throw new Error('No fue posible consultar los residentes.');

        const residents = await response.json();
        renderResidents(residents);
    } catch (error) {
        formMessage.textContent = error.message;
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '';

    try {
        const response = await fetch('/api/residentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput.value,
                domicile: domicileInput.value
            })
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error);

        form.reset();
        formMessage.textContent = 'Residente creado correctamente.';
        await loadResidents();
    } catch (error) {
        formMessage.textContent = error.message;
    }
});

populateApartments();
loadResidents();
