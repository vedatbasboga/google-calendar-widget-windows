const QuickAdd = {
  render(container) {
    const defaults = DateFormat.getDefaultDateTime();

    container.innerHTML = `
      <button class="quick-add-toggle" id="quick-add-toggle">+ Add Event or Task</button>
      <div class="quick-add-form" id="quick-add-form">
        <div class="quick-add-tabs">
          <button class="tab-btn active" data-type="event">Event</button>
          <button class="tab-btn" data-type="task">Task</button>
        </div>
        <input type="text" id="qa-title" placeholder="Title" autocomplete="off">
        <div class="quick-add-row" id="qa-datetime-row">
          <input type="datetime-local" id="qa-start" value="${defaults.start}">
          <input type="datetime-local" id="qa-end" value="${defaults.end}">
        </div>
        <div class="quick-add-row" id="qa-date-row" style="display:none">
          <input type="date" id="qa-due" value="${defaults.start.split('T')[0]}">
        </div>
        <div class="quick-add-actions">
          <button class="btn-cancel" id="qa-cancel">Cancel</button>
          <button class="btn-create" id="qa-create">Create</button>
        </div>
      </div>
    `;

    this._currentType = 'event';

    const toggle = document.getElementById('quick-add-toggle');
    const form = document.getElementById('quick-add-form');

    toggle.addEventListener('click', () => {
      toggle.style.display = 'none';
      form.classList.add('visible');
      const d = DateFormat.getDefaultDateTime();
      document.getElementById('qa-start').value = d.start;
      document.getElementById('qa-end').value = d.end;
      document.getElementById('qa-due').value = d.start.split('T')[0];
      document.getElementById('qa-title').value = '';
      document.getElementById('qa-title').focus();
    });

    // Tab switching
    form.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        form.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._currentType = btn.dataset.type;

        const datetimeRow = document.getElementById('qa-datetime-row');
        const dateRow = document.getElementById('qa-date-row');

        if (this._currentType === 'task') {
          datetimeRow.style.display = 'none';
          dateRow.style.display = '';
        } else {
          datetimeRow.style.display = '';
          dateRow.style.display = 'none';
        }
      });
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
    if (!title) return;

    const btn = document.getElementById('qa-create');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    let result;

    if (this._currentType === 'task') {
      const dueDate = document.getElementById('qa-due').value;
      result = await window.calendarAPI.createTask({
        title,
        dueDate: dueDate || null,
      });
    } else {
      const start = document.getElementById('qa-start').value;
      const end = document.getElementById('qa-end').value;
      result = await window.calendarAPI.createEvent({
        summary: title,
        startDateTime: new Date(start).toISOString(),
        endDateTime: new Date(end).toISOString(),
      });
    }

    btn.disabled = false;
    btn.textContent = 'Create';

    if (result.success) {
      document.getElementById('quick-add-form').classList.remove('visible');
      document.getElementById('quick-add-toggle').style.display = '';
      App.refreshEvents();
    }
  },
};
