/**
 * 旅行管家 - 核心回覆邏輯
 * 包含測試 UID、AI 導購、OCR 行程上架
 */
export async function runAgent(body, env) {
  const event = body.events[0];
  if (!event || !event.replyToken) return new Response("OK", { status: 200 });

  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const userText = event.message?.text || "";

  // 1. 抓取 UID 測試 (確保連線成功)
  if (userText === "測試" || userText.toLowerCase() === "uid") {
    await replyToLine(replyToken, `連線成功！\n您的 UID：${userId}\n模式：整合分流版`, env);
    return new Response("OK", { status: 200 });
  }

  // 2. 處理圖像 (OCR 解析行程)
  if (event.message?.type === "image") {
    await replyToLine(replyToken, "🔍 正在解析行程圖，請稍候...", env);
    // 此處應接續 ai_gateway 與 sheetsHandler 邏輯...
    return new Response("OK", { status: 200 });
  }

  // 3. 預設回覆 (或轉交 GPT-4o)
  await replyToLine(replyToken, "您好！我是您的旅遊管家，請問有什麼我可以幫您的？", env);
  return new Response("OK", { status: 200 });
}

async function replyToLine(replyToken, text, env) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: "text", text: text }]
    })
  });
}
