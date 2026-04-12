export const flexLib = {
  productCarousel: (products) => ({
    type: "carousel",
    contents: products.map(p => ({
      type: "bubble",
      size: "micro",
      hero: { type: "image", url: "https://fangwl591021.github.io/travelman/assets/sample.jpg", size: "full", aspectRatio: "4:3", aspectMode: "cover" },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: p.name, weight: "bold", size: "sm" },
          { type: "text", text: `NT$ ${p.price}`, color: "#174a5a", size: "xs" }
        ],
        paddingAll: "8px"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "button", action: { type: "postback", label: "立即報名", data: `action=signup&id=${p.id}` }, style: "primary", color: "#174a5a", height: "sm" }
        ]
      }
    }))
  }),
  
  shareCardLink: (url) => ({
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "button", action: { type: "uri", label: "📇 生成分享名片", uri: url }, style: "primary", color: "#174a5a" }
      ]
    }
  })
};
