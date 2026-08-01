# Google Calendar Widget for Windows

A transparent, always-on-top desktop widget that displays your Google Calendar events. Drag it anywhere on your screen for quick access to your schedule.

![Widget Preview](docs/preview.png)

## Features

- Semi-transparent, draggable widget
- Upcoming events grouped by day (Today, Tomorrow, etc.)
- Quick event creation
- Auto-refresh every 5 minutes
- System tray with show/hide toggle
- Secure token storage using Windows DPAPI

## Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Google Calendar API**:
   - Go to **APIs & Services > Library**
   - Search for "Google Calendar API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Application type: **Desktop app**
   - Note down the **Client ID** and **Client Secret**
5. Configure the OAuth consent screen:
   - Go to **APIs & Services > OAuth consent screen**
   - Add your email as a test user (required while app is in "Testing" status)

### 2. Configure the Widget

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/google-calendar-widget-for-windows.git
   cd google-calendar-widget-for-windows
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### 3. Run

```bash
npm start
```

Click "Sign in with Google" in the widget, authorize in your browser, and your events will appear.

## Usage

- **Drag** the header area to move the widget
- **Refresh** button to manually reload events
- **Hide** button (or system tray click) to hide/show the widget
- **+ Add Event** to quickly create a new event
- **Right-click** the system tray icon for more options

## License

MIT
