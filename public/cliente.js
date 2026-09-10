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

        const name = document.createElement('h3');
        name.textContent = resident.name;

        const domicile = document.createElement('span');
        domicile.textContent = resident.domicile;

        card.append(name, domicile);
        residentsList.appendChild(card);
    });
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
