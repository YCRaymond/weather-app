export function parseICSFile(icsContent) {
  const lines = icsContent.split('\n');
  const events = [];
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const [key, ...values] = line.split(':');
      const value = values.join(':');

      switch (key) {
        case 'SUMMARY':
          currentEvent.title = value;
          break;
        case 'DTSTART':
          currentEvent.start = parseICSDate(value);
          break;
        case 'DTEND':
          currentEvent.end = parseICSDate(value);
          break;
        case 'LOCATION':
          currentEvent.location = value;
          break;
      }
    }
  }

  return events;
}

function parseICSDate(dateStr) {
  // 處理帶有時區信息的日期
  if (dateStr.includes('T')) {
    // 如果是 UTC 時間
    if (dateStr.endsWith('Z')) {
      const year = parseInt(dateStr.slice(0, 4));
      const month = parseInt(dateStr.slice(4, 6)) - 1;
      const day = parseInt(dateStr.slice(6, 8));
      const hour = parseInt(dateStr.slice(9, 11));
      const minute = parseInt(dateStr.slice(11, 13));
      const second = parseInt(dateStr.slice(13, 15));
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    // 如果是本地時間
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const hour = parseInt(dateStr.slice(9, 11));
    const minute = parseInt(dateStr.slice(11, 13));
    const second = parseInt(dateStr.slice(13, 15) || '00');
    return new Date(year, month, day, hour, minute, second);
  }

  // 只有日期沒有時間的情況
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  return new Date(year, month, day);
}
