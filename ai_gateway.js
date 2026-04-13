/**
 * 旅行管家 - AI 溝通模組 (v7.4.1)
 */
export const aiGateway = {
  async callGPT4o(system, user, env) {
    const key = env.OPENAI_API_KEY;
    if (!key) return "系統 API 未配置。";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: 0.7
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "AI 暫時無法回應。";
    } catch (e) {
      return "系統繁忙，請稍候。";
    }
  }
};
