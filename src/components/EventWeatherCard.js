import { generateWeatherAlerts } from '../utils/weatherAlerts';

const EventWeatherCard = ({ event }) => {
  if (!event) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('無效的日期');
      }
      
      // 返回更緊湊的日期格式
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isThisYear = date.getFullYear() === today.getFullYear();

      const time = date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (isToday) {
        return `今天 ${time}`;
      }
      
      if (isThisYear) {
        return date.toLocaleDateString('zh-TW', {
          month: 'short',
          day: 'numeric'
        }) + ` ${time}`;
      }
      
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) + ` ${time}`;
    } catch (error) {
      console.warn('日期格式錯誤:', error);
      return '時間未知';
    }
  };

  const getWeatherIcon = (weather, temp) => {
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

  const getTemperature = (weatherData, weatherForecast) => {
    if (weatherData?.Temp) {
      return parseFloat(weatherData.Temp);
    }
    
    if (weatherForecast?.weatherElements) {
      const maxT = weatherForecast.weatherElements.MaxT?.[0]?.value;
      const minT = weatherForecast.weatherElements.MinT?.[0]?.value;
      if (maxT && minT) {
        return (parseFloat(maxT) + parseFloat(minT)) / 2;
      }
    }

    return null;
  };

  const temp = getTemperature(event.weatherData, event.weatherForecast);
  const weather = event.weatherData?.Weather || 
                 event.weatherForecast?.weatherElements?.Wx?.[0]?.value;

  // 生成天氣提醒
  const alerts = generateWeatherAlerts({
    ...event.weatherData,
    forecast: event.weatherForecast,
    warnings: event.weatherWarning ? [event.weatherWarning] : []
  }).slice(0, 2); // 只顯示最重要的兩個提醒

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 animate-fadeIn">
      <div className="flex items-start space-x-3">
        {/* 日期和標題 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{event.title || '未命名事件'}</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(event.start)}
          </p>
          {event.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center truncate">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </p>
          )}
        </div>

        {/* 天氣圖示和溫度 */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl mb-1">
            {getWeatherIcon(weather, temp)}
          </div>
          {temp && (
            <div className="text-sm font-medium text-gray-700">
              {temp.toFixed(1)}°C
            </div>
          )}
        </div>
      </div>

      {/* 天氣提醒標籤 */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
          {alerts.map((alert, index) => (
            <span
              key={index}
              className={`inline-flex items-center text-xs px-2 py-1 rounded-full
                ${alert.level === 'danger' ? 'bg-red-100 text-red-800' :
                  alert.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'}`}
              title={alert.message}
            >
              <span className="mr-1">{alert.icon}</span>
              {alert.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventWeatherCard;
