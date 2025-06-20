import { useState } from 'react';
import { generateWeatherAlerts } from '../utils/weatherAlerts';

const WeatherAlerts = ({ weatherData }) => {
  const [showAll, setShowAll] = useState(false);
  const alerts = generateWeatherAlerts(weatherData);

  if (alerts.length === 0) {
    return null;
  }

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);
  const hasMore = alerts.length > 3;

  const getLevelStyles = (level) => {
    switch (level) {
      case 'danger':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  };

  // 計算通知權限狀態
  const [notificationStatus, setNotificationStatus] = useState('default');

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
        return;
      }

      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        // 顯示測試通知
        new Notification('天氣提醒已開啟', {
          body: '您將會收到重要的天氣提醒通知',
          icon: '/weather-icon.png'  // 請確保有此圖片
        });
      }
    } catch (error) {
      console.error('請求通知權限時發生錯誤:', error);
      setNotificationStatus('error');
    }
  };

  // 發送通知的函數
  const sendNotification = (alert) => {
    if (Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/weather-icon.png'
      });
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 通知權限按鈕 */}
      {notificationStatus !== 'granted' && notificationStatus !== 'unsupported' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>開啟天氣提醒通知</span>
        </button>
      )}

      {/* 提醒列表 */}
      <div className="space-y-3">
        {displayedAlerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 border-l-4 rounded-r-lg transition-all duration-200 hover:transform hover:-translate-y-1 ${getLevelStyles(alert.level)}`}
            onClick={() => sendNotification(alert)}
          >
            <div className="flex items-start">
              <div className="text-2xl mr-3">{alert.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium">{alert.title}</h3>
                <p className="text-sm mt-1 opacity-90">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 顯示更多按鈕 */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          {showAll ? '顯示較少' : `顯示全部 ${alerts.length} 個提醒`}
        </button>
      )}
    </div>
  );
};

export default WeatherAlerts;
