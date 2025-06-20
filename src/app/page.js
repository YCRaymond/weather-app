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
  // ... (保持現有的 state 和函數不變)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 頁面頂部裝飾 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />

      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 頁面標題區 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient animate-fadeIn mb-2">
                天氣行事曆
              </h1>
              <p className="text-gray-600 text-sm">
                即時天氣資訊與行程提醒
              </p>
            </div>
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

          {/* 主要內容區 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側區域：天氣資訊與提醒 */}
            <div className="lg:col-span-1 space-y-6">
              <WeatherInfo weatherData={weatherData} />
              {/* 行程提醒卡片 */}
              {calendarEvents.length > 0 && (
                <div className="weather-card">
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
                  </div>
                </div>
              )}
            </div>

            {/* 右側區域：行事曆與上傳 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 錯誤提示 */}
              {error && (
                <div className="glass-effect rounded-lg p-4 border-l-4 border-red-500 animate-fadeIn">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 行事曆 */}
              <div className="weather-card">
                <Calendar 
                  weatherData={weatherData} 
                  calendarEvents={calendarEvents}
                  onDateSelect={fetchWeatherData} 
                />
              </div>

              {/* 上傳區域 */}
              <div className="weather-card">
                <CalendarUpload onEventsLoad={handleEventsLoad} />
              </div>
            </div>
          </div>
        </div>

        {/* 頁面底部裝飾 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/50 to-transparent pointer-events-none" />
      </main>

      {/* 載入狀態 */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="loading-spinner"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
