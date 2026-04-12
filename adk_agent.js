/**
 * 旅行管家 - 最速測試回覆版
 * 排除所有外部模組干擾，僅測試 LINE 訊息連通性
 */
export async function runAgent(body, env) {
  const event = body.events[0];
  
  // 1. 如果是 LINE 的 Verify 請求，直接給 200 OK
  if (!event || !event.replyToken) {
    return new Response("OK", { status: 200 });
  }

  const userId = event.source.userId;
  const replyToken = event.replyToken;

  // 2. 建構測試訊息 (不包框、原生資訊流格式)
  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: `連線成功！\n您的 UID：${userId}\n系統狀態：已對接 Cloudflare`
      }
    ]
  };

  // 3. 呼叫 LINE API
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    // 偵錯日誌：可以在 Cloudflare Dashboard 看到結果
    const resData = await response.json();
    console.log("LINE API Response:", resData);

  } catch (error) {
    console.error("Fetch Error:", error);
  }

  return new Response("OK", { status: 200 });
}
