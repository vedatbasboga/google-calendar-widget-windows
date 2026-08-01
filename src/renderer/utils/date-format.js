const DateFormat = {
  formatHeaderDate(date) {
    return date.toLocaleDateString(i18n.getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  },

  getDayLabel(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (this._sameDay(date, today)) return i18n.t('today');
    if (this._sameDay(date, tomorrow)) return i18n.t('tomorrow');

    return date.toLocaleDateString(i18n.getDateLocale(), {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  },

  formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(i18n.getDateLocale(), {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  },

  getDayKey(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  getDefaultDateTime() {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const start = this._toLocalISO(now);
    const end = this._toLocalISO(new Date(now.getTime() + 60 * 60 * 1000));
    return { start, end };
  },

  _toLocalISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  },

  _sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  },
};
