// Minimal, safer, and more maintainable version of the original app.js
// - No inline event handlers
// - No innerHTML with user-supplied data (avoids XSS)
// - Uses crypto.randomUUID() with fallback for ids
// - LocalStorage wrapped in try/catch
// - Event delegation for resident / visitor actions
// - Small helper decomposition

(() => {
  // --- Utilities ---
  const uid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );

  const safeParse = (str, fallback) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  const nowString = () => new Date().toLocaleString();

  // --- Storage ---
  const Storage = {
    key: 'building_residents',
    load() {
      try {
        return safeParse(localStorage.getItem(this.key), []);
      } catch (err) {
        console.error('Failed to load residents:', err);
        return [];
      }
    },
    save(data) {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save residents:', err);
      }
    }
  };

  // --- App State & Methods ---
  const App = {
    residents: Storage.load(),

    createResident(name, domicile) {
      name = (name || '').trim();
      domicile = (domicile || '').trim();
      if (!name) return { ok: false, error: 'Name is required' };

      const newResident = {
        id: uid(),
        name,
        domicile,
        visitors: []
      };

      this.residents.push(newResident);
      Storage.save(this.residents);
      this.render();
      return { ok: true, resident: newResident };
    },

    deleteResident(id) {
      this.residents = this.residents.filter(r => r.id !== id);
      Storage.save(this.residents);
      this.render();
    },

    updateResident(id, newName, newDomicile) {
      const resident = this.residents.find(r => r.id === id);
      if (!resident) return;
      resident.name = (newName || resident.name).trim();
      resident.domicile = (newDomicile || resident.domicile).trim();
      Storage.save(this.residents);
      this.render();
    },

    addVisitor(residentId, visitorName) {
      const resident = this.residents.find(r => r.id === residentId);
      if (!resident) return { ok: false, error: 'Resident not found' };

      visitorName = (visitorName || '').trim();
      if (!visitorName) return { ok: false, error: 'Visitor name required' };

      resident.visitors.push({
        id: uid(),
        name: visitorName,
        date: nowString()
      });

      Storage.save(this.residents);
      this.render();
      return { ok: true };
    },

    updateVisitor(residentId, visitorId, newName) {
      const resident = this.residents.find(r => r.id === residentId);
      if (!resident) return;
      const visitor = resident.visitors.find(v => v.id === visitorId);
      if (!visitor) return;
      visitor.name = (newName || visitor.name).trim();
      Storage.save(this.residents);
      this.render();
    },

    deleteVisitor(residentId, visitorId) {
      const resident = this.residents.find(r => r.id === residentId);
      if (!resident) return;
      resident.visitors = resident.visitors.filter(v => v.id !== visitorId);
      Storage.save(this.residents);
      this.render();
    },

    // --- Rendering helpers ---
    createResidentCard(resident) {
      const card = document.createElement('div');
      card.className = 'resident-card';
      card.dataset.residentId = resident.id;

      // Header
      const header = document.createElement('div');
      header.className = 'resident-header';

      const info = document.createElement('div');
      const title = document.createElement('h3');
      title.style.margin = '0';
      title.textContent = resident.name;
      const dom = document.createElement('span');
      dom.style.color = '#64748b';
      dom.textContent = resident.domicile || '';

      info.appendChild(title);
      info.appendChild(dom);

      const actions = document.createElement('div');
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.dataset.action = 'edit-resident';
      editBtn.dataset.id = resident.id;
      editBtn.textContent = 'Editar';

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.dataset.action = 'delete-resident';
      delBtn.dataset.id = resident.id;
      delBtn.textContent = 'Eliminar';

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      header.appendChild(info);
      header.appendChild(actions);

      // Visitor section
      const visitorSection = document.createElement('div');
      visitorSection.className = 'visitor-section';

      const visTitle = document.createElement('strong');
      visTitle.textContent = 'Visitors';

      const addRow = document.createElement('div');
      addRow.style.display = 'flex';
      addRow.style.gap = '5px';
      addRow.style.marginTop = '5px';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Nuevo Visitante Nombre';
      input.className = 'visitor-input';
      input.dataset.residentId = resident.id;
      input.id = `vis_${resident.id}`;
      input.setAttribute('aria-label', `Nuevo visitante para ${resident.name}`);

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.dataset.action = 'add-visitor';
      addBtn.dataset.id = resident.id;
      addBtn.textContent = 'Add';

      addRow.appendChild(input);
      addRow.appendChild(addBtn);

      const ul = document.createElement('ul');
      ul.className = 'visitor-list';

      if (resident.visitors.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No expected visitors';
        ul.appendChild(li);
      } else {
        resident.visitors.forEach(v => {
          const li = document.createElement('li');

          const nameEl = document.createElement('strong');
          nameEl.textContent = v.name;

          const dateSpan = document.createElement('span');
          dateSpan.style.color = '#64748b';
          dateSpan.style.marginLeft = '8px';
          dateSpan.textContent = `(Expected: ${v.date})`;

          const editVBtn = document.createElement('button');
          editVBtn.type = 'button';
          editVBtn.textContent = 'Editar';
          editVBtn.style.marginLeft = '10px';
          editVBtn.dataset.action = 'edit-visitor';
          editVBtn.dataset.residentId = resident.id;
          editVBtn.dataset.visitorId = v.id;

          const delVBtn = document.createElement('button');
          delVBtn.type = 'button';
          delVBtn.className = 'delete-btn';
          delVBtn.textContent = 'Eliminar';
          delVBtn.style.marginLeft = '6px';
          delVBtn.dataset.action = 'delete-visitor';
          delVBtn.dataset.residentId = resident.id;
          delVBtn.dataset.visitorId = v.id;

          li.appendChild(nameEl);
          li.appendChild(dateSpan);
          li.appendChild(editVBtn);
          li.appendChild(delVBtn);

          ul.appendChild(li);
        });
      }

      visitorSection.appendChild(visTitle);
      visitorSection.appendChild(addRow);
      visitorSection.appendChild(ul);

      card.appendChild(header);
      card.appendChild(visitorSection);

      return card;
    },

    render() {
      const listContainer = document.getElementById('residentsList');
      const countEl = document.getElementById('residentCount');

      if (!listContainer || !countEl) return;

      countEl.innerText = `(${this.residents.length})`;

      // Clear and re-build using DocumentFragment
      listContainer.innerHTML = '';
      const frag = document.createDocumentFragment();

      this.residents.forEach(resident => {
        frag.appendChild(this.createResidentCard(resident));
      });

      listContainer.appendChild(frag);
    }
  };

  // --- DOM Wiring ---
  function onResidentFormSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('resName');
    const domicileInput = document.getElementById('resDomicile');
    if (!nameInput) return;

    const name = (nameInput.value || '').trim();
    const domicile = (domicileInput && domicileInput.value) ? domicileInput.value.trim() : '';

    if (!name) {
      alert('El nombre del residente es requerido.');
      return;
    }

    App.createResident(name, domicile);
    e.target.reset();
    nameInput.focus();
  }

  function handleListClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;

    if (!action) return;

    switch (action) {
      case 'delete-resident': {
        const id = btn.dataset.id;
        if (confirm('¿Eliminar este residente?')) {
          App.deleteResident(id);
        }
        break;
      }
      case 'edit-resident': {
        const id = btn.dataset.id;
        const resident = App.residents.find(r => r.id === id);
        if (!resident) return;
        const newName = prompt('Nuevo Nombre:', resident.name);
        const newDomicile = prompt('Nuevo Domicilio (Apt):', resident.domicile);
        if (newName && newDomicile) {
          App.updateResident(id, newName.trim(), newDomicile.trim());
        }
        break;
      }
      case 'add-visitor': {
        const residentId = btn.dataset.id;
        const input = document.querySelector(`input.visitor-input[data-resident-id="${residentId}"]`);
        if (!input) return;
        const name = (input.value || '').trim();
        if (!name) {
          alert('Nombre del visitante requerido.');
          return;
        }
        App.addVisitor(residentId, name);
        input.value = '';
        input.focus();
        break;
      }
      case 'edit-visitor': {
        const residentId = btn.dataset.residentId;
        const visitorId = btn.dataset.visitorId;
        const resident = App.residents.find(r => r.id === residentId);
        if (!resident) return;
        const visitor = resident.visitors.find(v => v.id === visitorId);
        if (!visitor) return;
        const newName = prompt('Nuevo nombre del visitante:', visitor.name);
        if (newName && newName.trim() !== '') {
          App.updateVisitor(residentId, visitorId, newName.trim());
        }
        break;
      }
      case 'delete-visitor': {
        const residentId = btn.dataset.residentId;
        const visitorId = btn.dataset.visitorId;
        if (confirm('¿Eliminar este visitante?')) {
          App.deleteVisitor(residentId, visitorId);
        }
        break;
      }
      default:
        break;
    }
  }

  // Attach handlers safely
  const form = document.getElementById('residentForm');
  if (form) form.addEventListener('submit', onResidentFormSubmit);

  const listContainer = document.getElementById('residentsList');
  if (listContainer) listContainer.addEventListener('click', handleListClick);

  // Initial render
  App.render();

  // Expose App to window in development for debugging only (optional)
  if (window.location.search.includes('dev')) {
    window._App = App;
  }
})();
