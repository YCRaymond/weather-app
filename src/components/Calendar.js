import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';

const Calendar = ({ weatherData = [], calendarEvents = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));

  const monthFormat = "yyyy年MM月";
  const dayFormat = "d";

  const getDayClassNames = (date) => {
    let classes = "p-2 text-center relative border";

    if (!isSameMonth(date, currentDate)) {
      classes += " text-gray-400 bg-gray-50";
    } else {
      classes += " bg-white";
    }

    if (isSameDay(date, new Date())) {
      classes += " font-bold text-blue-600";
    }

    return classes;
  };

  const getDayEvents = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    return [
      ...(weatherData || []).filter(event => {
        if (!event.ObsTime && !event.StartTime) return false;
        try {
          const eventDate = format(new Date(event.ObsTime || event.StartTime), 'yyyy-MM-dd');
          return eventDate === dateStr;
        } catch (error) {
          console.warn('無效的日期:', event.ObsTime || event.StartTime);
          return false;
        }
      }),
      ...(calendarEvents || []).filter(event => {
        if (!event.start) return false;
        try {
          const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
          return eventDate === dateStr;
        } catch (error) {
          console.warn('無效的行事曆日期:', event.start);
          return false;
        }
      })
    ];
  };

  const renderEvents = (events) => {
    if (!events.length) return null;

    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        {events.map((event, index) => (
          <span
            key={index}
            className="h-1 w-1 mx-0.5 rounded-full bg-blue-500"
            title={event.title || event.LocationName}
          />
        ))}
      </div>
    );
  };

  const weeks = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const currentDay = day;
      const events = getDayEvents(currentDay);
      days.push(
        <div
          key={day.toString()}
          className={getDayClassNames(day)}
          onClick={() => {
            if (isSameMonth(day, currentDate)) {
              onDateSelect?.(day);
            }
          }}
        >
          <span className="block mb-4">{format(day, dayFormat)}</span>
          {renderEvents(events)}
        </div>
      );
      day = addDays(day, 1);
    }
    weeks.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setCurrentDate(addDays(currentDate, -30))}
        >
          ❮
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, monthFormat)}
        </h2>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setCurrentDate(addDays(currentDate, 30))}
        >
          ❯
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="border rounded-lg overflow-hidden">
        {weeks}
      </div>
    </div>
  );
};

export default Calendar;
