const { google } = require('googleapis');
const { getOAuth2Client } = require('./auth');

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuth2Client() });
}

const EVENT_COLORS = {
  '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
};

const CALENDAR_COLORS = {
  '1': '#ac725e', '2': '#d06b64', '3': '#f83a22', '4': '#fa573c',
  '5': '#ff7537', '6': '#ffad46', '7': '#42d692', '8': '#16a765',
  '9': '#7bd148', '10': '#b3dc6c', '11': '#fbe983', '12': '#fad165',
  '13': '#92e1c0', '14': '#9fe1e7', '15': '#9fc6e7', '16': '#4986e7',
  '17': '#9a9cff', '18': '#b99aff', '19': '#c2c2c2', '20': '#cabdbf',
  '21': '#cca6ac', '22': '#f691b2', '23': '#cd74e6', '24': '#a47ae2',
};

function resolveColor(eventColorId, calColorId) {
  if (eventColorId && EVENT_COLORS[eventColorId]) return EVENT_COLORS[eventColorId];
  if (calColorId && CALENDAR_COLORS[calColorId]) return CALENDAR_COLORS[calColorId];
  return null;
}

function getTasks() {
  return google.tasks({ version: 'v1', auth: getOAuth2Client() });
}

async function getEvents() {
  const calendar = getCalendar();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Get all visible calendars
  const calListRes = await calendar.calendarList.list();
  const calendars = calListRes.data.items || [];

  const allEvents = [];

  for (const cal of calendars) {
    try {
      const res = await calendar.events.list({
        calendarId: cal.id,
        timeMin: todayStart.toISOString(),
        timeMax: nextWeek.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      const events = (res.data.items || []).map((event) => {
        const end = event.end.dateTime || event.end.date;
        return {
          id: event.id,
          summary: event.summary || '(No title)',
          start: event.start.dateTime || event.start.date,
          end,
          allDay: !event.start.dateTime,
          color: resolveColor(event.colorId, cal.colorId),
          htmlLink: event.htmlLink,
          type: 'event',
          calendarName: cal.summary,
          passed: new Date(end) < now,
        };
      });

      allEvents.push(...events);
    } catch (err) {
      console.error(`Error fetching calendar "${cal.summary}":`, err.message);
    }
  }

  // Fetch birthdays from contacts calendar
  try {
    const birthdayCalId = 'addressbook#contacts@group.v.calendar.google.com';
    const res = await calendar.events.list({
      calendarId: birthdayCalId,
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const birthdays = (res.data.items || []).map((event) => ({
      id: event.id,
      summary: event.summary || '(No title)',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      allDay: true,
      color: null,
      htmlLink: event.htmlLink,
      type: 'birthday',
      calendarName: 'Birthdays',
    }));

    allEvents.push(...birthdays);
  } catch (err) {
    // Birthdays calendar may not exist
  }

  // Sort by start time
  allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

  return allEvents;
}

async function getTaskItems() {
  const tasks = getTasks();
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Get all task lists
  const taskListsRes = await tasks.tasklists.list({ maxResults: 100 });
  const taskLists = taskListsRes.data.items || [];

  const allTasks = [];

  for (const list of taskLists) {
    try {
      const res = await tasks.tasks.list({
        tasklist: list.id,
        showCompleted: true,
        showHidden: true,
        dueMin: now.toISOString(),
        dueMax: nextWeek.toISOString(),
        maxResults: 100,
      });

      const items = (res.data.items || [])
        .filter((t) => t.due)
        .map((t) => ({
          id: t.id,
          taskListId: list.id,
          summary: t.title || '(No title)',
          start: t.due,
          allDay: true,
          type: 'task',
          calendarName: list.title,
          completed: t.status === 'completed',
        }));

      allTasks.push(...items);
    } catch (err) {
      console.error(`Error fetching task list "${list.title}":`, err.message);
    }
  }

  allTasks.sort((a, b) => new Date(a.start) - new Date(b.start));

  return allTasks;
}

async function createEvent({ summary, startDateTime, endDateTime, allDay, date, colorId }) {
  const calendar = getCalendar();

  let event;
  if (allDay && date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = nextDay.toISOString().split('T')[0];
    event = {
      summary,
      start: { date },
      end: { date: endDate },
    };
  } else {
    event = {
      summary,
      start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };
  }

  if (colorId) event.colorId = colorId;

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return res.data;
}

async function createTask({ title, dueDate, taskListId }) {
  const tasks = getTasks();

  // Use first task list if not specified
  if (!taskListId) {
    const taskListsRes = await tasks.tasklists.list({ maxResults: 1 });
    const lists = taskListsRes.data.items || [];
    if (lists.length === 0) throw new Error('No task lists found');
    taskListId = lists[0].id;
  }

  const task = { title };
  if (dueDate) {
    task.due = new Date(dueDate).toISOString();
  }

  const res = await tasks.tasks.insert({
    tasklist: taskListId,
    requestBody: task,
  });

  return res.data;
}

async function updateEvent({ eventId, summary, startDateTime, endDateTime, allDay, date, colorId }) {
  const calendar = getCalendar();

  const requestBody = {};
  if (summary !== undefined) requestBody.summary = summary;
  if (colorId !== undefined) requestBody.colorId = colorId;

  if (allDay && date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    requestBody.start = { date };
    requestBody.end = { date: nextDay.toISOString().split('T')[0] };
  } else if (startDateTime && endDateTime) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    requestBody.start = { dateTime: startDateTime, timeZone: tz };
    requestBody.end = { dateTime: endDateTime, timeZone: tz };
  }

  const res = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody,
  });

  return res.data;
}

async function deleteEvent({ eventId }) {
  const calendar = getCalendar();
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}

async function deleteTask({ taskListId, taskId }) {
  const tasks = getTasks();
  await tasks.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  });
}

async function completeTask({ taskListId, taskId }) {
  const tasks = getTasks();
  await tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: { status: 'completed' },
  });
}

module.exports = { getEvents, getTaskItems, createEvent, createTask, updateEvent, deleteEvent, deleteTask, completeTask };
