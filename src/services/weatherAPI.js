const API_KEY = process.env.NEXT_PUBLIC_CWB_API_KEY;
const BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

// 基本 fetch 函數
const fetchAPI = async (endpoint, params = {}) => {
  if (!API_KEY) {
    throw new Error('未設定 API 金鑰，請在 .env.local 中設定 NEXT_PUBLIC_CWB_API_KEY');
  }

  try {
    console.log('正在請求 API:', endpoint);
    const url = new URL(`${BASE_URL}/${endpoint}`);
    
    // 添加必要的參數
    url.searchParams.append('Authorization', API_KEY);
    url.searchParams.append('format', 'JSON');
    
    // 添加其他參數
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    console.log('請求 URL:', url.toString());
    
    const response = await fetch(url.toString());
    console.log('API 回應狀態:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 錯誤回應:', errorText);
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 回應資料:', JSON.stringify(data, null, 2));

    if (data.success !== true) {
      throw new Error(data.message || '資料獲取失敗');
    }

    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
};

// 取得天氣警特報
export const getWeatherWarnings = async () => {
  try {
    const response = await fetchAPI('W-C0033-001', {
      elementName: 'Wx'
    });
    if (!response?.records) {
      throw new Error('無法獲取天氣警特報資料');
    }
    return response;
  } catch (error) {
    console.error('取得天氣警特報資料失敗:', error);
    return { records: [] };
  }
};

// 取得天氣觀測資料
export const getWeatherStationData = async (city) => {
  try {
    if (!city) {
      console.warn('未提供城市名稱，使用預設值');
      city = '臺北市';
    }

    console.log('正在獲取城市資料:', city);

    // 使用自動氣象站資料
    const response = await fetchAPI('O-A0001-001', {
      StationId: '',
      WeatherElement: 'Weather,AirTemperature,RelativeHumidity,WindSpeed,StationPressure,Now',
      parameterName: 'CITY',
      dataTime: new Date().toISOString().slice(0, 13)
    });

    if (!response?.records?.Station) {
      console.warn('找不到觀測站資料:', city);
      return { records: [] };
    }

    const stations = response.records.Station.filter(
      station => station.GeoInfo.CountyName === city
    ).map(station => ({
      LocationName: station.StationName,
      StationID: station.StationId,
      LatWGS84: parseFloat(station.GeoInfo.Coordinates[0].StationLatitude),
      LonWGS84: parseFloat(station.GeoInfo.Coordinates[0].StationLongitude),
      Temp: parseFloat(station.WeatherElement.AirTemperature),
      HUMD: parseFloat(station.WeatherElement.RelativeHumidity) / 100,
      WDSD: parseFloat(station.WeatherElement.WindSpeed),
      PRES: parseFloat(station.WeatherElement.StationPressure),
      Weather: station.WeatherElement.Weather,
      ObsTime: station.ObserveTime
    }));

    console.log('處理後的觀測站資料:', stations);

    return { records: stations };
  } catch (error) {
    console.error('取得氣象觀測資料失敗:', error);
    return { records: [] };
  }
};

// 取得紫外線觀測資料
export const getUVIData = async (city) => {
  try {
    if (!city) return { records: [] };

    // 使用紫外線資料
    const response = await fetchAPI('M-A0085-001', {
      County: city
    });

    if (!response?.records?.Station) {
      return { records: [] };
    }

    return {
      records: response.records.Station.map(station => ({
        LocationName: station.StationName,
        StationID: station.StationId,
        H_UVI: parseFloat(station.UVI),
        ObsTime: station.ObserveTime
      }))
    };
  } catch (error) {
    console.error('取得紫外線資料失敗:', error);
    return { records: [] };
  }
};

// 取得天氣預報
export const getWeatherForecast = async (city) => {
  try {
    if (!city) return { records: [] };

    const response = await fetchAPI('F-C0032-001', {
      locationName: city,
      sort: 'time'
    });

    if (!response?.records?.location) {
      return { records: [] };
    }

    return {
      records: response.records.location.map(location => ({
        LocationName: location.locationName,
        weatherElements: location.weatherElement.reduce((acc, element) => {
          acc[element.elementName] = element.time.map(t => ({
            startTime: t.startTime,
            endTime: t.endTime,
            value: t.parameter.parameterName,
            measures: t.parameter.parameterUnit
          }));
          return acc;
        }, {})
      }))
    };
  } catch (error) {
    console.error('取得天氣預報失敗:', error);
    return { records: [] };
  }
};
