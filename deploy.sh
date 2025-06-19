#!/bin/bash

# 顯示顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}開始部署到 GitHub...${NC}\n"

# 確認 .gitignore 存在
if [ ! -f .gitignore ]; then
  echo -e "${YELLOW}建立 .gitignore 檔案...${NC}"
  cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem
.env
.env.*
!.env.example

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOL
fi

# 建立範例環境變數檔案
echo -e "${YELLOW}建立 .env.example 檔案...${NC}"
cat > .env.example << EOL
# 中央氣象署 API 金鑰
NEXT_PUBLIC_CWB_API_KEY=CWA-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

# 預設城市設定
NEXT_PUBLIC_DEFAULT_CITY=臺北市

# API 設定
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_COUNT=3
NEXT_PUBLIC_API_DEBUG=true
EOL

# 初始化 Git（如果尚未初始化）
if [ ! -d .git ]; then
  echo -e "${YELLOW}初始化 Git 儲存庫...${NC}"
  git init
  
  # 提示使用者輸入 GitHub 儲存庫地址
  echo -e "${YELLOW}請輸入 GitHub 儲存庫地址:${NC}"
  read repo_url
  
  git remote add origin $repo_url
else
  echo -e "${GREEN}Git 儲存庫已存在${NC}"
fi

# 提交變更
echo -e "\n${YELLOW}準備提交變更...${NC}"
git add .
git status

echo -e "\n${YELLOW}請輸入提交訊息 (預設: 'Update weather app'):${NC}"
read commit_message
if [ -z "$commit_message" ]; then
  commit_message="Update weather app"
fi

echo -e "\n${YELLOW}提交變更...${NC}"
git commit -m "$commit_message"

# 推送到 GitHub
echo -e "\n${YELLOW}推送到 GitHub...${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}成功推送到 GitHub！${NC}"
  echo -e "\n部署步驟："
  echo "1. 訪問你的 GitHub 儲存庫"
  echo "2. 前往 Settings > Pages"
  echo "3. 設定部署來源"
  echo -e "\n${YELLOW}記得在部署環境中設定環境變數：${NC}"
  echo "NEXT_PUBLIC_CWB_API_KEY"
else
  echo -e "\n${RED}推送失敗，請檢查錯誤訊息${NC}"
fi
