const EventItem = {
  render(event) {
    const div = document.createElement('div');
    div.className = 'event-item';

    if (event.type === 'task') {
      return this._renderTask(div, event);
    }

    if (event.type === 'birthday') {
      return this._renderBirthday(div, event);
    }

    return this._renderEvent(div, event);
  },

  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  _renderEvent(div, event) {
    if (event.passed) div.classList.add('event-passed');

    const dotClass = event.allDay ? 'outline' : 'filled';
    const timeText = event.allDay ? 'All day' : DateFormat.formatTime(event.start) + '–' + DateFormat.formatTime(event.end);

    if (event.color) {
      div.style.background = this._hexToRgba(event.color, 0.25);
    }

    const dotStyle = event.color ? ` style="background:${event.color};border-color:${event.color}"` : '';

    div.innerHTML = `
      <div class="event-dot ${dotClass}"${dotStyle}></div>
      <div class="event-info">
        <div class="event-time">${timeText}</div>
        <div class="event-title">${this._escape(event.summary)}</div>
      </div>
    `;

    div.addEventListener('click', () => EventEdit.open(event));

    return div;
  },

  _renderBirthday(div, event) {
    div.innerHTML = `
      <div class="event-dot birthday"></div>
      <div class="event-info">
        <div class="event-time">Birthday</div>
        <div class="event-title">${this._escape(event.summary)}</div>
      </div>
    `;
    return div;
  },

  _renderTask(div, event) {
    div.className = 'event-item task-item';
    if (event.completed) div.classList.add('task-completed');

    div.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${event.completed ? 'checked disabled' : ''} title="Complete task">
      <div class="event-info">
        <div class="event-title">${this._escape(event.summary)}</div>
      </div>
    `;

    div.querySelector('.event-info').addEventListener('click', () => EventEdit.open(event));

    if (!event.completed) {
      const checkbox = div.querySelector('.task-checkbox');
      checkbox.addEventListener('click', async (e) => {
        e.stopPropagation();
        checkbox.disabled = true;
        div.classList.add('task-completed');
        await window.calendarAPI.completeTask({
          taskListId: event.taskListId,
          taskId: event.id,
        });
        setTimeout(() => App.refreshEvents(), 300);
      });
    }

    return div;
  },

  _escape(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  },
};
