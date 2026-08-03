const Settings = {
  visible: false,

  render() {
    // Remove existing overlay if any
    const existing = document.getElementById('settings-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <span class="settings-title">${i18n.t('settings')}</span>
          <button class="header-btn" id="settings-close-btn" title="${i18n.t('close')}">&times;</button>
        </div>
        <div class="settings-body">
          <div class="settings-row">
            <label>${i18n.t('language')}</label>
            <select id="setting-language">
              <option value="en">${i18n.t('english')}</option>
              <option value="tr">${i18n.t('turkish')}</option>
            </select>
          </div>
          <div class="settings-row">
            <label>${i18n.t('opacity')}</label>
            <div class="slider-row">
              <input type="range" id="setting-opacity" min="50" max="100" step="1">
              <span id="setting-opacity-value"></span>
            </div>
          </div>
          <div class="settings-row">
            <label>${i18n.t('refreshInterval')}</label>
            <select id="setting-refresh">
              <option value="1">1 ${i18n.t('minutes')}</option>
              <option value="2">2 ${i18n.t('minutes')}</option>
              <option value="5">5 ${i18n.t('minutes')}</option>
              <option value="10">10 ${i18n.t('minutes')}</option>
              <option value="15">15 ${i18n.t('minutes')}</option>
            </select>
          </div>
          <div class="settings-row">
            <label>${i18n.t('theme')}</label>
            <div class="theme-toggle">
              <button class="theme-btn" data-theme="dark">${i18n.t('dark')}</button>
              <button class="theme-btn" data-theme="light">${i18n.t('light')}</button>
            </div>
          </div>
          <div class="settings-row">
            <button class="settings-folder-btn" id="setting-open-folder">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H13.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9z"/>
              </svg>
              ${i18n.t('openAppFolder')}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('widget').appendChild(overlay);
    this._bindEvents(overlay);
    this._loadCurrentSettings();
    this.visible = true;
  },

  async _loadCurrentSettings() {
    const settings = await window.calendarAPI.getSettings();

    document.getElementById('setting-language').value = settings.language || 'en';

    const opacitySlider = document.getElementById('setting-opacity');
    const opacityVal = Math.round((settings.opacity || 0.92) * 100);
    opacitySlider.value = opacityVal;
    document.getElementById('setting-opacity-value').textContent = opacityVal + '%';

    document.getElementById('setting-refresh').value = settings.refreshInterval || 5;

    const theme = settings.theme || 'dark';
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  },

  _bindEvents(overlay) {
    document.getElementById('settings-close-btn').addEventListener('click', () => {
      this.close();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.getElementById('setting-language').addEventListener('change', (e) => {
      this._saveSetting('language', e.target.value);
      i18n.setLocale(e.target.value);
      App.applyLanguage();
    });

    const opacitySlider = document.getElementById('setting-opacity');
    opacitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('setting-opacity-value').textContent = val + '%';
      App.applyOpacity(val / 100);
    });
    opacitySlider.addEventListener('change', (e) => {
      this._saveSetting('opacity', parseInt(e.target.value) / 100);
    });

    document.getElementById('setting-refresh').addEventListener('change', (e) => {
      this._saveSetting('refreshInterval', parseInt(e.target.value));
      App.applyRefreshInterval(parseInt(e.target.value));
    });

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._saveSetting('theme', btn.dataset.theme);
        App.applyTheme(btn.dataset.theme);
      });
    });

    document.getElementById('setting-open-folder').addEventListener('click', () => {
      window.calendarAPI.openAppFolder();
    });
  },

  async _saveSetting(key, value) {
    await window.calendarAPI.setSettings({ [key]: value });
  },

  close() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.remove();
    this.visible = false;
  },

  toggle() {
    if (this.visible) {
      this.close();
    } else {
      this.render();
    }
  },
};
