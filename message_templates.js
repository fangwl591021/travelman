/**
 * 旅行管家 - 訊息樣式庫 (v7.1.2)
 */
export const flexLib = {
  productCarousel: (products) => ({
    type: "carousel",
    contents: products.map(p => ({
      type: "bubble",
      size: "micro",
      hero: {
        type: "image",
        url: p.imgUrl || "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?w=640",
        size: "full",
        aspectRatio: "4:3",
        aspectMode: "cover"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: p.title, size: "sm", wrap: true, maxLines: 2 },
          { 
            type: "box", layout: "baseline", margin: "md",
            contents: [
              { type: "text", text: "NT$", size: "xs", color: "#888888", flex: 0 },
              { type: "text", text: Number(p.price).toLocaleString(), size: "md", color: "#d4111e", margin: "sm" }
            ]
          }
        ],
        paddingAll: "12px"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          { 
            type: "button", 
            action: { 
              type: "uri", 
              label: "查看行程", 
              uri: `https://fangwl591021.github.io/travelman/travel_website.html?id=${p.id}` 
            }, 
            style: "primary", color: "#003b95", height: "sm" 
          }
        ],
        paddingAll: "8px"
      }
    }))
  })
};
