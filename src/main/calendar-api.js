const { google } = require('googleapis');
const { getOAuth2Client } = require('./auth');

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuth2Client() });
}

function getTasks() {
  return google.tasks({ version: 'v1', auth: getOAuth2Client() });
}

async function getEvents() {
  const calendar = getCalendar();
  const now = new Date();
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
        type: 'event',
        calendarName: cal.summary,
      }));

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
    console.log('Birthdays calendar not available:', err.message);
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
      // Fetch non-completed tasks
      const res = await tasks.tasks.list({
        tasklist: list.id,
        showCompleted: false,
        showHidden: true,
        dueMin: now.toISOString(),
        dueMax: nextWeek.toISOString(),
        maxResults: 100,
      });

      const items = (res.data.items || [])
        .filter((t) => t.status !== 'completed' && t.due)
        .map((t) => ({
          id: t.id,
          taskListId: list.id,
          summary: t.title || '(No title)',
          start: t.due,
          allDay: true,
          type: 'task',
          calendarName: list.title,
          completed: false,
        }));

      console.log(`Task list "${list.title}": ${items.length} tasks`);
      allTasks.push(...items);
    } catch (err) {
      console.error(`Error fetching task list "${list.title}":`, err.message);
    }
  }

  allTasks.sort((a, b) => new Date(a.start) - new Date(b.start));

  return allTasks;
}

async function createEvent({ summary, startDateTime, endDateTime, allDay, date }) {
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

async function completeTask({ taskListId, taskId }) {
  const tasks = getTasks();
  await tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: { status: 'completed' },
  });
}

module.exports = { getEvents, getTaskItems, createEvent, createTask, completeTask };
