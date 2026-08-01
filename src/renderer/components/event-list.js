const EventList = {
  render(container, events) {
    container.innerHTML = '';

    if (!events || events.length === 0) {
      container.innerHTML = '<div class="empty-state">No upcoming events</div>';
      return;
    }

    // Group events by day
    const groups = {};
    for (const event of events) {
      const key = DateFormat.getDayKey(event.start);
      if (!groups[key]) {
        groups[key] = { label: DateFormat.getDayLabel(event.start), events: [] };
      }
      groups[key].events.push(event);
    }

    for (const key of Object.keys(groups).sort()) {
      const group = groups[key];
      const groupDiv = document.createElement('div');
      groupDiv.className = 'day-group';

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = group.label;
      groupDiv.appendChild(label);

      for (const event of group.events) {
        groupDiv.appendChild(EventItem.render(event));
      }

      container.appendChild(groupDiv);
    }
  },

  showLoading(container) {
    container.innerHTML = '<div class="loading">Loading events...</div>';
  },

  showError(container, message) {
    container.innerHTML = `<div class="error-msg">${message}</div>`;
  },
};
