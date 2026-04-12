/**
 * WordPress Webhook 轉發處理器
 * 確保將 LINE 的原始訊號完整轉發至舊有 WP 系統
 */
export async function handleWPProxy(request, body, env) {
  const wpUrl = env.WP_WEBHOOK_URL;

  if (!wpUrl) {
    console.error("WP_WEBHOOK_URL is not defined in environment variables.");
    return new Response("WP Proxy Config Missing", { status: 200 });
  }

  // 取得 LINE 原始簽章，確保 WP 端驗證不會失敗
  const signature = request.headers.get("X-Line-Signature") || "";

  try {
    const response = await fetch(wpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": signature
      },
      body: JSON.stringify(body)
    });

    const resText = await response.text();
    return new Response(resText, { 
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("WP Proxy Error:", e.message);
    return new Response("WP Proxy Error", { status: 200 });
  }
}
