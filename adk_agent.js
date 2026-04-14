/**
 * 旅行管家 - 核心回覆邏輯 (v11.9.0 旗艦不縮水版)
 * 小華（後端）：負責 Webhook 分發、夥伴註冊高權限攔截。
 * 修正：輸入「夥伴註冊」優先回傳純文字「歡迎申請」，確保通道暢通。
 */
import { flexLib } from './message_templates.js';
import { aiGateway } from './ai_gateway.js';
import { sheetsHandler } from './google_sheets_handler.js';

export async function runAgent(body, env) {
  if (!body.events || body.events.length === 0) return new Response("OK", { status: 200 });
  const event = body.events[0];
  if (!event || !event.replyToken) return new Response("OK", { status: 200 });

  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const userText = (event.message?.text || "").trim();

  // --- 【最高優先級 1】系統診斷 (輸入 9) ---
  if (userText === "9") {
    const list = await env.TRAVEL_DB.list({ limit: 1 });
    let report = `系統自檢 v11.9.0\n------------------\n`;
    report += `KV 資料庫: ${list.keys.length > 0 ? "OK" : "CONNECTED (EMPTY)"}\n`;
    report += `伙伴功能: 已提權至最高\n`;
    report += `文字診斷: 已啟用\n`;
    report += `------------------\nUID: ${userId}`;
    await replyToLine(replyToken, [{ type: "text", text: report }], env);
    return new Response("OK", { status: 200 });
  }

  // --- 【最高優先級 2】夥伴註冊偵測 (文字診斷優先) ---
  const partnerKws = ["夥伴註冊", "加盟", "經銷", "代碼", "註冊夥伴"];
  if (partnerKws.some(k => userText.includes(k))) {
    // 優先發送純文字測試通道
    await replyToLine(replyToken, [
        { type: "text", text: "歡迎申請夥伴計畫！正在開啟註冊通道..." },
        { 
          type: "flex", 
          altText: "銷售夥伴申請", 
          contents: {
            "type": "bubble", "size": "sm",
            "body": {
              "type": "box", "layout": "vertical", "paddingAll": "20px",
              "contents": [
                { "type": "text", "text": "金牌銷售夥伴招募", "size": "md", "color": "#003b95" },
                { "type": "text", "text": "申請獲得專屬經銷代碼，將優質行程分享給好友，開啟合作。", "size": "sm", "color": "#888888", "margin": "md", "wrap": true }
              ]
            },
            "footer": {
              "type": "box", "layout": "vertical", "paddingAll": "10px",
              "contents": [
                { "type": "button", "action": { "type": "uri", label: "立即註冊", uri: "https://fangwl591021.github.io/travelman/index.html?view=partner" }, "style": "primary", "color": "#06c755", "height": "sm" }
              ]
            }
          }
        }
    ], env);
    return new Response("OK", { status: 200 });
  }

  // --- 【中權限 3】最近行程 (GIGA 闊幕入口) ---
  if (userText.includes("最近有什麼好玩的行程")) {
    await replyToLine(replyToken, [{
        type: "flex", altText: "環遊世界導覽", 
        contents: {
          "type": "bubble", "size": "giga",
          "body": {
            "type": "box", "layout": "vertical", "paddingAll": "0px",
            "contents": [{ "type": "image", "url": "https://voom-obs.line-scdn.net/hb2QpbShzIRw3ZTISDjMmZRBdKjMTYntKLAoJPBlwAy0-ZgoDOxkzJjJWHyURZgpJKzAScyJ7CC0gXA0IOzQBOCJVa28pchlIOyQCJxlsYms/L1080x1920", "size": "full", "aspectMode": "cover", "aspectRatio": "253:170" }]
          }
        },
        quickReply: { items: ["亞洲","歐洲","美洲","大洋洲","非洲","中東","南極"].map(r => ({ type: "action", action: { type: "message", label: r, text: r } })) }
    }], env);
    return new Response("OK", { status: 200 });
  }

  // --- 【一般權限 4】行程推薦關鍵字 ---
  const keywords = ["推薦", "行程", "旅遊", "多少錢", "去哪"];
  if (keywords.some(k => userText.includes(k))) {
    try {
        const list = await env.TRAVEL_DB.list({ limit: 10 });
        const courses = await Promise.all(list.keys.map(async k => {
            const v = await env.TRAVEL_DB.get(k.name);
            if (!v) return null;
            const d = JSON.parse(v); d.id = k.name; return d;
        }));
        const validCourses = courses.filter(Boolean);
        if (validCourses.length > 0) {
            await replyToLine(replyToken, [
                { type: "flex", altText: "精選推薦", contents: flexLib.productCarousel(validCourses) }
            ], env);
        } else {
            await replyToLine(replyToken, [{ type: "text", text: "目前尚未有公開行程，請稍後再試。" }], env);
        }
    } catch(e) { await replyToLine(replyToken, [{ type: "text", text: "系統繁忙中。" }], env); }
    return new Response("OK", { status: 200 });
  }

  // --- 【低權限 5】預設招呼 ---
  const welcome = await aiGateway.callGPT4o(
    "旅遊管家。簡單招呼，告知輸入『推薦』看行程或『夥伴註冊』申請加入。",
    `用戶說：${userText}`, env
  );
  await replyToLine(replyToken, [{ type: "text", text: welcome }], env);
  return new Response("OK", { status: 200 });
}

async function replyToLine(replyToken, messages, env) {
  const token = env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages })
  });
}
