import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

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
                <a href="#" class="flex items-center p-3 bg-white/10 rounded-xl font-bold"><i class="fa-solid fa-chart-line w-6"></i>數據概覽</a>
                <a href="#" class="flex items-center p-3 hover:bg-white/5 rounded-xl"><i class="fa-solid fa-map-location-dot w-6"></i>行程管理</a>
            </nav>
        </aside>
        <main class="flex-1 p-10">
            <h2 class="text-3xl font-black text-slate-800">系統數據概覽</h2>
            <div class="mt-10 p-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p class="text-slate-500">後台路由已強制定向，看到此畫面代表 GET /admin 運作正常。</p>
            </div>
        </main>
    </div>
</body>
</html>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // 1. 強制攔截 GET /admin
    if (method === "GET" && url.href.toLowerCase().includes("admin")) {
      return new Response(adminHTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 2. 處理 API 代理 (GAS)
    if (method === "POST" && url.pathname.includes("/api/process")) {
      const GAS_URL = env.GAS_URL;
      const clientData = await request.json();
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ ...clientData, keys: { OPENAI_API_KEY: env.OPENAI_API_KEY, LINE_CHANNEL_ACCESS_TOKEN: env.LINE_CHANNEL_ACCESS_TOKEN } }),
        headers: { 'Content-Type': 'application/json' }
      });
      return new Response(await response.text(), { headers: { 'Content-Type': 'application/json' } });
    }

    // 3. 處理 LINE Webhook
    if (method === "POST") {
      try {
        const body = await request.json();
        // 確保訊號進入核心處理器
        return await runAgent(body, env);
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }

    // 4. 預設回應
    return new Response(JSON.stringify({ status: "online", path: url.pathname }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
