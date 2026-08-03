const EventEdit = {
  _event: null,
  _selectedColor: null,

  _eventColors: [
    { id: '1', hex: '#7986cb', label: 'Lavender' },
    { id: '2', hex: '#33b679', label: 'Sage' },
    { id: '3', hex: '#8e24aa', label: 'Grape' },
    { id: '4', hex: '#e67c73', label: 'Flamingo' },
    { id: '5', hex: '#f6bf26', label: 'Banana' },
    { id: '6', hex: '#f4511e', label: 'Tangerine' },
    { id: '7', hex: '#039be5', label: 'Peacock' },
    { id: '9', hex: '#3f51b5', label: 'Blueberry' },
    { id: '10', hex: '#0b8043', label: 'Basil' },
    { id: '11', hex: '#d50000', label: 'Tomato' },
  ],

  open(event) {
    if (event.type === 'birthday') return;

    this._event = event;
    this._selectedColor = null;

    const overlay = document.getElementById('event-edit-overlay');
    overlay.style.display = 'flex';

    if (event.type === 'task') {
      this._renderTaskForm(overlay);
    } else {
      this._renderEventForm(overlay);
    }
  },

  close() {
    const overlay = document.getElementById('event-edit-overlay');
    overlay.style.display = 'none';
    overlay.innerHTML = '';
    this._event = null;
  },

  _renderEventForm(overlay) {
    const ev = this._event;
    const allDay = ev.allDay;

    let startVal = '';
    let endVal = '';
    let dateVal = '';

    if (allDay) {
      dateVal = ev.start;
    } else {
      startVal = this._toLocalDatetime(ev.start);
      endVal = this._toLocalDatetime(ev.end);
    }

    overlay.innerHTML = `
      <div class="event-edit-panel">
        <div class="event-edit-header">
          <span class="event-edit-title">Edit Event</span>
          <button class="event-edit-close" id="ee-close">&#x2715;</button>
        </div>
        <div class="event-edit-body">
          <input type="text" id="ee-title" value="${this._escapeAttr(ev.summary)}" placeholder="Title" autocomplete="off">
          <label class="allday-toggle">
            <input type="checkbox" id="ee-allday" ${allDay ? 'checked' : ''}> <span>All day</span>
          </label>
          <div class="quick-add-row" id="ee-datetime-row" style="${allDay ? 'display:none' : ''}">
            <input type="datetime-local" id="ee-start" value="${startVal}">
            <input type="datetime-local" id="ee-end" value="${endVal}">
          </div>
          <div class="quick-add-row" id="ee-date-row" style="${allDay ? '' : 'display:none'}">
            <input type="date" id="ee-date" value="${dateVal}">
          </div>
          <div class="color-picker-row" id="ee-color-row">
            ${this._eventColors.map(c => `<button class="color-dot${this._isCurrentColor(c.hex) ? ' selected' : ''}" data-color-id="${c.id}" style="background:${c.hex}" title="${c.label}"></button>`).join('')}
          </div>
          <div class="event-edit-actions">
            <button class="btn-delete" id="ee-delete">Delete</button>
            <button class="btn-save" id="ee-save">Save</button>
          </div>
        </div>
      </div>
    `;

    // Set initial selected color
    const matchedColor = this._eventColors.find(c => this._isCurrentColor(c.hex));
    if (matchedColor) this._selectedColor = matchedColor.id;

    this._bindCommon(overlay);
    this._bindEventHandlers(overlay);
  },

  _renderTaskForm(overlay) {
    const ev = this._event;
    const dateVal = ev.start ? ev.start.split('T')[0] : '';

    overlay.innerHTML = `
      <div class="event-edit-panel">
        <div class="event-edit-header">
          <span class="event-edit-title">Edit Task</span>
          <button class="event-edit-close" id="ee-close">&#x2715;</button>
        </div>
        <div class="event-edit-body">
          <input type="text" id="ee-title" value="${this._escapeAttr(ev.summary)}" placeholder="Title" autocomplete="off">
          <div class="quick-add-row">
            <input type="date" id="ee-date" value="${dateVal}">
          </div>
          <div class="event-edit-actions">
            <button class="btn-delete" id="ee-delete">Delete</button>
            <button class="btn-save" id="ee-save">Save</button>
          </div>
        </div>
      </div>
    `;

    this._bindCommon(overlay);
    this._bindTaskHandlers();
  },

  _bindCommon(overlay) {
    document.getElementById('ee-close').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    document.getElementById('ee-title').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  _bindEventHandlers(overlay) {
    // All-day toggle
    document.getElementById('ee-allday').addEventListener('change', (e) => {
      const allDay = e.target.checked;
      document.getElementById('ee-datetime-row').style.display = allDay ? 'none' : '';
      document.getElementById('ee-date-row').style.display = allDay ? '' : 'none';

      if (allDay && !document.getElementById('ee-date').value) {
        const startVal = document.getElementById('ee-start').value;
        if (startVal) document.getElementById('ee-date').value = startVal.split('T')[0];
      }
    });

    // Color picker
    overlay.querySelectorAll('.color-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        overlay.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('selected'));
        if (this._selectedColor === dot.dataset.colorId) {
          this._selectedColor = null;
        } else {
          dot.classList.add('selected');
          this._selectedColor = dot.dataset.colorId;
        }
      });
    });

    // Save
    document.getElementById('ee-save').addEventListener('click', () => this._saveEvent());

    // Delete
    document.getElementById('ee-delete').addEventListener('click', () => this._deleteEvent());
  },

  _bindTaskHandlers() {
    document.getElementById('ee-save').addEventListener('click', () => this._saveTask());
    document.getElementById('ee-delete').addEventListener('click', () => this._deleteTask());
  },

  async _saveEvent() {
    const title = document.getElementById('ee-title').value.trim();
    if (!title) return;

    const btn = document.getElementById('ee-save');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const allDay = document.getElementById('ee-allday').checked;
    const data = { eventId: this._event.id, summary: title };

    if (allDay) {
      data.allDay = true;
      data.date = document.getElementById('ee-date').value;
    } else {
      const start = document.getElementById('ee-start').value;
      const end = document.getElementById('ee-end').value;
      data.startDateTime = new Date(start).toISOString();
      data.endDateTime = new Date(end).toISOString();
    }

    if (this._selectedColor) data.colorId = this._selectedColor;

    const result = await window.calendarAPI.updateEvent(data);

    btn.disabled = false;
    btn.textContent = 'Save';

    if (result.success) {
      this.close();
      App.refreshEvents();
    }
  },

  async _saveTask() {
    // Tasks API doesn't support patch via our simple API, so we just close for now
    // Task editing would require a more complex API
    this.close();
  },

  async _deleteEvent() {
    const btn = document.getElementById('ee-delete');
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    const result = await window.calendarAPI.deleteEvent({ eventId: this._event.id });

    btn.disabled = false;
    btn.textContent = 'Delete';

    if (result.success) {
      this.close();
      App.refreshEvents();
    }
  },

  async _deleteTask() {
    const btn = document.getElementById('ee-delete');
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    const result = await window.calendarAPI.deleteTask({
      taskListId: this._event.taskListId,
      taskId: this._event.id,
    });

    btn.disabled = false;
    btn.textContent = 'Delete';

    if (result.success) {
      this.close();
      App.refreshEvents();
    }
  },

  _toLocalDatetime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  _isCurrentColor(hex) {
    return this._event && this._event.color && this._event.color.toLowerCase() === hex.toLowerCase();
  },

  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};
