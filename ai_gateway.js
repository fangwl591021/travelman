/**
 * 旅行管家 - AI 溝通模組
 */
export const aiGateway = {
  // 通用 GPT-4o 呼叫器
  async callGPT4o(system, user, env) {
    if (!env.OPENAI_API_KEY) return "抱歉，系統尚未設定 API Key。";
    
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.7
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "AI 暫時無法回應。";
    } catch (e) {
      return "AI 連線發生異常。";
    }
  }
};
