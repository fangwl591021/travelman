import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

// 嵌入您喜愛的管理後台 HTML (固定顏色 #174a5a, 框架與文字大小)
const adminHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    <p class="text-slate-400 text-sm mt-1">歡迎回來，這是您今天的營運統計。</p>
                </div>
                <div class="flex items-center gap-4 text-right">
                    <div><p class="text-xs font-bold text-slate-400 uppercase">系統狀態</p><p class="text-sm font-black text-teal-500">正常運作中</p></div>
                    <div class="w-12 h-12 bg-slate-200 rounded-2xl border-4 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar">
                    </div>
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">總成交額</p>
                    <div class="flex items-baseline gap-1"><span class="text-slate-400 text-sm font-bold">$</span><h3 class="text-3xl font-black text-slate-800">1,280,000</h3></div>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100"><p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">會員總數</p><h3 class="text-3xl font-black text-slate-800">482</h3></div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100"><p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">分享次數</p><h3 class="text-3xl font-black text-slate-800">1,592</h3></div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100"><p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">AI 解析數</p><h3 class="text-3xl font-black text-slate-800">85</h3></div>
            </div>

            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                <div class="flex justify-between items-center mb-8">
                    <h4 class="font-black text-xl text-slate-800">即時活動追蹤 (ACTMASTER)</h4>
                    <button class="bg-slate-50 hover:bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-sm font-bold transition-colors">查看全部</button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100/50 group hover:border-[#174a5a]/20 transition-all">
                        <div class="flex items-center gap-5">
                            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all"><i class="fa-solid fa-cart-shopping"></i></div>
                            <div>
                                <p class="text-sm font-bold text-slate-800 uppercase">新訂單：用戶 U821...39 已報名 [東京櫻花季]</p>
                                <p class="text-[10px] text-slate-400 font-medium mt-1">業務推薦人: REF-8821A (來自 GoodService 名片分享)</p>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase bg-white px-3 py-1 rounded-full shadow-sm">3 分鐘前</span>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // 跨域設定 (CORS)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 1. 處理預檢請求 (OPTIONS)
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. PC 端管理後台路由 (優先度最高)
    if (method === "GET" && url.pathname.includes("admin")) {
      return new Response(adminHTML, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 3. 提供前端設定資訊 (LIFF 用)
    if (url.pathname === '/api/config') {
      return new Response(JSON.stringify({ LIFF_ID: env.LIFF_ID || "" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. 處理 AI 內容生成請求 (代理至 GAS)
    if (url.pathname === '/api/process' && method === "POST") {
      const GAS_URL = env.GAS_URL;
      if (!GAS_URL) return new Response("GAS_URL not set", { status: 500 });

      try {
        const clientData = await request.json();
        const enrichedPayload = {
          ...clientData,
          keys: {
            OPENAI_API_KEY: env.OPENAI_API_KEY,
            UNSPLASH_API_KEY: env.UNSPLASH_API_KEY,
            LINE_CHANNEL_ACCESS_TOKEN: env.LINE_CHANNEL_ACCESS_TOKEN,
            PIXABAY_API_KEY: env.PIXABAY_API_KEY,
            PEXELS_API_KEY: env.PEXELS_API_KEY
          }
        };

        const response = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify(enrichedPayload),
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow' 
        });

        const resultText = await response.text();
        return new Response(resultText, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 5. 處理 LINE Webhook (POST 請求至根目錄)
    if (method === "POST" && (url.pathname === "/" || url.pathname === "")) {
      try {
        const body = await request.json();
        const events = body.events || [];
        for (const event of events) {
          const userText = event.message?.text || "";
          const isAIIntent = /報名|行程|推薦|活動|查詢|我的|分潤/.test(userText) || 
                            event.message?.type === "image" || 
                            event.type === "postback";

          if (isAIIntent) {
            await runAgent(event, env);
          } else {
            await handleWPProxy(request, body, env);
          }
        }
        return new Response("OK", { status: 200, headers: corsHeaders });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 預設回應 (Health Check)
    return new Response(JSON.stringify({ 
      status: 'active', 
      engine: 'TravelKeeper-SaaS-Core',
      path: url.pathname
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  },
};
