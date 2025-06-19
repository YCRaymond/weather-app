import { NextResponse } from 'next/server';

const validateApi = async (url, params) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      success: data.success,
      message: data.message,
      hasData: data?.records?.Station ? data.records.Station.length > 0 : 
              data?.records?.location ? data.records.location.length > 0 : false,
      sampleData: data?.records?.Station?.[0] || data?.records?.location?.[0]
    };
  } catch (error) {
    return {
      error: error.message,
      status: 'error'
    };
  }
};

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_CWB_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json({
      error: '未設定 API 金鑰',
      envVars: {
        hasApiKey: false,
        env: process.env.NODE_ENV,
        apiKeyPrefix: API_KEY?.slice(0, 4)
      }
    }, { status: 400 });
  }

  try {
    const BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

    const now = new Date().toISOString().slice(0, 13);

    // 測試各個 API 端點
    const testResults = {
      observation: await validateApi(
        `${BASE_URL}/O-A0001-001?Authorization=${API_KEY}&StationId=&WeatherElement=Weather,AirTemperature,RelativeHumidity,WindSpeed,StationPressure,Now&format=JSON&dataTime=${now}`
      ),
      forecast: await validateApi(
        `${BASE_URL}/F-C0032-001?Authorization=${API_KEY}&locationName=臺北市&format=JSON`
      ),
      uvi: await validateApi(
        `${BASE_URL}/M-A0085-001?Authorization=${API_KEY}&County=臺北市&format=JSON`
      ),
      warning: await validateApi(
        `${BASE_URL}/W-C0033-001?Authorization=${API_KEY}&format=JSON`
      )
    };

    // 檢查是否有任何端點失敗
    const failedEndpoints = Object.entries(testResults)
      .filter(([_, result]) => !result.ok)
      .map(([name, result]) => ({
        name,
        status: result.status,
        error: result.error || result.message
      }));

    if (failedEndpoints.length > 0) {
      return NextResponse.json({
        success: false,
        error: '部分 API 端點測試失敗',
        failedEndpoints,
        apiKey: {
          length: API_KEY.length,
          prefix: API_KEY.slice(0, 4),
          isValid: API_KEY.startsWith('CWA-')
        }
      }, { status: 500 });
    }

    // 回傳測試結果
    return NextResponse.json({
      success: true,
      apiKey: {
        valid: true,
        prefix: API_KEY.slice(0, 4),
        length: API_KEY.length,
        isValid: API_KEY.startsWith('CWA-')
      },
      tests: testResults,
      sampleData: {
        observation: testResults.observation.sampleData,
        forecast: testResults.forecast.sampleData,
        uvi: testResults.uvi.sampleData
      }
    });
  } catch (error) {
    console.error('API 測試失敗:', error);
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      apiKey: {
        length: API_KEY.length,
        prefix: API_KEY.slice(0, 4),
        isValid: API_KEY.startsWith('CWA-')
      }
    }, { status: 500 });
  }
}
