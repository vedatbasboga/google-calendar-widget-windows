const QuickAdd = {
  render(container) {
    const defaults = DateFormat.getDefaultDateTime();

    container.innerHTML = `
      <button class="quick-add-toggle" id="quick-add-toggle">+ Add Event</button>
      <div class="quick-add-form" id="quick-add-form">
        <input type="text" id="qa-title" placeholder="Event title" autocomplete="off">
        <div class="quick-add-row">
          <input type="datetime-local" id="qa-start" value="${defaults.start}">
          <input type="datetime-local" id="qa-end" value="${defaults.end}">
        </div>
        <div class="quick-add-actions">
          <button class="btn-cancel" id="qa-cancel">Cancel</button>
          <button class="btn-create" id="qa-create">Create</button>
        </div>
      </div>
    `;

    const toggle = document.getElementById('quick-add-toggle');
    const form = document.getElementById('quick-add-form');

    toggle.addEventListener('click', () => {
      toggle.style.display = 'none';
      form.classList.add('visible');
      // Reset defaults
      const d = DateFormat.getDefaultDateTime();
      document.getElementById('qa-start').value = d.start;
      document.getElementById('qa-end').value = d.end;
      document.getElementById('qa-title').value = '';
      document.getElementById('qa-title').focus();
    });

    document.getElementById('qa-cancel').addEventListener('click', () => {
      form.classList.remove('visible');
      toggle.style.display = '';
    });

    document.getElementById('qa-create').addEventListener('click', () => this._create());
    document.getElementById('qa-title').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._create();
      if (e.key === 'Escape') {
        form.classList.remove('visible');
        toggle.style.display = '';
      }
    });
  },

  async _create() {
    const title = document.getElementById('qa-title').value.trim();
    const start = document.getElementById('qa-start').value;
    const end = document.getElementById('qa-end').value;

    if (!title) return;

    const btn = document.getElementById('qa-create');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    const result = await window.calendarAPI.createEvent({
      summary: title,
      startDateTime: new Date(start).toISOString(),
      endDateTime: new Date(end).toISOString(),
    });

    btn.disabled = false;
    btn.textContent = 'Create';

    if (result.success) {
      document.getElementById('quick-add-form').classList.remove('visible');
      document.getElementById('quick-add-toggle').style.display = '';
      App.refreshEvents();
    }
  },
};
