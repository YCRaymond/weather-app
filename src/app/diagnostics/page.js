'use client';

import { useState, useEffect } from 'react';

export default function Diagnostics() {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    try {
      setTesting(true);
      setError(null);

      // 測試 API 連線
      const response = await fetch('/api/weather/test');
      const data = await response.json();

      setTestResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">系統診斷</h1>

        <div className="space-y-6">
          {/* API 金鑰狀態 */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">API 金鑰狀態</h2>
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                錯誤：{error}
              </div>
            ) : testing ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <span>測試中...</span>
              </div>
            ) : testResults ? (
              <div className="space-y-4">
                <div className={`flex items-center space-x-2 ${
                  testResults.apiKey?.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="font-medium">API 金鑰格式：</span>
                  <span>
                    {testResults.apiKey?.isValid ? '正確' : '不正確'}
                    {testResults.apiKey?.prefix && ` (前綴: ${testResults.apiKey.prefix}...)`}
                  </span>
                </div>
              </div>
            ) : null}
          </section>

          {/* API 端點測試 */}
          {testResults?.tests && (
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">API 端點測試</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults.tests).map(([name, result]) => (
                  <div key={name} className="border rounded p-4">
                    <h3 className="font-medium capitalize mb-2">{name}</h3>
                    <div className="space-y-2 text-sm">
                      <p>狀態: <span className={
                        result.ok ? 'text-green-600' : 'text-red-600'
                      }>{result.status}</span></p>
                      <p>回應: {result.success ? '成功' : '失敗'}</p>
                      <p>有資料: {result.hasData ? '是' : '否'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 示範資料 */}
          {testResults?.sampleData && (
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">資料範例</h2>
              <div className="overflow-x-auto">
                <pre className="text-xs bg-gray-50 p-4 rounded">
                  {JSON.stringify(testResults.sampleData, null, 2)}
                </pre>
              </div>
            </section>
          )}

          {/* 重新測試按鈕 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={runTests}
              disabled={testing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {testing ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>測試中...</span>
                </span>
              ) : (
                '重新測試'
              )}
            </button>
          </div>
        </div>

        {/* 回到首頁 */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            返回首頁
          </a>
        </div>
      </div>
    </main>
  );
}
