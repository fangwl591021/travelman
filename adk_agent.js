/**
 * 旅行管家 - 核心回覆邏輯 (v7.1.2)
 */
import { flexLib } from './message_templates.js';
import { aiGateway } from './ai_gateway.js';

export async function runAgent(body, env) {
  if (!body.events || body.events.length === 0) return new Response("OK", { status: 200 });
  const event = body.events[0];
  if (!event || !event.replyToken) return new Response("OK", { status: 200 });

  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const userText = (event.message?.text || "").trim();

  if (userText === "9") {
    let report = "系統自檢報告 v7.1.2\n--------------------\n";
    const checkKey = (key) => env[key] ? "配置正常" : "尚未設定";
    report += `OPENAI API: ${checkKey("OPENAI_API_KEY")}\n`;
    report += `LINE TOKEN: ${checkKey("LINE_CHANNEL_ACCESS_TOKEN")}\n`;
    report += `PEXELS API: ${checkKey("PEXELS_API_KEY")}\n`;
    try {
      const list = await env.TRAVEL_DB.list({ limit: 1 });
      report += `TRAVEL_DB: 已連線 (${list.keys.length} 筆資料)\n`;
    } catch (e) {
      report += `TRAVEL_DB: 連線失敗\n`;
    }
    report += `CRM SHEET: ${env.SHEET_ID_CRM ? "已配置" : "缺失"}\n`;
    report += `--------------------\nUID: ${userId}\n狀態：運作中`;
    await replyToLine(replyToken, [{ type: "text", text: report }], env);
    return new Response("OK", { status: 200 });
  }

  if (userText === "測試" || userText.toLowerCase() === "uid") {
    await replyToLine(replyToken, [{ type: "text", text: `✅ 連線成功！\nUID: ${userId}` }], env);
    return new Response("OK", { status: 200 });
  }

  const keywords = ["行程", "推薦", "好玩", "旅遊", "多少錢", "去哪"];
  const isTravelQuery = keywords.some(k => userText.includes(k));

  if (isTravelQuery) {
    try {
      const list = await env.TRAVEL_DB.list({ limit: 10 });
      const products = await Promise.all(list.keys.map(k => env.TRAVEL_DB.get(k.name).then(JSON.parse)));
      if (products.length > 0) {
        const productInfo = products.map(p => `【${p.title}】$${p.price}`).join('\n');
        const aiReply = await aiGateway.callGPT4o("你是專業旅遊管家。親切回應客人的旅遊詢問。不要使用標題符號，要像在聊天。", `客人問：${userText}\n現有行程：\n${productInfo}`, env);
        await replyToLine(replyToken, [{ type: "text", text: aiReply }, { type: "flex", altText: "精選旅遊行程", contents: flexLib.productCarousel(products) }], env);
      } else {
        await replyToLine(replyToken, [{ type: "text", text: "目前尚未發佈新的行程，歡迎直接告訴我您想去哪裡玩！" }], env);
      }
    } catch (e) {
      await replyToLine(replyToken, [{ type: "text", text: "系統忙碌中，請稍後再詢問行程。" }], env);
    }
    return new Response("OK", { status: 200 });
  }

  const welcome = await aiGateway.callGPT4o("你是旅遊管家。用戶目前沒有詢問特定行程，請禮貌問候並告知你可以提供建議或解析 DM。", `用戶說: "${userText}"`, env);
  await replyToLine(replyToken, [{ type: "text", text: welcome }], env);
  return new Response("OK", { status: 200 });
}

async function replyToLine(replyToken, messages, env) {
  const token = env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages })
  });
}
