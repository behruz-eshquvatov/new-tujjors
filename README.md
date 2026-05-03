# NewTujjors

Vite + React storefront with a SalesDoc proxy for local Express and Netlify Functions.

## Ishga tushirish

1. `.env.example` asosida `.env` yarating.
2. `npm install` ishlating.
3. `npm run dev` ishlating.

`npm run dev` Vite clientni `http://localhost:5173` da, Express API serverni `http://127.0.0.1:3000` da birga ishga tushiradi. Backend fayllari o'zgarsa server avtomatik restart bo'ladi.

Local devda browser `http://localhost:5173` ga kiradi, API esa Vite proxy orqali `http://127.0.0.1:3000` dagi Express serverga o'tadi. Agar Network tabda `/api/...` 502 ko'rsangiz, Express server ishlamayapti; terminalda `npm run dev` ni qayta ishga tushiring yoki alohida `npm run server` ishlatib `http://localhost:3000/health` ni tekshiring.

## API

- Frontend mahsulotlarni bitta endpoint orqali yuklaydi:
- `POST /api/salesdoc/products`
- Buyurtma yuborish uchun:
- `POST /api/dealers/send-order`

## Env

- `VITE_APP_TITLE`
- `VITE_APP_SUBTITLE`
- `VITE_APP_CURRENCY`
- `VITE_SALESDOC_ASSET_BASE_URL`
- `DEALER_API_BASE_URL`
- `DEALER_ORDER_ENDPOINT`

## Build

- `npm run build`
- `npm run preview`

## VPS / Production

- `npm install`
- `npm run build`
- `pm2 start ecosystem.config.cjs`
- PM2 Node API serverni `http://127.0.0.1:3000` da ishga tushiradi.
- Nginx frontend uchun `dist` papkasini serve qiladi.
- Nginx faqat `/api/...` va `/health` requestlarini `http://127.0.0.1:3000` ga proxy qiladi.

Nginx example:

```nginx
server {
    server_name savdo.tujjors.uz;

    root /path/to/new-tujjors/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Netlify

- Netlify `dist` bilan birga `netlify/functions` papkasidagi serverless endpointlarni ham deploy qiladi.
- Frontend dealer ID ni URL path dan oladi. Masalan `site/tvMxtrl0zP` bo'lsa, `tvMxtrl0zP` dealer ID sifatida ishlatiladi.
- Server SalesDoc login, password, url va `price_type` ni `DEALER_API_BASE_URL/api/dealers/info/{dealerId}/` endpointidan oladi, shuning uchun ularni `.env` ichida saqlash shart emas.
- Dealer info va order API default holatda `https://tujjors.uz` orqali ishlaydi.
- Dealer buyurtma servisi ishlatilsa, `DEALER_ORDER_ENDPOINT` ni ham kiriting.
- Frontend buyurtmalarni browserdan to'g'ridan-to'g'ri dealer endpointga yubormaydi; `/api/dealers/send-order` orqali serverless/Express proxy ishlatiladi.
- Frontend API endpointlari doim same-origin ishlaydi, masalan `https://savdo.tujjors.uz/api/...`.
