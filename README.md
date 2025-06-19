# 天氣行事曆

一個整合中央氣象署天氣資料的行事曆應用程式，可以查看行程地點的天氣預報。

## 功能特色

- 📅 支援 .ics 格式行事曆匯入
- 🌤️ 顯示即時天氣資訊
- 🌡️ 顯示溫度和降雨機率
- 📍 支援地理位置天氣查詢
- ⚠️ 天氣警特報提醒
- 📱 響應式設計

## 快速開始

1. 安裝依賴
```bash
npm install
```

2. 設定環境變數
```bash
# 編輯 .env.local
NEXT_PUBLIC_CWB_API_KEY=你的API金鑰
```

3. 啟動開發伺服器
```bash
npm run dev
```

4. 開啟瀏覽器訪問
```
http://localhost:3000
```

## 系統需求

- Node.js 18.17.0 或更新版本
- 中央氣象署 API 金鑰 (申請網址: https://opendata.cwa.gov.tw/)

## 使用技術

- Next.js 14
- Tailwind CSS
- 中央氣象署 OpenAPI
- React
- Date-fns

## 部署方式

1. 克隆專案
```bash
git clone https://github.com/你的使用者名稱/weather-app.git
```

2. 安裝依賴
```bash
cd weather-app
npm install
```

3. 設定環境變數
```bash
cp .env.example .env.local
# 編輯 .env.local 填入你的 API 金鑰
```

4. 建置專案
```bash
npm run build
```

5. 啟動伺服器
```bash
npm start
```

## 開發指南

1. 使用初始化腳本
```bash
./init.sh
```

2. 檢查系統狀態
```bash
# 訪問診斷頁面
http://localhost:3000/diagnostics
```

3. 使用測試資料
```bash
# 使用範例行事曆
cp public/example.ics test.ics
```

## 問題排解

如果遇到問題，請參考：

- SETUP.md - 設定指南
- TROUBLESHOOT.md - 故障排除指南
- SOLUTION.md - 解決方案說明

## 貢獻指南

歡迎提交 Pull Request 或建立 Issue！

## 授權條款

MIT License
