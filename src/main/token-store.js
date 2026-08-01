const { safeStorage } = require('electron');
const Store = require('electron-store');

const store = new Store();
const TOKEN_KEY = 'encrypted_tokens';

function saveTokens(tokens) {
  if (!safeStorage.isEncryptionAvailable()) {
    store.set(TOKEN_KEY, JSON.stringify(tokens));
    return;
  }
  const encrypted = safeStorage.encryptString(JSON.stringify(tokens));
  store.set(TOKEN_KEY, encrypted.toString('base64'));
}

function loadTokens() {
  const stored = store.get(TOKEN_KEY);
  if (!stored) return null;

  if (!safeStorage.isEncryptionAvailable()) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  try {
    const buffer = Buffer.from(stored, 'base64');
    const decrypted = safeStorage.decryptString(buffer);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

function clearTokens() {
  store.delete(TOKEN_KEY);
}

module.exports = { saveTokens, loadTokens, clearTokens };
