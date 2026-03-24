Travlkeeper - 行程管理與分享工具本專案是一個基於 Cloudflare Workers、D1 (SQLite) 與 LINE LIFF 構建的輕量級旅遊行程管理工具。核心架構Frontend: LINE LIFF (內建於 Worker 中)，使用 Tailwind CSS。Backend: Cloudflare Worker (處理 API 請求與網頁渲染)。Database: Cloudflare D1 (儲存用戶行程資料)。Sharing: 使用 liff.shareTargetPicker 發送 Flex Message。快速開始1. 建立資料庫wrangler d1 create travlkeeper
將回傳的 database_id 填入 wrangler.jsonc。2. 初始化資料表建立 schema.sql：CREATE TABLE IF NOT EXISTS users (
    line_user_id TEXT PRIMARY KEY,
    display_name TEXT,
    status_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
執行：wrangler d1 execute travlkeeper --remote --file=./schema.sql
3. 部署專案wrangler deploy
API 說明GET /: 顯示 LIFF 前端網頁。GET /api/list: 取得所有行程。GET /api/flex?id={id}: 產生特定行程的 LINE Flex Message 格式。POST /api/save: 儲存或更新行程資料。LINE 設定提醒LIFF Endpoint: 填入 https://<你的域名>.workers.dev/。Scopes: 必須勾選 profile。Features: 必須勾選 shareTargetPicker。
Travlkeeper - SaaS AI 行程管理工具部署與修復提醒1. 資料庫欄位補全如果遇到 no column named price 或 no column named cover_url，請執行：npx wrangler d1 execute travlkeeper --remote --command "ALTER TABLE itineraries ADD COLUMN cover_url TEXT; ALTER TABLE itineraries ADD COLUMN price INTEGER;"
2. 部署指令npm run deploy
這會強行指定 src/index.ts 部署，避開 Windows 路徑 Bug。3. 功能清單AI 視覺辨識：自動掃描旅遊 DM 並生成 Markdown 故事。多圖自動化：根據行程關鍵字自動搜尋 Unsplash 圖片。後台管理：支援行程的編輯、刪除與 LIFF 分享。
