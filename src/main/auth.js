const { shell } = require('electron');
const { google } = require('googleapis');
const http = require('http');
const { saveTokens, loadTokens, clearTokens } = require('./token-store');

const REDIRECT_URI = 'http://localhost:8085';

let oauth2Client = null;

function getClientCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
  }
  return { clientId, clientSecret };
}

function getOAuth2Client() {
  if (oauth2Client) return oauth2Client;

  const { clientId, clientSecret } = getClientCredentials();
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  oauth2Client.on('tokens', (tokens) => {
    const existing = loadTokens() || {};
    saveTokens({ ...existing, ...tokens });
  });

  const tokens = loadTokens();
  if (tokens) {
    oauth2Client.setCredentials(tokens);
  }

  return oauth2Client;
}

function login() {
  return new Promise((resolve, reject) => {
    const client = getOAuth2Client();

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, REDIRECT_URI);
        const code = url.searchParams.get('code');

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h2>Error: No authorization code received.</h2></body></html>');
          return;
        }
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        saveTokens(tokens);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h2>Signed in successfully! You can close this tab.</h2></body></html>');

        server.close();
        resolve(true);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h2>Error: ${err.message}</h2></body></html>`);
        server.close();
        reject(err);
      }
    });

    server.listen(8085, 'localhost', () => {
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent',
        redirect_uri: REDIRECT_URI,
      });

      shell.openExternal(authUrl);
    });

    server.on('error', reject);

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out'));
    }, 120000);
  });
}

function logout() {
  clearTokens();
  if (oauth2Client) {
    oauth2Client.revokeCredentials().catch(() => {});
    oauth2Client = null;
  }
}

function isAuthenticated() {
  const tokens = loadTokens();
  return !!(tokens && tokens.access_token);
}

module.exports = { getOAuth2Client, login, logout, isAuthenticated };
