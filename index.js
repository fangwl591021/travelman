import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

// 嵌入管理後台 HTML 內容
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
        <!-- 側邊導覽欄 -->
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
            <div class="text-[10px] text-white/30 mt-auto pt-6 border-t border-white/10 tracking-widest uppercase">
                Cloud SaaS Version 2.5.0
            </div>
        </aside>

        <!-- 主要內容區域 -->
        <main class="flex-1 p-10">
            <header class="flex justify-between items-center mb-10">
                <div>
                    <h2 class="text-3xl font-black text-slate-800">系統數據概況</h2>
                    <p class="text-slate-400 text-sm mt-1">歡迎回來，這是您今天的旅行社營運摘要。</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-xs font-bold text-slate-400 uppercase">目前時間</p>
                        <p class="text-sm font-black text-slate-700">${new Date().toLocaleDateString('zh-TW')} ${new Date().toLocaleTimeString('zh-TW')}</p>
                    </div>
                    <div class="w-12 h-12 bg-slate-200 rounded-2xl border-4 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar">
                    </div>
                </div>
            </header>

            <!-- 核心指標卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">總成交額</p>
                    <div class="flex items-baseline gap-1">
                        <span class="text-slate-400 text-sm font-bold">$</span>
                        <h3 class="text-3xl font-black text-slate-800">1,280,000</h3>
                    </div>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">會員總數</p>
                    <h3 class="text-3xl font-black text-slate-800">482 <span class="text-xs text-teal-500 ml-2">+12%</span></h3>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">名片分享次數</p>
                    <h3 class="text-3xl font-black text-slate-800">1,592</h3>
                </div>
                <div class="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">AI 解析總數</p>
                    <h3 class="text-3xl font-black text-slate-800">85</h3>
                </div>
            </div>

            <!-- 即時活動追蹤 (ACTMASTER 核心邏輯展示) -->
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h4 class="font-black text-xl text-slate-800">即時活動追蹤 <span class="text-[#174a5a] text-sm ml-2 font-medium">ACTMASTER Live</span></h4>
                        <p class="text-slate-400 text-xs mt-1">監控所有 LINE 端的用戶互動行為</p>
                    </div>
                    <button class="bg-slate-50 hover:bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-sm font-bold transition-colors">查看完整日誌</button>
                </div>
                
                <div class="space-y-4">
                    <!-- 模擬活動項目 1 -->
                    <div class="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100/50 hover:border-[#174a5a]/20 transition-colors group">
                        <div class="flex items-center gap-5">
                            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-800 uppercase tracking-tight">新訂單：用戶 U821...39 已報名 [東京櫻花季]</p>
                                <p class="text-[10px] text-slate-400 font-medium mt-1">業務推薦人: <span class="text-[#174a5a] font-bold">REF-8821A</span> (GoodService 名片引流)</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] font-bold text-slate-400 uppercase bg-white px-3 py-1 rounded-full shadow-sm">3 分鐘前</span>
                        </div>
                    </div>

                    <!-- 模擬活動項目 2 -->
                    <div class="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100/50 hover:border-[#174a5a]/20 transition-colors group">
                        <div class="flex items-center gap-5">
                            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-lg shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <i class="fa-solid fa-eye"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-800 uppercase tracking-tight">瀏覽行為：用戶 U112...05 正在查看 [曼谷行程詳情]</p>
                                <p class="text-[10px] text-slate-400 font-medium mt-1">來源途徑: <span class="text-blue-500 font-bold font-mono text-[9px]">LIFF_SHARE_PICKER</span></p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] font-bold text-slate-400 uppercase bg-white px-3 py-1 rounded-full shadow-sm">12 分鐘前</span>
                        </div>
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
    const method = request.method.toUpperCase();

    // 🔴 策略改變：優先判斷 GET 且網址包含 "admin" 的所有情況
    if (method === "GET") {
      if (url.pathname.includes("admin")) {
        return new Response(adminHTML, {
          headers: { 
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate"
          }
        });
      }

      // 如果是根目錄或一般網址，回傳系統狀態 (JSON)
      return new Response(JSON.stringify({
        status: "online",
        system: "TravelKeeper AI Core",
        endpoints: {
          admin: "/admin",
          webhook: "(POST only)"
        },
        time: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 🔵 處理 LINE Webhook (POST 請求)
    if (method === "POST") {
      try {
        const body = await request.json();
        const events = body.events || [];

        for (const event of events) {
          const userText = event.message?.text || "";
          
          // 判定 AI 處理範疇 (旅遊管家意圖)
          const isAIIntent = /報名|行程|推薦|活動|查詢|我的|分潤/.test(userText) || 
                            event.message?.type === "image" || 
                            event.type === "postback";

          if (isAIIntent) {
            await runAgent(event, env);
          } else {
            // 雙 Webhook Hub: 轉發至舊系統 (WordPress)
            await handleWPProxy(request, body, env);
          }
        }
        return new Response("OK", { status: 200 });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // 其他方法 (PUT, DELETE 等)
    return new Response("Method Not Allowed", { status: 405 });
  }
};
