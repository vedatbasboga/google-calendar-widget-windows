const Header = {
  render(container) {
    container.innerHTML = `
      <span class="header-date">${DateFormat.formatHeaderDate(new Date())}</span>
      <button class="header-btn" id="add-btn" title="${i18n.t('add')}">+</button>
      <button class="header-btn" id="settings-btn" title="${i18n.t('settings')}">&#x2699;</button>
      <button class="header-btn" id="refresh-btn" title="${i18n.t('refresh')}">&#x21bb;</button>
      <button class="header-btn" id="minimize-btn" title="${i18n.t('hide')}">&minus;</button>
    `;

    document.getElementById('add-btn').addEventListener('click', () => {
      QuickAdd.toggle();
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
      Settings.toggle();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
      App.refreshEvents();
    });

    document.getElementById('minimize-btn').addEventListener('click', () => {
      window.calendarAPI.minimizeWindow();
    });
  },
};
