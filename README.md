# Google Calendar Widget for Windows

A transparent, always-on-top desktop widget that displays your Google Calendar events and tasks. Drag it anywhere on your screen for quick access to your schedule.

## Features

- Semi-transparent, draggable widget with dark theme
- Events and tasks from all your calendars (including birthdays)
- Grouped by day (Today, Tomorrow, etc.) with events and tasks together
- Quick creation of both events and tasks with Event/Task toggle
- All-day event support
- Complete tasks directly from the widget
- Auto-refresh every 5 minutes
- System tray with show/hide toggle
- Secure token storage using Windows DPAPI
- Remembers widget position on screen

## Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs (**APIs & Services > Library**):
   - **Google Calendar API**
   - **Google Tasks API**
4. Configure the OAuth consent screen:
   - Go to **APIs & Services > OAuth consent screen**
   - Select **External** user type
   - Fill in the app name and your email
   - Add your email as a **test user** (required while app is in "Testing" status)
5. Create OAuth 2.0 credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - Add `http://localhost:8085` to **Authorized redirect URIs**
   - Note down the **Client ID** and **Client Secret**

### 2. Configure the Widget

1. Clone this repository:
   ```bash
   git clone https://github.com/vedatbasboga/google-calendar-widget-windows.git
   cd google-calendar-widget-windows
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

Click "Sign in with Google" in the widget, authorize in your browser, and your events and tasks will appear.

## Usage

- **Drag** the header area to move the widget
- **+** button to add a new event or task
- **Refresh** button to manually reload
- **Hide** button (or system tray click) to hide/show the widget
- **Checkbox** on tasks to mark them as complete
- **Click** an event to open it in Google Calendar
- **Right-click** the system tray icon for more options (Show/Hide, Refresh, Sign Out, Quit)

## License

MIT
