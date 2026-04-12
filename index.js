/**
 * 旅行管家 - 單檔案終極除錯版
 * 目的：排除所有檔案引用問題，強制定向路由
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    
    // 1. 暴力路由：只要網址包含 admin，不論大小寫、斜槓，直接噴出後台
    if (url.href.toLowerCase().includes('admin')) {
      return new Response(adminHTML, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // 2. 處理 LINE Webhook (POST)
    if (method === 'POST') {
      try {
        const body = await request.json();
        const event = body.events?.[0];

        // 如果是 LINE 的 Verify 請求
        if (!event || !event.replyToken) {
          return new Response("OK", { status: 200 });
        }

        // 直接在 index.js 處理回覆，不經由 adk_agent.js
        const userId = event.source.userId;
        const replyToken = event.replyToken;

        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            replyToken: replyToken,
            messages: [{
              type: "text",
              text: `連線成功！\n您的 UID：${userId}\n模式：單檔案救援模式`
            }]
          })
        });

        return new Response("OK", { status: 200 });
      } catch (e) {
        // 出錯時回傳錯誤訊息給 LINE，方便在日誌查看
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 200, // 保持 200 讓 LINE 不會關閉 Webhook
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. 預設回應 (如果沒中 admin 也不是 POST)
    return new Response(JSON.stringify({
      status: "active",
      engine: "TravelKeeper-Single-File-Debug",
      msg: "如果您看到此畫面，代表網址沒加 /admin",
      detected_url: url.href
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
<body class="bg-slate-50 min-h-screen font-sans">
    <div class="flex">
        <aside class="w-64 bg-[#174a5a] text-white h-screen sticky top-0 flex flex-col p-6 shadow-2xl">
            <div class="text-2xl font-black mb-10 flex items-center gap-3">
                <i class="fa-solid fa-compass text-teal-400"></i>
                <span>旅行管家</span>
            </div>
            <nav class="flex-1 space-y-2">
                <a href="#" class="flex items-center p-3 bg-white/10 rounded-xl font-bold"><i class="fa-solid fa-chart-line w-6"></i>數據概覽</a>
            </nav>
            <div class="text-[10px] text-white/30 mt-auto pt-6 border-t border-white/10 tracking-widest uppercase">Debug Mode v1.0</div>
        </aside>
        <main class="flex-1 p-10">
            <header class="mb-10 text-3xl font-black text-slate-800">救援模式：連線成功</header>
            <div class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                <p class="text-slate-600 font-bold">這是單檔案整合版。如果您看到此畫面：</p>
                <ul class="mt-4 list-disc list-inside text-slate-500 space-y-2">
                    <li>代表 Cloudflare 路由已打通。</li>
                    <li>之前的錯誤是因為 import 其他檔案失敗導致。</li>
                </ul>
            </div>
        </main>
    </div>
</body>
</html>
`;
