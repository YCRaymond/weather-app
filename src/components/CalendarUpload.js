import { useState } from 'react';

const CalendarUpload = ({ onEventsLoad }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const parseICSFile = (fileContent) => {
    try {
      const lines = fileContent.split(/\r\n|\n|\r/);
      const events = [];
      let currentEvent = null;

      lines.forEach(line => {
        const [key, ...values] = line.split(':');
        const value = values.join(':');

        switch (key) {
          case 'BEGIN':
            if (value === 'VEVENT') {
              currentEvent = {};
            }
            break;
          case 'END':
            if (value === 'VEVENT' && currentEvent) {
              events.push(currentEvent);
              currentEvent = null;
            }
            break;
          case 'SUMMARY':
            if (currentEvent) {
              currentEvent.title = value;
            }
            break;
          case 'DESCRIPTION':
            if (currentEvent) {
              currentEvent.description = value;
            }
            break;
          case 'LOCATION':
            if (currentEvent) {
              currentEvent.location = value;
            }
            break;
          case 'DTSTART':
            if (currentEvent) {
              currentEvent.start = parseICSDate(value);
            }
            break;
          case 'DTEND':
            if (currentEvent) {
              currentEvent.end = parseICSDate(value);
            }
            break;
          case 'UID':
            if (currentEvent) {
              currentEvent.id = value;
            }
            break;
        }
      });

      return events.filter(event => 
        event.title && 
        event.start && 
        event.end && 
        !isNaN(event.start) && 
        !isNaN(event.end)
      );
    } catch (error) {
      console.error('解析 ICS 檔案時發生錯誤:', error);
      throw new Error('無法解析行事曆檔案，請確保檔案格式正確');
    }
  };

  const parseICSDate = (dateStr) => {
    // 處理帶時區的日期格式
    if (dateStr.endsWith('Z')) {
      dateStr = dateStr.slice(0, -1);
    }

    // 基本 UTC 日期時間格式: YYYYMMDDTHHMMSS
    const match = dateStr.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/);
    if (!match) return null;

    const [_, year, month, day, hour = '00', minute = '00', second = '00'] = match;
    return new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
  };

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.ics')) {
      setError('請上傳有效的 .ics 行事曆檔案');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileContent = await file.text();
      const events = parseICSFile(fileContent);
      
      if (events.length === 0) {
        setError('行事曆檔案中沒有找到任何活動');
        return;
      }

      onEventsLoad(events);
    } catch (err) {
      console.error('解析行事曆檔案時發生錯誤:', err);
      setError('無法解析行事曆檔案，請確保檔案格式正確');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const loadExampleCalendar = async () => {
    try {
      setUploading(true);
      setError(null);
      
      const response = await fetch('/example.ics');
      if (!response.ok) {
        throw new Error('無法載入範例檔案');
      }
      const fileContent = await response.text();
      const events = parseICSFile(fileContent);
      
      onEventsLoad(events);
    } catch (err) {
      console.error('載入範例行事曆時發生錯誤:', err);
      setError('無法載入範例行事曆');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div 
        className={`relative mb-6 ${dragActive ? 'border-blue-400' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">點擊上傳</span> 或拖放檔案
            </p>
            <p className="text-xs text-gray-500">.ICS 行事曆檔案</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".ics"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={loadExampleCalendar}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              載入中...
            </>
          ) : (
            '載入範例行事曆'
          )}
        </button>
      </div>
    </div>
  );
};

export default CalendarUpload;
