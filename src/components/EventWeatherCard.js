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

  const getWarnings = (weatherData, weatherWarning, weatherForecast) => {
    const warnings = [];

    // 檢查天氣警報
    if (weatherWarning?.Phenomena) {
      warnings.push({
        type: 'danger',
        message: weatherWarning.Phenomena,
        icon: '⚠️'
      });
    }

    // 檢查溫度
    const temp = getTemperature(weatherData, weatherForecast);
    if (temp > 36) {
      warnings.push({
        type: 'danger',
        message: '高溫警告',
        icon: '🌡️'
      });
    } else if (temp > 32) {
      warnings.push({
        type: 'warning',
        message: '炎熱',
        icon: '☀️'
      });
    }

    // 檢查降雨機率
    const pop = weatherForecast?.weatherElements?.PoP?.[0]?.value;
    if (pop && parseInt(pop) >= 70) {
      warnings.push({
        type: 'warning',
        message: `降雨機率 ${pop}%`,
        icon: '🌧️'
      });
    }

    // 檢查紫外線
    const uvi = weatherData?.H_UVI;
    if (uvi >= 11) {
      warnings.push({
        type: 'danger',
        message: '紫外線危險',
        icon: '☀️'
      });
    } else if (uvi >= 8) {
      warnings.push({
        type: 'warning',
        message: '紫外線過量',
        icon: '☀️'
      });
    }

    return warnings;
  };

  const temp = getTemperature(event.weatherData, event.weatherForecast);
  const comfort = temp && event.weatherData ? 
    getComfortLevel(temp, event.weatherData.HUMD) : 
    null;
  const warnings = getWarnings(event.weatherData, event.weatherWarning, event.weatherForecast);
  const weather = event.weatherData?.Weather || 
                 event.weatherForecast?.weatherElements?.Wx?.[0]?.value;

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

      {(comfort || warnings.length > 0) && (
        <div className="mt-3">
          {comfort && (
            <p className={`text-sm ${comfort.color} font-medium`}>
              {comfort.text}・{comfort.description}
            </p>
          )}
          
          {warnings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`text-sm px-3 py-1 rounded-full inline-flex items-center ${
                    warning.type === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <span className="mr-1">{warning.icon}</span>
                  {warning.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventWeatherCard;
