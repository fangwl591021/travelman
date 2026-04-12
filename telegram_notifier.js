export async function sendTelegram(text, env) {
  if (!env.TG_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TG_CHAT_ID,
      text: `🔔 旅行管家系統通知：\n\n${text}`
    })
  });
}
