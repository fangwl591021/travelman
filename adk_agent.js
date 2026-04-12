import { aiGateway } from './ai_gateway.js';
import { sheetsHandler } from './google_sheets_handler.js';
import { actionHandler } from './action_handler.js';
import { flexLib } from './message_templates.js';
import { sendTelegram } from './telegram_notifier.js';

export async function runAgent(event, env) {
  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const userText = event.message?.text || "";

  // 1. 基礎連線測試：抓取 UID (純文字原生格式)
  if (userText === "測試" || userText.toLowerCase() === "uid") {
    const testMessage = `連線成功\n您的 UID：${userId}`;
    await replyToLine(replyToken, testMessage, null, env);
    return;
  }

  // 2. 處理圖像 (OCR 解析)
  if (event.message?.type === "image") {
    const imgData = await getLineImage(event.message.id, env);
    const prompt = "請解析此旅遊海報，輸出 JSON 格式：{name, price, days, highlights}";
    const result = await aiGateway.callGemini(prompt, imgData, env);
    
    try {
      const product = JSON.parse(result.replace(/```json|```/g, ""));
      await sheetsHandler.upsertProduct(product, env);
      await replyToLine(replyToken, `✅ 已成功解析行程並自動上架至系統。`, null, env);
      await sendTelegram(`🔔 雲端新行程上架：${product.name}`, env);
    } catch (e) {
      await replyToLine(replyToken, "解析發生錯誤，請確保圖片文字清晰。", null, env);
    }
    return;
  }

  // 3. 處理 Postback (報名活動)
  if (event.type === "postback") {
    const params = new URLSearchParams(event.postback.data);
    const action = params.get("action");
    const id = params.get("id");

    if (action === "signup") {
      await sheetsHandler.addOrder(userId, id, env);
      await actionHandler.track(userId, "SIGN_UP", id, env);
      await replyToLine(replyToken, "🎉 報名成功！行程管家已為您保留名額。", null, env);
    }
    return;
  }

  // 4. 名片與分潤功能
  if (userText.includes("名片") || userText.includes("分潤")) {
    const liffUrl = `https://liff.line.me/${env.LIFF_ID}`;
    await replyToLine(replyToken, "點擊下方連結生成您的專屬推薦名片：", flexLib.shareBtn(liffUrl), env);
    return;
  }

  // 5. 預設 GPT-4o 導購推理
  const systemPrompt = "你是一位專業旅遊管家。請根據需求推薦。若需展示行程列表，請在結尾加上 [FLEX_LIST]";
  const aiResponse = await aiGateway.callGPT4o(systemPrompt, userText, env);
  
  let flex = null;
  if (aiResponse.includes("[FLEX_LIST]")) {
    const products = await sheetsHandler.getProducts(env);
    flex = flexLib.productCarousel(products);
  }

  await replyToLine(replyToken, aiResponse.replace("[FLEX_LIST]", ""), flex, env);
}

async function getLineImage(id, env) {
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${id}/content`, {
    headers: { "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` }
  });
  const buffer = await res.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function replyToLine(replyToken, text, flex, env) {
  const messages = [{ type: "text", text: text }];
  if (flex) messages.push({ type: "flex", altText: "查看精選行程", contents: flex });
  
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` 
    },
    body: JSON.stringify({ replyToken, messages })
  });
}
