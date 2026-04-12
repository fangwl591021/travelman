import { runAgent } from './adk_agent.js';

/**
 * 旅行管家 - 核心路由整合版
 * 解決路徑偏移問題，優先處理 /admin
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // 1. 強制攔截：只要網址最後面是 admin 就給後台
    if (path.endsWith('/admin')) {
      return new Response(adminHTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 2. 處理 LINE Webhook (POST)
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        // 將處理邏輯轉交給 adk_agent.js
        return await runAgent(body, env);
      } catch (e) {
        // 即使出錯也給 LINE 200，避免 Webhook 被關閉
        return new Response("OK", { status: 200 });
      }
    }

    // 3. 預設回應 (首頁)
    return new Response("TravelKeeper System Ready", { status: 200 });
  }
};

const adminHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>旅行管家 - 管理後台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-50 min-h-screen font-sans">
    <div class="flex">
        <aside class="w-64 bg-[#174a5a] text-white h-screen sticky top-0 flex flex-col p-6 shadow-2xl">
            <div class="text-2xl font-black mb-10 flex items-center gap-3">
                <i class="fa-solid fa-compass text-teal-400"></i>
                <span>旅行管家</span>
            </div>
            <nav class="flex-1 space-y-2">
                <a href="#" class="flex items-center p-3 bg-white/10 rounded-xl font-bold transition-all"><i class="fa-solid fa-chart-line w-6"></i>數據概覽</a>
                <a href="#" class="flex items-center p-3 hover:bg-white/5 rounded-xl transition-all"><i class="fa-solid fa-map-location-dot w-6"></i>行程管理</a>
            </nav>
            <div class="text-[10px] text-white/30 mt-auto pt-6 border-t border-white/10 tracking-widest uppercase">Cloud SaaS v2.5.0</div>
        </aside>
        <main class="flex-1 p-10">
            <header class="mb-10 text-3xl font-black text-slate-800">系統數據概覽</header>
            <div class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-slate-500">
                後台路由已強制定向。如果您看到此畫面，代表 /admin 已成功連通。
            </div>
        </main>
    </div>
</body>
</html>
`;
