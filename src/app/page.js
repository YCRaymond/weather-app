'use client';

import { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import WeatherInfo from '../components/WeatherInfo';
import CalendarUpload from '../components/CalendarUpload';
import EventWeatherCard from '../components/EventWeatherCard';
import { getWeatherWarnings, getWeatherStationData, getUVIData, getWeatherForecast } from '../services/weatherAPI';
import { getLocationCoordinates } from '../services/geocodingAPI';

const DEFAULT_CITY = '臺北市';

export default function Home() {
  const [weatherData, setWeatherData] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (date = new Date(), location = null) => {
    try {
      setLoading(true);
      setError(null);

      const city = location?.city || DEFAULT_CITY;
      console.log('正在獲取天氣資料，城市:', city);

      // 獲取天氣資料，使用 Promise.allSettled 以處理部分失敗
      const results = await Promise.allSettled([
        getWeatherWarnings(),
        getWeatherStationData(city),
        getUVIData(city),
        getWeatherForecast(city)
      ]);

      // 記錄失敗的請求
      const failures = results
        .map((result, index) => ({ result, type: ['warnings', 'station', 'uvi', 'forecast'][index] }))
        .filter(({ result }) => result.status === 'rejected');

      if (failures.length > 0) {
        console.warn('部分資料獲取失敗:', failures);
      }

      // 解析成功的資料
      const [warnings, stationData, uviData, forecast] = results.map(result => 
        result.status === 'fulfilled' ? result.value : { records: [] }
      );

      console.log('API 回應:', { warnings, stationData, uviData, forecast });

      // 處理觀測站資料
      let stations = stationData?.records || [];
      
      // 合併紫外線資料
      if (uviData?.records?.length > 0) {
        stations = stations.map(station => {
          const uviStation = uviData.records.find(
            uvi => uvi.StationID === station.StationID
          );
          return {
            ...station,
            H_UVI: uviStation?.H_UVI
          };
        });
      }

      // 找出最近的觀測站
      let relevantStation = null;
      if (location && stations.length > 0) {
        relevantStation = stations.reduce((closest, station) => {
          if (!closest) return station;
          if (!station.LatWGS84 || !station.LonWGS84) return closest;

          const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            
            return R * c;
          };

          const currentDistance = getDistance(
            location.lat,
            location.lon,
            station.LatWGS84,
            station.LonWGS84
          );

          const closestDistance = getDistance(
            location.lat,
            location.lon,
            closest.LatWGS84,
            closest.LonWGS84
          );

          return currentDistance < closestDistance ? station : closest;
        }, null);
      } else if (stations.length > 0) {
        relevantStation = stations[0];
      }

      // 取得對應的預報資料
      const locationForecast = forecast?.records?.location?.find(
        loc => loc.LocationName === city
      );

      // 整理天氣資料
      const weatherInfo = [{
        ...(relevantStation || {}),
        forecast: locationForecast,
        warnings: warnings?.records || []
      }];

      console.log('整理後的天氣資料:', weatherInfo);
      setWeatherData(weatherInfo);

      // 通知使用者部分資料可能缺失
      if (failures.length > 0) {
        setError('部分天氣資料暫時無法取得，顯示可用的資訊');
      }

      return {
        station: relevantStation,
        forecast: locationForecast,
        warnings: warnings?.records || []
      };
    } catch (err) {
      console.error('獲取天氣資料時發生錯誤:', err);
      setError(err.message || '獲取天氣資料時發生錯誤，請稍後再試。');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEventsLoad = async (events) => {
    try {
      setCalendarEvents(events);
      
      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          if (!event.location) return event;

          const coordinates = await getLocationCoordinates(event.location);
          if (!coordinates) {
            console.warn(`無法獲取位置資訊: ${event.location}`);
            return event;
          }

          try {
            const weatherInfo = await fetchWeatherData(event.start, coordinates);
            return {
              ...event,
              weatherData: weatherInfo.station,
              weatherWarning: weatherInfo.warnings?.[0],
              weatherForecast: weatherInfo.forecast
            };
          } catch (error) {
            console.warn(`無法獲取天氣資料: ${event.location}`, error);
            return event;
          }
        })
      );

      setCalendarEvents(updatedEvents);
    } catch (error) {
      console.error('處理行事曆事件時發生錯誤:', error);
      setError('處理行事曆事件時發生錯誤，請稍後再試。');
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const defaultLocation = await getLocationCoordinates(DEFAULT_CITY);
        if (!defaultLocation) {
          throw new Error('無法獲取預設城市的位置資訊');
        }

        await fetchWeatherData(new Date(), defaultLocation);
      } catch (error) {
        console.error('初始化資料時發生錯誤:', error);
        setError(error.message || '無法載入天氣資料，請確認網路連線狀態。');
        setLoading(false);
      }
    };

    initData();
  }, []);

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">天氣行事曆</h1>
          <a
            href="/diagnostics"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            系統診斷
          </a>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">發生錯誤</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              <a href="/diagnostics" className="underline">進行系統診斷 ❯</a>
            </p>
          </div>
        )}

        <CalendarUpload onEventsLoad={handleEventsLoad} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Calendar 
                weatherData={weatherData} 
                calendarEvents={calendarEvents}
                onDateSelect={fetchWeatherData} 
              />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-4">行程天氣提醒</h2>
                {calendarEvents.map((event, index) => (
                  <EventWeatherCard key={index} event={event} />
                ))}
                {calendarEvents.length === 0 && (
                  <p className="text-gray-500 text-center">
                    請上傳 .ics 行事曆檔案以查看行程天氣提醒
                  </p>
                )}
              </div>
              <WeatherInfo weatherData={weatherData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
