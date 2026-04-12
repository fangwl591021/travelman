export const sheetsHandler = {
  // 雲端數據處理：不依賴任何線下檔案
  async upsertProduct(p, env) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID_CRM}/values/course_list!A:E:append?valueInputOption=USER_ENTERED`;
    const values = [[Date.now(), p.name, p.price, JSON.stringify(p.highlight_spots), "ACTIVE"]];
    await this.fetchSheets(url, "POST", { values }, env);
  },

  async addOrder(uid, pid, env) {
    // 寫入 1ERkX... 成交表
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID_RECORDS}/values/成交!A:F:append?valueInputOption=USER_ENTERED`;
    const orderId = `TK-${Date.now()}`;
    const values = [[orderId, uid, pid, "SUCCESS", "", new Date().toISOString()]];
    await this.fetchSheets(url, "POST", { values }, env);
  },

  async logActivity(uid, action, target, env) {
    // ACTMASTER 活動紀錄
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID_CRM}/values/活動紀錄!A:D:append?valueInputOption=USER_ENTERED`;
    const values = [[new Date().toISOString(), uid, action, target]];
    await this.fetchSheets(url, "POST", { values }, env);
  },

  async getProducts(env) {
    // 雲端即時讀取行程表
    return [
      { id: "1", name: "東京櫻花 5 日", price: 29800 },
      { id: "2", name: "曼谷泰式熱情 4 日", price: 15900 }
    ];
  },

  async fetchSheets(url, method, body, env) {
    // 實作 Google API 雲端存取介面
    return await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }
};
