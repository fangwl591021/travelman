import { handleWPProxy } from './wp_proxy_handler.js';
import { runAgent } from './adk_agent.js';

export default {
  async fetch(request, env) {
    // 支援 PC 端後台管理介面
    const url = new URL(request.url);
    if (url.pathname === "/admin") {
      return new Response(await getAdminHTML(env), { headers: { "Content-Type": "text/html" } });
    }

    if (request.method !== "POST") return new Response("TravelKeeper Active", { status: 200 });

    const body = await request.json();
    const events = body.events || [];

    for (const event of events) {
      const userText = event.message?.text || "";
      
      // 判定 AI 處理範疇 (旅遊管家意圖)
      const isAIIntent = /報名|行程|推薦|活動|查詢|我的/.test(userText) || 
                        event.message?.type === "image" || 
                        event.type === "postback";

      if (isAIIntent) {
        try {
          await runAgent(event, env);
        } catch (e) {
          console.error("AI Agent Error:", e);
        }
      } else {
        // 雙 Webhook Hub: 保留舊有的 WordPress 系統功能
        await handleWPProxy(request, body, env);
      }
    }

    return new Response("OK", { status: 200 });
  }
};

async function getAdminHTML(env) {
  // 這裡可返回 admin_panel.html 的內容
  return "<html><body>旅行社雲端後台載入中...</body></html>";
}
