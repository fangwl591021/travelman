/**
 * 旅行管家 - 核心回覆邏輯 (v7.4.0 完整整理版)
 * 修正：強化 9 號自檢與上傳觸發
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

  // 1. 系統自檢報告 (輸入 9)
  if (userText === "9") {
    const check = (k) => env[k] ? "配置成功" : "尚未設定";
    let report = "系統自檢 v7.4.0\n------------------\n";
    report += `OpenAI API: ${check("OPENAI_API_KEY")}\n`;
    report += `LINE Token: ${check("LINE_CHANNEL_ACCESS_TOKEN")}\n`;
    report += `Pexels Key: ${check("PEXELS_API_KEY")}\n`;
    try {
        const list = await env.TRAVEL_DB.list({ limit: 1 });
        report += `TRAVEL_DB: 已連線 (${list.keys.length} 筆)\n`;
    } catch(e) { report += `TRAVEL_DB: 連線失敗\n`; }
    report += `------------------\nUID: ${userId}\n狀態：良好`;
    await replyToLine(replyToken, [{ type: "text", text: report }], env);
    return new Response("OK", { status: 200 });
  }

  // 2. 測試與 UID
  if (userText === "測試" || userText.toLowerCase() === "uid") {
    await replyToLine(replyToken, [{ type: "text", text: `連線正常\nUID: ${userId}` }], env);
    return new Response("OK", { status: 200 });
  }

  // 3. 上傳解析按鈕 (輸入 上傳)
  if (userText.includes("上傳") || userText.includes("解析") || userText.includes("新增")) {
    await replyToLine(replyToken, [
        { type: "text", text: "請開啟智能解析器進行上稿作業：" },
        { type: "flex", altText: "開啟上稿系統", contents: flexLib.uploadButton() }
    ], env);
    return new Response("OK", { status: 200 });
  }

  // 4. 行程推薦與查詢
  const keywords = ["推薦", "行程", "旅遊", "多少錢", "去哪"];
  if (keywords.some(k => userText.includes(k))) {
    try {
        const list = await env.TRAVEL_DB.list({ limit: 10 });
        const courses = await Promise.all(list.keys.map(k => env.TRAVEL_DB.get(k.name).then(JSON.parse)));
        if (courses.length > 0) {
            const listStr = courses.map(c => `${c.title} ($${c.price})`).join('\n');
            const aiMsg = await aiGateway.callGPT4o(
              "專業旅遊管家。不使用粗體文字。根據行程清單給予口語、熱情的旅遊建議，文字簡明扼要。",
              `用戶說：${userText}\n目前行程：\n${listStr}`,
              env
            );
            await replyToLine(replyToken, [
                { type: "text", text: aiMsg },
                { type: "flex", altText: "精選推薦", contents: flexLib.productCarousel(courses) }
            ], env);
        } else {
            await replyToLine(replyToken, [{ type: "text", text: "目前尚未發布行程，您可以直接詢問旅遊建議！" }], env);
        }
    } catch(e) { await replyToLine(replyToken, [{ type: "text", text: "讀取行程發生錯誤，請稍後再試。" }], env); }
    return new Response("OK", { status: 200 });
  }

  // 5. 預設引導
  const welcome = await aiGateway.callGPT4o(
    "旅遊管家。簡單招呼，告知輸入『推薦』看行程或『上傳』解析文案。",
    `用戶說：${userText}`,
    env
  );
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
