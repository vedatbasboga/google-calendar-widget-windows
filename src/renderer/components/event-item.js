const EventItem = {
  render(event) {
    const div = document.createElement('div');
    div.className = 'event-item';

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

  _escape(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  },
};
