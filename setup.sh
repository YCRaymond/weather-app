#!/bin/bash

# 設定腳本權限
chmod +x init.sh
chmod +x start.sh

# 建立 .gitignore
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

# 提示使用者
echo "設定完成！"
echo "請依照以下步驟操作："
echo "1. 設定 API 金鑰：編輯 .env.local"
echo "2. 初始化專案：./init.sh"
echo "3. 啟動應用程式：./start.sh"
echo ""
echo "如需協助，請參考："
echo "- README.md：使用說明"
echo "- SETUP.md：設定指南"
echo "- TROUBLESHOOT.md：問題排解"
