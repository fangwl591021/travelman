export const aiGateway = {
  // Gemini 2.5 Flash: 處理多模態 (OCR 解析 DM)
  async callGemini(prompt, imageData, env) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          ...(imageData ? [{ inlineData: { mimeType: "image/png", data: imageData } }] : [])
        ]
      }]
    };

    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      const res = await fetch(url, { method: "POST", body: JSON.stringify(payload) });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(r => setTimeout(r, delay));
      retryCount++;
    }
    throw new Error("Gemini API Max Retries Reached");
  },

  // GPT-4o: 處理對話推理與導購邏輯
  async callGPT4o(systemPrompt, userPrompt, env) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content;
  }
};
