const EventList = {
  render(container, events, tasks) {
    container.innerHTML = '';

    const hasEvents = events && events.length > 0;
    const hasTasks = tasks && tasks.length > 0;

    if (!hasEvents && !hasTasks) {
      container.innerHTML = '<div class="empty-state">No upcoming events or tasks</div>';
      return;
    }

    // Group events by day
    if (hasEvents) {
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
    }

    // Show tasks in separate section
    if (hasTasks) {
      const taskSection = document.createElement('div');
      taskSection.className = 'day-group task-section';

      const label = document.createElement('div');
      label.className = 'day-label task-label';
      label.textContent = 'Tasks';
      taskSection.appendChild(label);

      for (const task of tasks) {
        taskSection.appendChild(EventItem.render(task));
      }

      container.appendChild(taskSection);
    }
  },

  showLoading(container) {
    container.innerHTML = '<div class="loading">Loading events...</div>';
  },

  showError(container, message) {
    container.innerHTML = `<div class="error-msg">${message}</div>`;
  },
};
