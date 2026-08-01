const QuickAdd = {
  _currentType: 'event',
  _allDay: false,
  _visible: false,

  render(container) {
    const defaults = DateFormat.getDefaultDateTime();

    container.innerHTML = `
      <div class="quick-add-form" id="quick-add-form">
        <div class="quick-add-tabs">
          <button class="tab-btn active" data-type="event">Event</button>
          <button class="tab-btn" data-type="task">Task</button>
        </div>
        <input type="text" id="qa-title" placeholder="Title" autocomplete="off">
        <label class="allday-toggle">
          <input type="checkbox" id="qa-allday"> <span>All day</span>
        </label>
        <div class="quick-add-row" id="qa-datetime-row">
          <input type="datetime-local" id="qa-start" value="${defaults.start}">
          <input type="datetime-local" id="qa-end" value="${defaults.end}">
        </div>
        <div class="quick-add-row" id="qa-date-row" style="display:none">
          <input type="date" id="qa-date" value="${defaults.start.split('T')[0]}">
        </div>
        <div class="quick-add-actions">
          <button class="btn-cancel" id="qa-cancel">Cancel</button>
          <button class="btn-create" id="qa-create">Create</button>
        </div>
      </div>
    `;

    this._currentType = 'event';
    this._allDay = false;
    this._visible = false;

    const form = document.getElementById('quick-add-form');

    // Tab switching
    form.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        form.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._currentType = btn.dataset.type;
        this._updateDateFields();
      });
    });

    // All day toggle
    document.getElementById('qa-allday').addEventListener('change', (e) => {
      this._allDay = e.target.checked;
      this._updateDateFields();
    });

    document.getElementById('qa-cancel').addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('qa-create').addEventListener('click', () => this._create());
    document.getElementById('qa-title').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._create();
      if (e.key === 'Escape') this.hide();
    });
  },

  toggle() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  },

  show() {
    this._resetForm();
    document.getElementById('quick-add-form').classList.add('visible');
    document.getElementById('qa-title').focus();
    this._visible = true;
  },

  hide() {
    document.getElementById('quick-add-form').classList.remove('visible');
    this._visible = false;
  },

  _resetForm() {
    const d = DateFormat.getDefaultDateTime();
    document.getElementById('qa-start').value = d.start;
    document.getElementById('qa-end').value = d.end;
    document.getElementById('qa-date').value = d.start.split('T')[0];
    document.getElementById('qa-title').value = '';
    document.getElementById('qa-allday').checked = false;
    this._allDay = false;
    this._currentType = 'event';
    const form = document.getElementById('quick-add-form');
    form.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    form.querySelector('[data-type="event"]').classList.add('active');
    this._updateDateFields();
  },

  _updateDateFields() {
    const datetimeRow = document.getElementById('qa-datetime-row');
    const dateRow = document.getElementById('qa-date-row');

    if (this._currentType === 'task' || this._allDay) {
      datetimeRow.style.display = 'none';
      dateRow.style.display = '';
    } else {
      datetimeRow.style.display = '';
      dateRow.style.display = 'none';
    }
  },

  async _create() {
    const title = document.getElementById('qa-title').value.trim();
    if (!title) return;

    const btn = document.getElementById('qa-create');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    let result;

    if (this._currentType === 'task') {
      const dueDate = document.getElementById('qa-date').value;
      result = await window.calendarAPI.createTask({
        title,
        dueDate: dueDate || null,
      });
    } else if (this._allDay) {
      const date = document.getElementById('qa-date').value;
      result = await window.calendarAPI.createEvent({
        summary: title,
        allDay: true,
        date,
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
      this.hide();
      App.refreshEvents();
    }
  },
};
