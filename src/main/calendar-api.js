const { google } = require('googleapis');
const { getOAuth2Client } = require('./auth');

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuth2Client() });
}

async function getEvents() {
  const calendar = getCalendar();
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Get all visible calendars
  const calListRes = await calendar.calendarList.list();
  const calendars = calListRes.data.items || [];

  console.log('Found calendars:', calendars.map(c => `${c.summary} (${c.id})`));

  const allEvents = [];

  for (const cal of calendars) {
    try {
      const res = await calendar.events.list({
        calendarId: cal.id,
        timeMin: now.toISOString(),
        timeMax: nextWeek.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      const events = (res.data.items || []).map((event) => ({
        id: event.id,
        summary: event.summary || '(No title)',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        color: event.colorId || cal.colorId || null,
        htmlLink: event.htmlLink,
      }));

      console.log(`Calendar "${cal.summary}": ${events.length} events`);
      allEvents.push(...events);
    } catch (err) {
      console.error(`Error fetching calendar "${cal.summary}":`, err.message);
    }
  }

  // Sort by start time
  allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

  return allEvents;
}

async function createEvent({ summary, startDateTime, endDateTime }) {
  const calendar = getCalendar();

  const event = {
    summary,
    start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return res.data;
}

module.exports = { getEvents, createEvent };
