import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

// 嵌入管理後台 HTML (固定 #174a5a 色系、框架與文字大小)
const adminHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>旅行管家 - 管理後台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-50 min-h-screen font-sans text-slate-900">
    <div class="flex">
        <aside class="w-64 bg-[#174a5a] text-white h-screen sticky top-0 flex flex-col p-6 shadow-2xl">
            <div class="text-2xl font-black mb-10 flex items-center gap-3">
                <i class="fa-solid fa-compass text-teal-400"></i>
                <span>旅行管家</span>
            </div>
            <nav class="flex-1 space-y-2">
                <a href="#" class="flex items-center p-3 bg-white/10 rounded-xl font-bold transition-all"><i class="fa-solid fa-chart-line w-6"></i>數據概覽</a>
                <a href="#" class="flex items-center p-3 hover:bg-white/5 rounded-xl transition-all"><i class="fa-solid fa-map-location-dot w-6"></i>行程管理</a>
                <a href="#" class="flex items-center p-3 hover:bg-white/5 rounded-xl transition-all"><i class="fa-solid fa-user-tag w-6"></i>業務管理</a>
                <a href="#" class="flex items-center p-3 hover:bg-white/5 rounded-xl transition-all"><i class="fa-solid fa-clipboard-list w-6"></i>成交紀錄</a>
            </nav>
            <div class="text-[10px] text-white/30 mt-auto pt-6 border-t border-white/10 tracking-widest uppercase">Cloud SaaS v2.5.0</div>
        </aside>

        <main class="flex-1 p-10">
            <header class="flex justify-between items-center mb-10">
                <div>
                    <h2 class="text-3xl font-black text-slate-800">系統數據概覽</h2>
                    <p class="text-slate-400 text-sm mt-1">連線狀態：<span class="text-teal-500 font-bold">已成功對接 Cloudflare</span></p>
                </div>
                <div class="w-12 h-12 bg-slate-200 rounded-2xl border-4 border-white shadow-sm overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar">
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">總成交額</p>
                    <div class="flex items-baseline gap-1"><span class="text-slate-400 text-sm font-bold">$</span><h3 class="text-3xl font-black text-slate-800">1,280,000</h3></div>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">會員總數</p>
                    <h3 class="text-3xl font-black text-slate-800">482</h3>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">名片分享</p>
                    <h3 class="text-3xl font-black text-slate-800">1,592</h3>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">AI 解析量</p>
                    <h3 class="text-3xl font-black text-slate-800">85</h3>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                <div class="flex justify-between items-center mb-8">
                    <h4 class="font-black text-xl text-slate-800">即時活動追蹤 (ACTMASTER)</h4>
                </div>
                <div class="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p class="text-slate-400">目前尚無活動紀錄，請在 LINE 傳送訊息進行測試。</p>
                </div>
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
    const path = url.pathname.toLowerCase();

    // 🔴 1. 修復變數名稱兼容性 (對應您的截圖)
    const secureEnv = {
      ...env,
      PEXELS_API_KEY: env["pexels._api"] || env.PEXELS_API_KEY,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || env.GOOGLE_SERVICE_ACCOUN,
      LINE_CHANNEL_ACCESS_TOKEN: env.LINE_CHANNEL_ACCESS_TOKEN
    };

    // 🔴 2. 暴力路由：只要網址中包含 admin 或是以 admin 結尾
    if (method === "GET" && (path.includes('admin') || url.href.toLowerCase().includes('admin'))) {
      return new Response(adminHTML, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // 🔴 3. 處理 LINE Webhook (POST)
    if (method === 'POST') {
      try {
        const body = await request.json();
        // 直接調用核心處理模組，並傳入修復後的 secureEnv
        return await runAgent(body, secureEnv);
      } catch (e) {
        return new Response("OK", { status: 200 });
      }
    }

    // 🟡 4. 預設備援 (首頁 JSON)
    return new Response(JSON.stringify({
      status: "active",
      engine: "TravelKeeper-Unified-Core",
      detected_path: url.pathname,
      full_url: url.href,
      debug_info: "如果您沒看到管理後台，請確認網址最後有加 /admin"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
