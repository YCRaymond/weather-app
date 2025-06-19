const WeatherInfo = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="weather-card animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">天氣資訊</h2>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>暫無天氣資料</p>
        </div>
      </div>
    );
  }

  const data = weatherData[0];
  const forecast = data.forecast?.weatherElements || {};

  // 解析天氣預報
  const getWeatherDescription = () => {
    const wx = forecast.Wx?.[0];
    return wx ? wx.value : data.Weather || '晴時多雲';
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

  const getTemperatureRange = () => {
    const minT = forecast.MinT?.[0];
    const maxT = forecast.MaxT?.[0];
    if (minT && maxT) {
      return `${minT.value}°C - ${maxT.value}°C`;
    }
    return data.Temp ? `${data.Temp}°C` : 'N/A';
  };

  const getRainProbability = () => {
    const pop = forecast.PoP?.[0];
    return pop ? `${pop.value}%` : 'N/A';
  };

  const getComfortLevel = () => {
    const ci = forecast.CI?.[0];
    return ci ? ci.value : (
      data.Temp > 30 ? '悶熱' :
      data.Temp > 26 ? '偏熱' :
      data.Temp < 16 ? '寒冷' :
      data.Temp < 20 ? '偏涼' : '舒適'
    );
  };

  const getComfortColor = (level) => {
    const colors = {
      '悶熱': 'text-red-600',
      '偏熱': 'text-orange-600',
      '舒適': 'text-green-600',
      '偏涼': 'text-cyan-600',
      '寒冷': 'text-blue-600'
    };
    return colors[level] || 'text-gray-600';
  };

  // 計算空氣品質指數
  const getAirQualityLevel = () => {
    if (!data.HUMD) return null;
    const humd = data.HUMD * 100;
    return humd > 80 ? '潮濕' :
           humd > 60 ? '舒適' :
           humd > 40 ? '適中' : '乾燥';
  };

  const formatDateTime = (dateTimeStr) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        throw new Error('無效的日期');
      }
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('日期格式錯誤:', error);
      return '更新中';
    }
  };

  const weather = getWeatherDescription();
  const comfort = getComfortLevel();
  const comfortColor = getComfortColor(comfort);

  return (
    <div className="weather-card animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        天氣資訊
      </h2>
      
      <div className="space-y-6">
        {/* 基本天氣資訊 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg group hover:bg-blue-100 transition-colors duration-200">
          <div>
            <p className="text-sm text-blue-600 mb-1">{data.LocationName || '觀測站'}</p>
            <div className="flex items-center">
              <span className="text-4xl mr-3">
                {getWeatherIcon(weather, data.Temp)}
              </span>
              <p className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                {weather}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
              {getTemperatureRange()}
            </p>
            <p className="text-sm text-blue-600">
              降雨機率：{getRainProbability()}
            </p>
          </div>
        </div>

        {/* 詳細資訊 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <p className="text-gray-500 text-sm mb-1">體感</p>
            <p className={`font-medium ${comfortColor}`}>{comfort}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <p className="text-gray-500 text-sm mb-1">濕度</p>
            <p className="font-medium">
              {data.HUMD ? `${(data.HUMD * 100).toFixed(0)}%` : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <p className="text-gray-500 text-sm mb-1">風速</p>
            <p className="font-medium">
              {data.WDSD ? `${data.WDSD}m/s` : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <p className="text-gray-500 text-sm mb-1">空氣</p>
            <p className="font-medium">{getAirQualityLevel() || 'N/A'}</p>
          </div>
        </div>

        {/* 警報資訊 */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="animate-fadeIn">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800 flex items-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                天氣警報
              </p>
              {data.warnings.map((warning, index) => (
                <p key={index} className="mt-2 text-sm text-yellow-700">
                  {warning.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 觀測時間 */}
        <div className="text-xs text-gray-400 flex items-center justify-end">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {data.ObsTime ? formatDateTime(data.ObsTime) : '更新中'}
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
