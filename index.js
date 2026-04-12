import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

/**
 * 旅行管家 - 核心路由整合版 (修復 WP 轉發與變數兼容)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const path = url.pathname.toLowerCase();

    // 🔴 1. 變數名稱兼容性校正 (對應您的截圖名稱)
    const secureEnv = {
      ...env,
      PEXELS_API_KEY: env["pexels._api"] || env.PEXELS_API_KEY,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || env.GOOGLE_SERVICE_ACCOUN,
      LINE_CHANNEL_ACCESS_TOKEN: env.LINE_CHANNEL_ACCESS_TOKEN,
      WP_WEBHOOK_URL: env.WP_WEBHOOK_URL
    };

    // 🔴 2. 管理後台路由 (只要網址包含 admin 即可進入)
    if (method === "GET" && (path.includes('admin') || url.href.toLowerCase().includes('admin'))) {
      return new Response(adminHTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 🔴 3. 處理 LINE Webhook (POST)
    if (method === 'POST') {
      try {
        const body = await request.json();
        const event = body.events?.[0];

        if (!event) return new Response("OK", { status: 200 });

        const userText = event.message?.text || "";
        
        // 判定是否為 AI 處理範疇 (旅遊關鍵字、圖片 OCR、或是 postback)
        const isAIIntent = /報名|行程|推薦|活動|查詢|我的|分潤|測試|uid/i.test(userText) || 
                          event.message?.type === "image" || 
                          event.type === "postback";

        if (isAIIntent) {
          // A. 進入 AI 旅遊管家邏輯
          return await runAgent(body, secureEnv);
        } else {
          // B. 非 AI 內容：100% 轉發給您的 WordPress 系統
          return await handleWPProxy(request, body, secureEnv);
        }
      } catch (e) {
        // 出錯時回傳 200 避免 LINE 停用 Webhook，但在日誌紀錄錯誤
        console.error("Webhook Error:", e.message);
        return new Response("OK", { status: 200 });
      }
    }

    // 🟡 4. 預設備援 (根目錄 JSON)
    return new Response(JSON.stringify({
      status: "active",
      engine: "TravelKeeper-Unified-Core",
      detected_path: url.pathname,
      time: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
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
                    <div class="flex items-baseline gap-1">
                        <span class="text-slate-400 text-sm font-bold">$</span>
                        <h3 class="text-3xl font-black text-slate-800">1,280,000</h3>
                    </div>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">會員總數</p>
                    <h3 class="text-3xl font-black text-slate-800">482</h3>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 shadow-teal-900/5">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">分享次數</p>
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
                <div class="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400">
                    目前尚無活動紀錄，請在 LINE 傳送訊息進行測試。
                </div>
            </div>
        </main>
    </div>
</body>
</html>
`;
