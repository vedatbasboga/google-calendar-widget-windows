const Header = {
  render(container) {
    container.innerHTML = `
      <span class="header-date">${DateFormat.formatHeaderDate(new Date())}</span>
      <button class="header-btn" id="refresh-btn" title="Refresh">&#x21bb;</button>
      <button class="header-btn" id="minimize-btn" title="Hide">&minus;</button>
    `;

    document.getElementById('refresh-btn').addEventListener('click', () => {
      App.refreshEvents();
    });

    document.getElementById('minimize-btn').addEventListener('click', () => {
      window.calendarAPI.minimizeWindow();
    });
  },
};
