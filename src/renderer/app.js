const App = {
  refreshTimer: null,
  settings: null,

  async init() {
    // Load settings first
    this.settings = await window.calendarAPI.getSettings();

    // Apply settings
    i18n.setLocale(this.settings.language || 'en');
    this.applyTheme(this.settings.theme || 'dark');
    this.applyOpacity(this.settings.opacity || 0.92);

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

    const [eventsResult, tasksResult] = await Promise.all([
      window.calendarAPI.getEvents(),
      window.calendarAPI.getTasks(),
    ]);

    if (eventsResult.error === 'auth_required') {
      this._showAuth();
      return;
    }

    const events = eventsResult.success ? eventsResult.events : [];
    const tasks = tasksResult.success ? tasksResult.tasks : [];

    if (!eventsResult.success && !tasksResult.success) {
      EventList.showError(container, eventsResult.error || tasksResult.error);
      return;
    }

    EventList.render(container, events, tasks);
  },

  _showAuth() {
    this._stopAutoRefresh();
    document.getElementById('event-list').innerHTML = '';
    document.getElementById('quick-add').innerHTML = '';
    AuthPrompt.render(document.getElementById('auth-prompt'));
  },

  _startAutoRefresh() {
    this._stopAutoRefresh();
    const interval = (this.settings?.refreshInterval || 5) * 60 * 1000;
    this.refreshTimer = setInterval(() => this.refreshEvents(), interval);
  },

  _stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  applyOpacity(opacity) {
    const widget = document.getElementById('widget');
    if (widget) {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        widget.style.background = `rgba(245, 245, 245, ${opacity})`;
      } else {
        widget.style.background = `rgba(10, 12, 22, ${opacity})`;
      }
    }
  },

  applyLanguage() {
    // Re-render header and quick-add with new locale
    Header.render(document.getElementById('header'));
    const quickAddContainer = document.getElementById('quick-add');
    if (quickAddContainer.children.length > 0) {
      QuickAdd.render(quickAddContainer);
    }
    // Re-render events to update day labels
    this.refreshEvents();
  },

  applyRefreshInterval(minutes) {
    if (this.settings) this.settings.refreshInterval = minutes;
    this._startAutoRefresh();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
