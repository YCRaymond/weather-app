#!/bin/bash

# 顯示顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}開始初始化天氣行事曆應用程式...${NC}\n"

# 檢查 Node.js 版本
echo "檢查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}未安裝 Node.js，請先安裝 Node.js${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js 版本: $NODE_VERSION${NC}"

# 檢查 npm 版本
echo -e "\n檢查 npm 版本..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}未安裝 npm${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}npm 版本: $NPM_VERSION${NC}"

# 安裝依賴
echo -e "\n安裝專案依賴..."
npm install

# 檢查 .env.local 檔案
echo -e "\n檢查環境變數設定..."
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}未找到 .env.local 檔案，建立預設檔案...${NC}"
    cat > .env.local << EOL
# 中央氣象局 OpenData API 授權碼
# 必須設定！請從 https://opendata.cwb.gov.tw/userLogin 申請授權碼
NEXT_PUBLIC_CWB_API_KEY=

# 預設城市設定
NEXT_PUBLIC_DEFAULT_CITY=臺北市

# API 請求設定
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_COUNT=3
NEXT_PUBLIC_API_DEBUG=true

# 開發模式設定
NODE_ENV=development
EOL
    echo -e "${YELLOW}請編輯 .env.local 檔案並設定您的 API 金鑰${NC}"
else
    echo -e "${GREEN}找到 .env.local 檔案${NC}"
    if ! grep -q "NEXT_PUBLIC_CWB_API_KEY=" .env.local; then
        echo -e "${RED}警告: 未設定 API 金鑰${NC}"
    fi
fi

# 建立範例行事曆
echo -e "\n檢查範例行事曆..."
if [ ! -f public/example.ics ]; then
    echo -e "${YELLOW}未找到範例行事曆，建立預設檔案...${NC}"
    mkdir -p public
    cp example.ics public/example.ics 2>/dev/null || echo -e "${RED}無法建立範例行事曆${NC}"
else
    echo -e "${GREEN}找到範例行事曆檔案${NC}"
fi

# 完成設定
echo -e "\n${GREEN}初始化完成！${NC}"
echo -e "\n下一步："
echo "1. 編輯 .env.local 檔案，設定您的 API 金鑰"
echo "2. 執行 'npm run dev' 啟動開發伺服器"
echo "3. 開啟瀏覽器訪問 http://localhost:3000"
echo -e "\n${YELLOW}詳細說明請參考 SETUP.md 文件${NC}\n"
