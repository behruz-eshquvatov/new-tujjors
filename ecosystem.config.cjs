module.exports = {
  apps: [
    {
      name: "savdo-tujjors",
      script: "server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        DEALER_API_BASE_URL: "https://tujjors.uz",
        DEALER_ORDER_ENDPOINT: "https://tujjors.uz/api/dealers/send-order/",
      },
    },
  ],
};
