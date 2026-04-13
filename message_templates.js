/**
 * 旅行管家 - 訊息樣式庫 (v7.4.0 完整整理版)
 * 規範：不加粗、不包框、不浪費空間
 */
export const flexLib = {
  // 上稿系統入口
  uploadButton: () => ({
    type: "bubble",
    size: "sm",
    body: {
      type: "box", layout: "vertical",
      contents: [
        { type: "text", text: "智能行程上稿系統", size: "md", color: "#003b95" },
        { type: "text", text: "支援 PPT 截圖與文字擴寫解析", size: "xs", color: "#888888", margin: "sm", wrap: true }
      ],
      paddingAll: "16px"
    },
    footer: {
      type: "box", layout: "vertical",
      contents: [
        { 
          type: "button", 
          action: { type: "uri", label: "立刻開始解析", uri: "https://fangwl591021.github.io/travelman/index.html" },
          style: "primary", color: "#febb02", height: "sm"
        }
      ],
      paddingAll: "8px"
    }
  }),

  // 行程輪播
  productCarousel: (products) => ({
    type: "carousel",
    contents: products.map(p => ({
      type: "bubble",
      size: "micro",
      hero: {
        type: "image",
        url: p.imgUrl || "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?w=400",
        size: "full", aspectMode: "cover", aspectRatio: "4:3"
      },
      body: {
        type: "box", layout: "vertical",
        contents: [
          { type: "text", text: p.title, size: "xs", wrap: true, maxLines: 2, color: "#222222" },
          { 
            type: "box", layout: "baseline", margin: "md",
            contents: [
                { type: "text", text: "NT$", size: "xxs", color: "#999999", flex: 0 },
                { type: "text", text: Number(p.price).toLocaleString(), size: "sm", color: "#d4111e", margin: "xs" }
            ]
          }
        ],
        paddingAll: "10px"
      },
      footer: {
        type: "box", layout: "vertical",
        contents: [
          { 
            type: "button", 
            action: { type: "uri", label: "看行程詳情", uri: `https://fangwl591021.github.io/travelman/travel_website.html?id=${p.id}` },
            style: "link", height: "sm", color: "#003b95"
          }
        ],
        paddingAll: "4px"
      }
    }))
  })
};
