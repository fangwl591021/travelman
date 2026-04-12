import { aiGateway } from './ai_gateway.js';
import { sheetsHandler } from './google_sheets_handler.js';
import { actionHandler } from './action_handler.js';
import { flexLib } from './message_templates.js';
import { sendTelegram } from './telegram_notifier.js';

export async function runAgent(event, env) {
  const userId = event.source.userId;
  const replyToken = event.replyToken;

  // 1. 全自動 OCR 行程解析 (無須線下操作)
  // 當管理員在 LINE 傳送 DM 連結或圖片，Gemini 直接由雲端網址解析
  if (event.message?.type === "image") {
    const imgData = await getLineImage(event.message.id, env);
    const prompt = "你是專業旅遊管家，請解析此行程圖。輸出格式為 JSON：{name, price, days, highlight_spots}。請確保價格為數字。";
    const result = await aiGateway.callGemini(prompt, imgData, env);
    
    // 解析結果並雲端上架至 Google Sheets
    const product = JSON.parse(result.replace(/```json|```/g, ""));
    await sheetsHandler.upsertProduct(product, env);
    
    await replyToLine(replyToken, `✅ 雲端解析成功！已自動上架行程：\n【${product.name}】\n價格：${product.price}`, null, env);
    await sendTelegram(`🔔 雲端新行程上架：${product.name}\n價格：${product.price}`, env);
    return;
  }

  // 2. 處理 Postback (ACTMASTER 任務與報名)
  if (event.type === "postback") {
    const params = new URLSearchParams(event.postback.data);
    const action = params.get("action");
    const id = params.get("id");

    if (action === "signup") {
      // 串接 Life-Upgrade 的報名邏輯
      await sheetsHandler.addOrder(userId, id, env);
      await actionHandler.track(userId, "SIGNUP", id, env);
      await replyToLine(replyToken, "🎉 報名行程成功！管家已為您鎖定名額，稍後將有專人與您聯繫。", null, env);
      await sendTelegram(`🔥 成交通知！用戶 ${userId} 報名了行程 ${id}`, env);
    }
    return;
  }

  // 3. 旅遊管家對話導購 (GPT-4o 驅動)
  const userText = event.message?.text || "";
  
  // 業務推薦碼生成與名片分享 (goodservice 整合)
  if (userText.includes("名片") || userText.includes("分潤")) {
    const liffUrl = `https://liff.line.me/${env.LIFF_ID}`;
    await replyToLine(replyToken, "✈️ 點擊下方連結生成您的「專屬數位名片」。分享給好友並下單，系統會自動紀錄您的分潤回饋。", flexLib.shareBtn(liffUrl), env);
    return;
  }

  const systemPrompt = "你是一位專業的旅行社管家。請根據用戶喜好推薦行程。若需展示行程列表，請在文字最後附上 [FLEX_LIST]。";
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
  if (flex) messages.push({ type: "flex", altText: "旅遊管家為您準備的行程", contents: flex });
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({ replyToken, messages })
  });
}
