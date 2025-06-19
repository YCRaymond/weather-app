const cities = {
  '臺北': { lat: 25.0330, lon: 121.5654 },
  '臺北市': { lat: 25.0330, lon: 121.5654 },
  '新北': { lat: 25.0170, lon: 121.4628 },
  '新北市': { lat: 25.0170, lon: 121.4628 },
  '桃園': { lat: 24.9936, lon: 121.3010 },
  '桃園市': { lat: 24.9936, lon: 121.3010 },
  '臺中': { lat: 24.1477, lon: 120.6736 },
  '臺中市': { lat: 24.1477, lon: 120.6736 },
  '臺南': { lat: 22.9998, lon: 120.2268 },
  '臺南市': { lat: 22.9998, lon: 120.2268 },
  '高雄': { lat: 22.6273, lon: 120.3014 },
  '高雄市': { lat: 22.6273, lon: 120.3014 },
  '基隆': { lat: 25.1276, lon: 121.7392 },
  '基隆市': { lat: 25.1276, lon: 121.7392 },
  '新竹': { lat: 24.8138, lon: 120.9675 },
  '新竹市': { lat: 24.8138, lon: 120.9675 },
  '新竹縣': { lat: 24.8390, lon: 121.0181 },
  '苗栗': { lat: 24.5600, lon: 120.8220 },
  '苗栗縣': { lat: 24.5600, lon: 120.8220 },
  '彰化': { lat: 24.0809, lon: 120.5383 },
  '彰化縣': { lat: 24.0809, lon: 120.5383 },
  '南投': { lat: 23.9157, lon: 120.6738 },
  '南投縣': { lat: 23.9157, lon: 120.6738 },
  '雲林': { lat: 23.7092, lon: 120.4313 },
  '雲林縣': { lat: 23.7092, lon: 120.4313 },
  '嘉義': { lat: 23.4801, lon: 120.4490 },
  '嘉義市': { lat: 23.4801, lon: 120.4490 },
  '嘉義縣': { lat: 23.4518, lon: 120.2556 },
  '屏東': { lat: 22.5519, lon: 120.5487 },
  '屏東縣': { lat: 22.5519, lon: 120.5487 },
  '宜蘭': { lat: 24.7591, lon: 121.7539 },
  '宜蘭縣': { lat: 24.7591, lon: 121.7539 },
  '花蓮': { lat: 23.9772, lon: 121.6044 },
  '花蓮縣': { lat: 23.9772, lon: 121.6044 },
  '臺東': { lat: 22.7583, lon: 121.1444 },
  '臺東縣': { lat: 22.7583, lon: 121.1444 },
  '澎湖': { lat: 23.5711, lon: 119.5793 },
  '澎湖縣': { lat: 23.5711, lon: 119.5793 },
  '金門': { lat: 24.4493, lon: 118.3767 },
  '金門縣': { lat: 24.4493, lon: 118.3767 },
  '連江': { lat: 26.1597, lon: 119.9515 },
  '連江縣': { lat: 26.1597, lon: 119.9515 },
  '北投': { lat: 25.1175, lon: 121.5071, city: '臺北市' },
  '信義區': { lat: 25.0299, lon: 121.5706, city: '臺北市' },
  '板橋': { lat: 25.0119, lon: 121.4581, city: '新北市' },
  '淡水': { lat: 25.1712, lon: 121.4410, city: '新北市' }
};

export const getLocationCoordinates = async (address) => {
  try {
    if (!address) return null;

    // 處理台/臺的轉換
    const normalizedAddress = address.replace(/台/g, '臺');

    // 從地址中找出符合的城市或地區
    const cityMatch = Object.keys(cities).find(city => 
      normalizedAddress.includes(city)
    );

    if (cityMatch) {
      const cityData = cities[cityMatch];
      return {
        lat: cityData.lat,
        lon: cityData.lon,
        city: cityData.city || cityMatch.replace(/[市縣區]$/, '') // 使用特定城市或移除字尾
      };
    }

    // 如果找不到符合的地點，嘗試從地址中提取第一個縣市名稱
    const cityPattern = /^(.*?[市縣])/;
    const match = normalizedAddress.match(cityPattern);
    if (match && cities[match[1]]) {
      const cityData = cities[match[1]];
      return {
        lat: cityData.lat,
        lon: cityData.lon,
        city: match[1].replace(/[市縣]$/, '')
      };
    }

    // 如果還是找不到，就使用臺北市作為預設值
    console.warn(`無法解析地址: ${address}，使用預設位置`);
    return {
      lat: cities['臺北市'].lat,
      lon: cities['臺北市'].lon,
      city: '臺北'
    };
  } catch (error) {
    console.error('地理編碼錯誤:', error);
    return null;
  }
};

// 計算兩點之間的距離（公尺）
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 地球半徑（公尺）
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
