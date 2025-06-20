import { generateWeatherAlerts } from '../utils/weatherAlerts';

const EventWeatherCard = ({ event }) => {
  if (!event) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('無效的日期');
      }
      return date.toLocaleString('zh-TW', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (error) {
      console.warn('日期格式錯誤:', error);
      return '時間未知';
    }
  };

  const getWeatherIcon = (weather, temp) => {
    if (!weather) {
      // 根據溫度判斷
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

  const getComfortLevel = (temp, humd) => {
    if (!temp || !humd) return null;
    
    const comfort = temp > 30 ? { text: '悶熱', color: 'text-red-600' } :
                   temp > 26 ? { text: '偏熱', color: 'text-orange-600' } :
                   temp < 16 ? { text: '寒冷', color: 'text-blue-600' } :
                   temp < 20 ? { text: '偏涼', color: 'text-cyan-600' } : 
                   { text: '舒適', color: 'text-green-600' };
    
    return {
      ...comfort,
      description: `溫度 ${temp}°C，濕度 ${(humd * 100).toFixed(0)}%`
    };
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
  const comfort = temp && event.weatherData ? 
    getComfortLevel(temp, event.weatherData.HUMD) : 
    null;
  const weather = event.weatherData?.Weather || 
                 event.weatherForecast?.weatherElements?.Wx?.[0]?.value;

  // 生成天氣提醒
  const alerts = generateWeatherAlerts({
    ...event.weatherData,
    forecast: event.weatherForecast,
    warnings: event.weatherWarning ? [event.weatherWarning] : []
  });

  const getAlertStyle = (level) => {
    switch (level) {
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800">{event.title || '未命名事件'}</h3>
          <p className="text-sm text-gray-600 mt-1">{formatDate(event.start)}</p>
          {event.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <span className="mr-1">📍</span> {event.location}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-2xl mb-1">
            {getWeatherIcon(weather, temp)}
          </div>
          {temp && (
            <div className="text-lg font-medium text-gray-700">
              {temp.toFixed(1)}°C
            </div>
          )}
        </div>
      </div>

      {/* 舒適度和提醒區域 */}
      <div className="mt-3 space-y-3">
        {comfort && (
          <p className={`text-sm ${comfort.color} font-medium`}>
            {comfort.text}・{comfort.description}
          </p>
        )}
        
        {/* 天氣提醒 */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`text-sm px-3 py-1 rounded-full inline-flex items-center ${getAlertStyle(alert.level)}`}
                title={alert.message}
              >
                <span className="mr-1">{alert.icon}</span>
                {alert.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventWeatherCard;
