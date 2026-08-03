const AuthPrompt = {
  render(container, errorMsg) {
    container.innerHTML = `
      <div class="auth-container">
        <h2>${i18n.t('signInTitle')}</h2>
        <p>${i18n.t('signInDesc')}</p>
        ${errorMsg ? `<div class="auth-error">${errorMsg}</div>` : ''}
        <button class="auth-btn" id="sign-in-btn">${i18n.t('signIn')}</button>
        <button class="setup-info-btn" id="setup-info-btn" title="${i18n.t('setupGuide')}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
            <path d="M8 6.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 6.5zM8 4.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
          </svg>
          ${i18n.t('howToSetUp')}
        </button>
      </div>
    `;

    document.getElementById('sign-in-btn').addEventListener('click', async (e) => {
      const btn = e.target;
      btn.disabled = true;
      btn.textContent = i18n.t('loading');

      // Hide error if visible
      const errEl = container.querySelector('.auth-error');
      if (errEl) errEl.remove();

      const result = await window.calendarAPI.login();

      if (result.success) {
        App.onAuthenticated();
      } else {
        // Re-render with error message
        this.render(container, i18n.t('authError'));
      }
    });

    document.getElementById('setup-info-btn').addEventListener('click', () => {
      this._showSetupGuide();
    });
  },

  _showSetupGuide() {
    const existing = document.getElementById('setup-guide-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'setup-guide-overlay';
    overlay.innerHTML = `
      <div class="setup-guide-panel">
        <div class="setup-guide-header">
          <span class="settings-title">${i18n.t('setupGuide')}</span>
          <button class="header-btn" id="setup-guide-close">&times;</button>
        </div>
        <div class="setup-guide-body">
          <div class="setup-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step1Title')}</div>
              <div class="step-desc">${i18n.t('step1Desc')}</div>
            </div>
          </div>
          <div class="setup-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step2Title')}</div>
              <div class="step-desc">${i18n.t('step2Desc')}</div>
            </div>
          </div>
          <div class="setup-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step3Title')}</div>
              <div class="step-desc">${i18n.t('step3Desc')}</div>
            </div>
          </div>
          <div class="setup-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step4Title')}</div>
              <div class="step-desc">${i18n.t('step4Desc')}</div>
            </div>
          </div>
          <div class="setup-step">
            <div class="step-number">5</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step5Title')}</div>
              <div class="step-desc">${i18n.t('step5Desc')}</div>
              <button class="step-open-folder-btn" id="step-open-folder-btn">${i18n.t('step5BtnOpenFolder')}</button>
            </div>
          </div>
          <div class="setup-step">
            <div class="step-number">6</div>
            <div class="step-content">
              <div class="step-title">${i18n.t('step6Title')}</div>
              <div class="step-desc">${i18n.t('step6Desc')}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('widget').appendChild(overlay);

    document.getElementById('setup-guide-close').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById('link-console').addEventListener('click', () => {
      window.open('https://console.cloud.google.com/', '_blank');
    });

    document.getElementById('step-open-folder-btn').addEventListener('click', () => {
      window.calendarAPI.openAppFolder();
    });
  },

  hide(container) {
    container.innerHTML = '';
  },
};
