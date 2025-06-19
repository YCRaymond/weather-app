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

  // ... (保留原有的資料處理函數)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 頁面標題區 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient animate-fadeIn">
            天氣行事曆
          </h1>
          <a
            href="/diagnostics"
            className="icon-button group relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="tooltip bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              系統診斷
            </span>
          </a>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fadeIn">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <p className="mt-3">
                  <a href="/diagnostics" className="inline-flex items-center text-sm text-red-600 hover:text-red-500">
                    進行系統診斷
                    <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 檔案上傳區域 */}
        <div className="mb-8 hover-card bg-white rounded-xl p-6 animate-fadeIn">
          <CalendarUpload onEventsLoad={handleEventsLoad} />
        </div>

        {/* 主要內容區 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner h-12 w-12"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 行事曆區域 */}
            <div className="lg:col-span-2">
              <div className="hover-card">
                <Calendar 
                  weatherData={weatherData} 
                  calendarEvents={calendarEvents}
                  onDateSelect={fetchWeatherData} 
                />
              </div>
            </div>

            {/* 側邊資訊區 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 行程提醒卡片 */}
              <div className="hover-card bg-white rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  行程天氣提醒
                </h2>
                <div className="space-y-4">
                  {calendarEvents.map((event, index) => (
                    <EventWeatherCard key={index} event={event} />
                  ))}
                  {calendarEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      請上傳 .ics 行事曆檔案以查看行程天氣提醒
                    </p>
                  )}
                </div>
              </div>

              {/* 天氣資訊卡片 */}
              <WeatherInfo weatherData={weatherData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
