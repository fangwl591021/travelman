import { sheetsHandler } from './google_sheets_handler.js';

export const actionHandler = {
  async track(userId, actionType, targetId, env) {
    // ACTMASTER 核心：紀錄行為
    await sheetsHandler.logActivity(userId, actionType, targetId, env);

    // 行為觸發 (例如：打卡贈點、重複點擊加值)
    if (actionType === "VIEW_DETAIL") {
      console.log(`用戶 ${userId} 正在關注行程 ${targetId}`);
    }
  }
};
