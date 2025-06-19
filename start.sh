#!/bin/bash

# 顯示顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}啟動天氣行事曆應用程式${NC}\n"

# 檢查是否有 .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}錯誤：找不到 .env.local 檔案${NC}"
    echo -e "請先執行：${YELLOW}./init.sh${NC}"
    exit 1
fi

# 檢查 API 金鑰
if ! grep -q "NEXT_PUBLIC_CWB_API_KEY=" .env.local; then
    echo -e "${RED}錯誤：未設定 API 金鑰${NC}"
    echo "請在 .env.local 中設定 NEXT_PUBLIC_CWB_API_KEY"
    exit 1
fi

# 安裝依賴
echo -e "${GREEN}檢查依賴套件...${NC}"
npm install

# 啟動開發伺服器
echo -e "\n${GREEN}啟動開發伺服器...${NC}"
npm run dev &

# 等待伺服器啟動
sleep 5

# 開啟瀏覽器
echo -e "\n${GREEN}開啟瀏覽器...${NC}"
if command -v open >/dev/null 2>&1; then
    open http://localhost:3000
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3000
elif command -v start >/dev/null 2>&1; then
    start http://localhost:3000
fi

echo -e "\n${GREEN}應用程式已啟動！${NC}"
echo -e "\n使用說明："
echo "1. 訪問 http://localhost:3000"
echo "2. 點擊「系統診斷」檢查 API 連線狀態"
echo "3. 使用範例行事曆或上傳自己的檔案"
echo -e "\n${YELLOW}如需協助，請參考 README.md${NC}\n"

# 監控伺服器狀態
wait
