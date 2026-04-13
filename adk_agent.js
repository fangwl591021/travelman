/**
 * 旅行管家 - 核心回覆邏輯 (v7.0.0 整合 AI 導購)
 */
import { flexLib } from './message_templates.js';
import { aiGateway } from './ai_gateway.js';

export async function runAgent(body, env) {
  const event = body.events[0];
  if (!event || !event.replyToken) return new Response("OK", { status: 200 });

  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const userText = event.message?.text || "";

  // 1. 基礎測試
  if (userText === "測試" || userText.toLowerCase() === "uid") {
    await replyToLine(replyToken, [{ type: "text", text: `連線成功！\nUID: ${userId}\n模式: AI 導購整合版` }], env);
    return new Response("OK", { status: 200 });
  }

  // 2. 判斷是否有行程相關關鍵字，觸發 AI 導購
  const keywords = ["行程", "推薦", "想去", "去哪", "旅遊", "多少錢"];
  const isTravelQuery = keywords.some(k => userText.includes(k));

  if (isTravelQuery) {
    try {
      // 從 KV 抓取現有行程清單
      const list = await env.TRAVEL_DB.list();
      const products = await Promise.all(
        list.keys.slice(0, 10).map(async k => {
          const val = await env.TRAVEL_DB.get(k.name);
          return JSON.parse(val);
        })
      );

      if (products.length > 0) {
        // 交給 AI 生成親切的推薦文字
        const productInfo = products.map(p => `名稱: ${p.title}, 價格: ${p.price}, 天數: ${p.days}`).join('\n');
        const aiResponse = await aiGateway.callGPT4o(
          "你是一位親切的專業旅遊管家。請根據現有的行程清單，回應用戶的詢問。文字要簡潔、熱情，並引導用戶點擊下方的卡片查看詳情。",
          `用戶說: "${userText}"\n\n目前有的行程:\n${productInfo}`,
          env
        );

        // 發送 AI 文字 + 動態 Flex 輪播卡片
        await replyToLine(replyToken, [
          { type: "text", text: aiResponse },
          { type: "flex", altText: "為您挑選的精選行程", contents: flexLib.productCarousel(products) }
        ], env);
      } else {
        await replyToLine(replyToken, [{ type: "text", text: "目前尚未發布任何行程，歡迎稍後再詢問！" }], env);
      }
    } catch (e) {
      await replyToLine(replyToken, [{ type: "text", text: "抱歉，我現在有點忙，請稍後再試。" }], env);
    }
    return new Response("OK", { status: 200 });
  }

  // 3. 處理圖像 (OCR 解析行程)
  if (event.message?.type === "image") {
    await replyToLine(replyToken, [{ type: "text", text: "🔍 已收到 DM 圖片，請前往管理後台查看解析進度。" }], env);
    return new Response("OK", { status: 200 });
  }

  // 4. 預設回覆
  const defaultAiRes = await aiGateway.callGPT4o(
    "你是一位旅遊管家。用戶目前沒有詢問具體行程。請簡單問候並告訴他你可以協助解析行程 DM 或提供旅遊建議。",
    `用戶說: "${userText}"`,
    env
  );
  await replyToLine(replyToken, [{ type: "text", text: defaultAiRes }], env);
  
  return new Response("OK", { status: 200 });
}

async function replyToLine(replyToken, messages, env) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ replyToken, messages })
  });
}
