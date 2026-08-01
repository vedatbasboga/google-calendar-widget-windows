const AuthPrompt = {
  render(container) {
    container.innerHTML = `
      <div class="auth-container">
        <h2>Calendar Widget</h2>
        <p>Sign in with your Google account to see your upcoming events.</p>
        <button class="auth-btn" id="sign-in-btn">Sign in with Google</button>
      </div>
    `;

    document.getElementById('sign-in-btn').addEventListener('click', async (e) => {
      const btn = e.target;
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      const result = await window.calendarAPI.login();

      if (result.success) {
        App.onAuthenticated();
      } else {
        btn.disabled = false;
        btn.textContent = 'Sign in with Google';
      }
    });
  },

  hide(container) {
    container.innerHTML = '';
  },
};
