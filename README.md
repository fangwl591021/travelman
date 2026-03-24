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
