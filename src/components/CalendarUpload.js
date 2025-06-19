import { useState, useRef } from 'react';
import ical from 'node-ical';

const CalendarUpload = ({ onEventsLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.ics')) {
      setError('請上傳 .ics 格式的行事曆檔案');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const events = await parseICalEvents(text);
      onEventsLoad(events);
      setError(null);
    } catch (err) {
      console.error('處理行事曆檔案時發生錯誤:', err);
      setError('無法解析行事曆檔案，請確認檔案格式是否正確');
    } finally {
      setLoading(false);
    }
  };

  const parseICalEvents = async (icalData) => {
    return new Promise((resolve, reject) => {
      const events = [];
      ical.parseICS(icalData, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        
        for (let k in data) {
          if (data[k].type === 'VEVENT') {
            events.push({
              title: data[k].summary,
              start: data[k].start,
              end: data[k].end,
              location: data[k].location || null
            });
          }
        }
        resolve(events);
      });
    });
  };

  const handleExampleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/example.ics');
      const text = await response.text();
      const events = await parseICalEvents(text);
      onEventsLoad(events);
    } catch (err) {
      console.error('載入範例檔案時發生錯誤:', err);
      setError('無法載入範例檔案');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${loading ? 'opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".ics"
          onChange={handleFileInput}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="text-center">
          <svg
            className={`mx-auto h-12 w-12 transition-colors duration-200 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V12a4 4 0 00-4-4h-4m-4 8v12m-6-6h12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              disabled={loading}
            >
              選擇檔案
            </button>
            <span className="mx-2 text-gray-500">或</span>
            <button
              onClick={handleExampleClick}
              className="btn-secondary"
              disabled={loading}
            >
              載入範例
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {loading ? '處理中...' : '拖放 .ics 檔案或點擊上方按鈕'}
          </p>
        </div>

        {/* 載入動畫 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarUpload;
