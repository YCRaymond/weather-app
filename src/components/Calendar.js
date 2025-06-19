import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

const Calendar = ({ weatherData = [], calendarEvents = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));

  const monthFormat = "yyyy年MM月";
  const dayFormat = "d";

  const getDayClassNames = (date) => {
    let classes = `
      relative p-2 text-center transition-all duration-200 
      border hover:border-blue-300 group cursor-pointer
    `;

    if (!isSameMonth(date, currentDate)) {
      classes += ' text-gray-400 bg-gray-50/50';
    } else if (selectedDate && isSameDay(date, selectedDate)) {
      classes += ' bg-blue-50 border-blue-300 font-semibold';
    } else {
      classes += ' bg-white hover:bg-blue-50/50';
    }

    if (isToday(date)) {
      classes += ' font-bold ring-2 ring-blue-500 ring-offset-2';
    }

    return classes;
  };

  const getDayWeatherIcon = (weather, temp) => {
    if (!weather) {
      if (!temp) return '🌤️';
      if (temp >= 30) return '🌞';
      if (temp <= 15) return '❄️';
      return '🌤️';
    }
    if (weather.includes('雨')) return '🌧️';
    if (weather.includes('雷')) return '⛈️';
    if (weather.includes('陰')) return '☁️';
    if (weather.includes('晴')) return '☀️';
    return '⛅';
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
          <div
            key={index}
            className="group relative"
          >
            <span
              className="h-2 w-2 mx-0.5 rounded-full bg-blue-500 inline-block
                       hover:bg-blue-600 transition-colors duration-200"
            />
            <div className="tooltip">
              {event.title || event.LocationName}
            </div>
          </div>
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
      const temp = events[0]?.Temp;
      const weather = events[0]?.Weather;

      days.push(
        <div
          key={day.toString()}
          className={getDayClassNames(day)}
          onClick={() => {
            if (isSameMonth(day, currentDate)) {
              setSelectedDate(day);
              onDateSelect?.(day);
            }
          }}
        >
          <span className="block mb-4 group-hover:text-blue-600 transition-colors duration-200">
            {format(day, dayFormat)}
          </span>

          {/* 天氣圖示 */}
          {events.length > 0 && (
            <div className="absolute top-2 right-2 text-sm">
              {getDayWeatherIcon(weather, temp)}
            </div>
          )}

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
    <div className="bg-white rounded-xl shadow-sm p-6 hover-card">
      <div className="flex justify-between items-center mb-6">
        <button
          className="icon-button group relative"
          onClick={() => setCurrentDate(addDays(currentDate, -30))}
        >
          <svg className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="tooltip">上個月</span>
        </button>

        <h2 className="text-xl font-bold text-gradient">
          {format(currentDate, monthFormat)}
        </h2>

        <button
          className="icon-button group relative"
          onClick={() => setCurrentDate(addDays(currentDate, 30))}
        >
          <svg className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="tooltip">下個月</span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden animate-fadeIn">
        {weeks}
      </div>
    </div>
  );
};

export default Calendar;
