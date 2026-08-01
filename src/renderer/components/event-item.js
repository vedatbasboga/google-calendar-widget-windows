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

  _renderEvent(div, event) {
    const dotClass = event.allDay ? 'outline' : 'filled';
    const timeText = event.allDay ? 'All day' : DateFormat.formatTime(event.start);
    const colorAttr = event.color ? ` data-color="${event.color}"` : '';

    div.innerHTML = `
      <div class="event-dot ${dotClass}"${colorAttr}></div>
      <div class="event-info">
        <div class="event-time">${timeText}</div>
        <div class="event-title">${this._escape(event.summary)}</div>
      </div>
    `;

    if (event.htmlLink) {
      div.addEventListener('click', () => {
        window.open(event.htmlLink, '_blank');
      });
    }

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

    const timeText = event.start ? DateFormat.formatTime(event.start) : 'No date';

    div.innerHTML = `
      <input type="checkbox" class="task-checkbox" title="Complete task">
      <div class="event-info">
        <div class="event-time">${timeText}</div>
        <div class="event-title">${this._escape(event.summary)}</div>
      </div>
    `;

    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('click', async (e) => {
      e.stopPropagation();
      checkbox.disabled = true;
      div.classList.add('task-completing');
      await window.calendarAPI.completeTask({
        taskListId: event.taskListId,
        taskId: event.id,
      });
      setTimeout(() => App.refreshEvents(), 300);
    });

    return div;
  },

  _escape(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  },
};
