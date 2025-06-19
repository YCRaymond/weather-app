const WeatherInfo = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-4">天氣資訊</h2>
        <p className="text-gray-500 text-center">暫無天氣資料</p>
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold mb-4">天氣資訊</h2>
      
      <div className="space-y-4">
        {/* 基本天氣資訊 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{data.LocationName || '觀測站'}</p>
            <p className="text-2xl font-bold">{getWeatherDescription()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{getTemperatureRange()}</p>
            <p className="text-sm text-gray-500">降雨機率：{getRainProbability()}</p>
          </div>
        </div>

        {/* 詳細資訊 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">體感</p>
            <p>{getComfortLevel()}</p>
          </div>
          <div>
            <p className="text-gray-500">濕度</p>
            <p>{data.HUMD ? `${(data.HUMD * 100).toFixed(0)}%` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">風速</p>
            <p>{data.WDSD ? `${data.WDSD}m/s` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">空氣</p>
            <p>{getAirQualityLevel() || 'N/A'}</p>
          </div>
        </div>

        {/* 警報資訊 */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 font-medium">天氣警報</p>
              {data.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-700 mt-1">
                  {warning.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 觀測時間 */}
        <div className="text-xs text-gray-400 mt-4">
          觀測時間：{data.ObsTime ? formatDateTime(data.ObsTime) : '更新中'}
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
