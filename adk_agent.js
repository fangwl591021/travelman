export async function runAgent(body, env) {
  const event = body.events[0];
  if (!event) return new Response("No Event", { status: 200 });

  const userId = event.source.userId;
  const replyToken = event.replyToken;

  // 測試連線最速回覆：不管是誰傳什麼，通通回傳 UID
  const message = {
    type: "text",
    text: `連線成功！\n您的 UID：${userId}\n系統狀態：已對接 Cloudflare`
  };

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [message]
    })
  });

  return new Response("OK", { status: 200 });
}
