# 設定指南

## 1. API 金鑰設定

1. 申請 API 金鑰
   - 訪問 https://opendata.cwa.gov.tw/userLogin
   - 註冊並登入
   - 申請 API 授權碼（應以 CWA- 開頭）

2. 設定環境變數
   ```bash
   # 編輯 .env.local 檔案
   NEXT_PUBLIC_CWB_API_KEY=CWA-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

## 2. 測試步驟

1. 啟動開發伺服器
   ```bash
   npm run dev
   ```

2. 測試 API 連線
   - 訪問 http://localhost:3000/diagnostics
   - 確認 API 回應是否正常
   - 檢查瀏覽器控制台的錯誤訊息

3. 確認 API 連線狀態
   ```bash
   curl -H "Authorization: YOUR-API-KEY" \
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?locationName=臺北市"
   ```

4. 載入範例行事曆
   - 訪問 http://localhost:3000
   - 點擊「載入範例行事曆」按鈕
   - 確認以下地點的天氣資訊是否正確顯示：
     * 臺北市信義區
     * 臺北市北投區
     * 新北市淡水區

## 3. 常見問題排解

### API 錯誤

如果看到 "API 請求失敗" 錯誤：

1. 檢查 API 金鑰格式
   - 必須以 CWA- 開頭
   - 格式應為：CWA-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

2. 確認網路連線狀態

3. 檢查 API 回應
   - 開啟瀏覽器開發者工具
   - 切換到 Network 分頁
   - 重新整理頁面
   - 查看 API 請求的回應內容

### 地理編碼問題

如果地點無法正確解析：

1. 確認地址格式
   - 必須包含縣市名稱
   - 使用正確的「臺」字（不是「台」）

2. 支援的地區列表
   ```javascript
   // 目前支援的地區：
   - 臺北市及其區域（信義區、北投等）
   - 新北市及其區域（淡水、板橋等）
   - 其他縣市（臺中市、高雄市等）
   ```

## 4. 開發注意事項

1. API 請求限制
   - 每分鐘最多 600 次請求
   - 每日最多 20,000 次請求
   - 建議使用本地快取

2. 除錯模式
   ```bash
   # 開啟除錯模式
   NEXT_PUBLIC_API_DEBUG=true
   ```

3. 程式碼更新
   ```bash
   # 重新啟動開發伺服器
   npm run dev
   ```

## 5. 其他資源

- [中央氣象署開放資料平台](https://opendata.cwa.gov.tw/)
- [API 文件](https://opendata.cwa.gov.tw/dist/openapi.html)
- [常見問題](https://opendata.cwa.gov.tw/FAQ)
