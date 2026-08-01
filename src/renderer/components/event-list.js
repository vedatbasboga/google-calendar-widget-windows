const EventList = {
  render(container, events, tasks) {
    container.innerHTML = '';

    // Merge events and tasks into one list
    const allItems = [...(events || [])];

    // Add tasks — those with due dates go into their day, those without go at the end
    const tasksWithDate = [];
    const tasksNoDate = [];
    for (const task of (tasks || [])) {
      if (task.start) {
        tasksWithDate.push(task);
      } else {
        tasksNoDate.push(task);
      }
    }

    allItems.push(...tasksWithDate);

    if (allItems.length === 0 && tasksNoDate.length === 0) {
      container.innerHTML = '<div class="empty-state">No upcoming events or tasks</div>';
      return;
    }

    // Group all items by day
    const groups = {};
    for (const item of allItems) {
      const key = DateFormat.getDayKey(item.start);
      if (!groups[key]) {
        groups[key] = { label: DateFormat.getDayLabel(item.start), items: [] };
      }
      groups[key].items.push(item);
    }

    // Sort items within each day: all-day/tasks first, then by time
    for (const key of Object.keys(groups)) {
      groups[key].items.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return new Date(a.start) - new Date(b.start);
      });
    }

    for (const key of Object.keys(groups).sort()) {
      const group = groups[key];
      const groupDiv = document.createElement('div');
      groupDiv.className = 'day-group';

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = group.label;
      groupDiv.appendChild(label);

      for (const item of group.items) {
        groupDiv.appendChild(EventItem.render(item));
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
