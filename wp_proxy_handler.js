export async function handleWPProxy(request, body, env) {
  const signature = request.headers.get("X-Line-Signature");
  try {
    return await fetch(env.WP_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": signature || ""
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error("WP Proxy Fail:", e);
  }
}
