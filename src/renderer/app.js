const App = {
  refreshTimer: null,

  async init() {
    Header.render(document.getElementById('header'));

    const { authenticated } = await window.calendarAPI.getAuthStatus();

    if (authenticated) {
      this.onAuthenticated();
    } else {
      this._showAuth();
    }

    // Listen for tray events
    if (window.electronAPI) {
      window.electronAPI.onRefresh(() => this.refreshEvents());
      window.electronAPI.onSignedOut(() => this._showAuth());
    }
  },

  async onAuthenticated() {
    document.getElementById('auth-prompt').innerHTML = '';
    QuickAdd.render(document.getElementById('quick-add'));
    await this.refreshEvents();
    this._startAutoRefresh();
  },

  async refreshEvents() {
    const container = document.getElementById('event-list');
    EventList.showLoading(container);

    const result = await window.calendarAPI.getEvents();

    if (result.success) {
      EventList.render(container, result.events);
    } else if (result.error === 'auth_required') {
      this._showAuth();
    } else {
      EventList.showError(container, result.error);
    }
  },

  _showAuth() {
    this._stopAutoRefresh();
    document.getElementById('event-list').innerHTML = '';
    document.getElementById('quick-add').innerHTML = '';
    AuthPrompt.render(document.getElementById('auth-prompt'));
  },

  _startAutoRefresh() {
    this._stopAutoRefresh();
    this.refreshTimer = setInterval(() => this.refreshEvents(), 5 * 60 * 1000);
  },

  _stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
