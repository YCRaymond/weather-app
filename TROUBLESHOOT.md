# 問題排除指南

## API 連線問題

### 1. API 金鑰錯誤

如果看到 "API 請求失敗" 錯誤：

1. 檢查 API 金鑰格式：
   ```bash
   # 錯誤格式
   NEXT_PUBLIC_CWB_API_KEY=CWB-XXXXXXXX-XXXX-XXXX
   
   # 正確格式（中央氣象署）
   NEXT_PUBLIC_CWB_API_KEY=CWA-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

2. 測試 API 連線
   ```bash
   # 使用診斷工具
   http://localhost:3000/diagnostics
   
   # 或直接測試 API
   curl -v -H "Authorization: YOUR-API-KEY" \
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?locationName=臺北市"
   ```

3. 常見錯誤：
   - `401`: API 金鑰無效或格式錯誤
   - `403`: 超過 API 使用限制
   - `404`: API 端點錯誤
   - `429`: 請求過於頻繁

### 2. 無法獲取天氣資料

如果看到 "無法獲取任何天氣資料" 錯誤：

1. 檢查網路連線：
   ```bash
   ping opendata.cwa.gov.tw
   ```

2. 清除瀏覽器快取：
   - 開啟開發者工具 (F12)
   - Network 分頁中勾選 "Disable cache"
   - 重新整理頁面

3. 檢查 API 回應：
   ```bash
   # 測試天氣預報 API
   curl "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=YOUR-API-KEY&locationName=臺北市&format=JSON"
   
   # 測試觀測站 API
   curl "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=YOUR-API-KEY&locationName=臺北市&format=JSON"
   ```

### 3. 城市定位錯誤

如果地點無法正確解析：

1. 確認地址格式：
   ```
   # 正確格式
   臺北市信義區信義路五段7號
   臺中市西屯區
   
   # 錯誤格式
   台北市（錯誤：應為「臺」）
   信義區（錯誤：缺少縣市）
   ```

2. 檢查城市名稱對照：
   ```javascript
   // src/services/geocodingAPI.js 中的支援城市
   const cities = {
     '臺北市': { lat: 25.0330, lon: 121.5654 },
     '新北市': { lat: 25.0170, lon: 121.4628 },
     // ...其他城市
   }
   ```

## 行事曆問題

### 1. 檔案上傳失敗

檢查檔案格式：
```ics
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:測試事件
DTSTART:20250620T080000Z
DTEND:20250620T090000Z
LOCATION:臺北市信義區
END:VEVENT
END:VCALENDAR
```

必要欄位：
- LOCATION（地點）
- DTSTART（開始時間）
- DTEND（結束時間）

### 2. 天氣資料不準確

可能原因：
1. 觀測站距離過遠
2. 資料更新頻率不同：
   - 天氣預報：每 3 小時更新
   - 觀測資料：每小時更新
   - 警特報：即時更新

## 系統問題

### 1. 效能問題

如果應用程式反應緩慢：

1. 檢查 API 響應時間：
   ```bash
   curl -w "總時間: %{time_total}s\n" -o /dev/null -s \
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=YOUR-API-KEY"
   ```

2. 清除快取：
   ```bash
   # 清除 Next.js 快取
   rm -rf .next
   
   # 重新啟動應用
   npm run dev
   ```

3. 監控 API 使用量：
   - 訪問診斷頁面
   - 查看請求統計
   - 確認是否需要實作節流

### 2. 相容性問題

瀏覽器支援：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Node.js 版本：
- 要求 18.17.0 或更新版本
- 建議使用 LTS 版本

## 除錯技巧

1. 開啟詳細日誌：
   ```bash
   # 編輯 .env.local
   NEXT_PUBLIC_API_DEBUG=true
   ```

2. 檢查瀏覽器控制台：
   - API 請求狀態
   - 回應內容
   - 錯誤訊息

3. 使用診斷工具：
   - 訪問 /diagnostics 頁面
   - 測試所有 API 端點
   - 檢查金鑰有效性

## 聯絡支援

如遇到無法解決的問題：

1. 準備資訊：
   - 環境變數設定（移除敏感資訊）
   - 錯誤訊息截圖
   - 瀏覽器和系統版本

2. 提供問題描述：
   - 重現步驟
   - 期望結果
   - 實際結果

## 已知問題

1. API 限制：
   - 單一 IP 每分鐘最多 600 次請求
   - 每個授權碼每日最多 20,000 次請求

2. 資料更新延遲：
   - 天氣預報可能有 5-10 分鐘延遲
   - 觀測資料可能有 1 小時延遲

3. 地理編碼限制：
   - 僅支援台灣地區
   - 部分偏遠地區可能缺少觀測站
