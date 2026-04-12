import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

// 將您喜愛的管理後台樣式直接嵌入變數，確保雲端環境能正確讀取
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
<body class="bg-slate-50 min-h-screen font-sans">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-[#174a5a] text-white h-screen sticky top-0 flex flex-col p-6">
            <div class="text-2xl font-black mb-10 flex items-center gap-3">
                <i class="fa-solid fa-compass text-teal-400"></i>
                <span>旅行管家</span>
            </div>
            <nav class="flex-1 space-y-2">
                <a href="#" class="block p-3 bg-white/10 rounded-xl font-bold"><i class="fa-solid fa-chart-line mr-3"></i>數據概覽</a>
                <a href="#" class="block p-3 hover:bg-white/5 rounded-xl"><i class="fa-solid fa-map-location-dot mr-3"></i>行程管理</a>
                <a href="#" class="block p-3 hover:bg-white/5 rounded-xl"><i class="fa-solid fa-user-tag mr-3"></i>業務管理</a>
                <a href="#" class="block p-3 hover:bg-white/5 rounded-xl"><i class="fa-solid fa-clipboard-list mr-3"></i>成交紀錄</a>
            </nav>
            <div class="text-xs text-white/40 mt-auto pt-6 border-t border-white/10">
                雲端版本 2.5.0
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-10">
            <header class="flex justify-between items-center mb-10">
                <h2 class="text-2xl font-black text-slate-800">系統概況</h2>
                <div class="flex items-center gap-4">
                    <span class="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-slate-500 font-medium">
                        <i class="fa-solid fa-calendar mr-2"></i>2024年 3月
                    </span>
                    <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
                </div>
            </header>

            <!-- Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p class="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">總成交額</p>
                    <h3 class="text-2xl font-black text-slate-800">$1,280,000</h3>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p class="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">會員總數</p>
                    <h3 class="text-2xl font-black text-slate-800">482</h3>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p class="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">分享次數</p>
                    <h3 class="text-2xl font-black text-slate-800">1,592</h3>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p class="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">AI 解析數</p>
                    <h3 class="text-2xl font-black text-slate-800">85</h3>
                </div>
            </div>

            <!-- Activity Logs (ACTMASTER) -->
            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="font-black text-lg text-slate-800">即時活動追蹤 (ACTMASTER)</h4>
                    <button class="text-sm text-[#174a5a] font-bold">查看全部</button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-700">用戶 U821...39 已報名 [東京櫻花季]</p>
                                <p class="text-[10px] text-slate-400">推薦人代碼: REF-8821A</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400">3 分鐘前</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-eye"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-700">用戶 U112...05 正在查看 [曼谷行程]</p>
                                <p class="text-[10px] text-slate-400">來源: 名片分享卡片 (ShareTargetPicker)</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400">12 分鐘前</span>
                    </div>
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
    // 正規化路徑：移除末尾斜槓並轉小寫，確保 /admin, /admin/, /ADMIN 都能對應
    const path = url.pathname.replace(/\/$/, "").toLowerCase();

    // 1. 強制優先處理後台路由
    if (path === "/admin") {
      return new Response(adminHTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 2. 處理 LINE Webhook (POST 請求)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const events = body.events || [];

        for (const event of events) {
          const userText = event.message?.text || "";
          
          // 判定 AI 處理範疇
          const isAIIntent = /報名|行程|推薦|活動|查詢|我的/.test(userText) || 
                            event.message?.type === "image" || 
                            event.type === "postback";

          if (isAIIntent) {
            await runAgent(event, env);
          } else {
            // 轉發至舊系統
            await handleWPProxy(request, body, env);
          }
        }
        return new Response("OK", { status: 200 });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }

    // 3. 預設回應 (存取根目錄或其他未定義路徑時)
    return new Response(JSON.stringify({
      status: "active",
      engine: "TravelKeeper-SaaS-Core",
      path_accessed: url.pathname,
      time: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
