export function generateWeatherAlerts(weatherData) {
  const alerts = [];

  if (!weatherData) return alerts;

  // 降雨機率提醒
  const rainProb = weatherData.forecast?.weatherElements?.PoP?.[0]?.value;
  if (rainProb >= 70) {
    alerts.push({
      type: 'umbrella',
      level: 'warning',
      icon: '☔',
      title: '記得帶傘',
      message: `降雨機率 ${rainProb}%，建議攜帶雨具`
    });
  } else if (rainProb >= 30) {
    alerts.push({
      type: 'umbrella',
      level: 'info',
      icon: '🌂',
      title: '可能會下雨',
      message: `降雨機率 ${rainProb}%，建議留意天氣變化`
    });
  }

  // 紫外線提醒
  const uvi = weatherData.H_UVI;
  if (uvi >= 11) {
    alerts.push({
      type: 'uv',
      level: 'danger',
      icon: '☀️',
      title: '紫外線危險',
      message: '紫外線指數極高，請做好防曬措施'
    });
  } else if (uvi >= 8) {
    alerts.push({
      type: 'uv',
      level: 'warning',
      icon: '🌞',
      title: '紫外線過量',
      message: '紫外線指數偏高，建議使用防曬用品'
    });
  } else if (uvi >= 5) {
    alerts.push({
      type: 'uv',
      level: 'info',
      icon: '😎',
      title: '適度防曬',
      message: '建議戴帽子或使用防曬乳'
    });
  }

  // 溫度提醒
  const temp = weatherData.Temp;
  if (temp >= 35) {
    alerts.push({
      type: 'temperature',
      level: 'danger',
      icon: '🌡️',
      title: '高溫危險',
      message: '請注意防暑、補充水分'
    });
  } else if (temp >= 32) {
    alerts.push({
      type: 'temperature',
      level: 'warning',
      icon: '♨️',
      title: '炎熱',
      message: '請適當補充水分'
    });
  } else if (temp <= 10) {
    alerts.push({
      type: 'temperature',
      level: 'warning',
      icon: '❄️',
      title: '低溫',
      message: '請注意保暖'
    });
  }

  // 空氣品質提醒
  const humid = weatherData.HUMD ? weatherData.HUMD * 100 : null;
  if (humid !== null) {
    if (humid > 80) {
      alerts.push({
        type: 'air',
        level: 'warning',
        icon: '💧',
        title: '潮濕',
        message: '空氣濕度過高，請注意通風'
      });
    } else if (humid < 40) {
      alerts.push({
        type: 'air',
        level: 'warning',
        icon: '🏜️',
        title: '乾燥',
        message: '空氣濕度偏低，請注意保濕'
      });
    }
  }

  // 特殊天氣警報
  if (weatherData.warnings?.length > 0) {
    weatherData.warnings.forEach(warning => {
      alerts.push({
        type: 'special',
        level: 'danger',
        icon: '⚠️',
        title: '特別警報',
        message: warning.text
      });
    });
  }

  // 時間相關提醒
  const now = new Date();
  const hours = now.getHours();
  if (hours >= 10 && hours <= 16 && uvi >= 5) {
    alerts.push({
      type: 'time',
      level: 'info',
      icon: '⏰',
      title: '戶外活動提醒',
      message: '現在是日照強烈時段，請注意防曬'
    });
  }

  return alerts;
}
