# NewTujjors

Vite + React storefront with a SalesDoc proxy for local Express and Netlify Functions.

## Ishga tushirish

1. `.env.example` asosida `.env` yarating.
2. `npm install` ishlating.
3. `npm run dev` ishlating.

`npm run dev` endi Vite client va Express serverni birga ishga tushiradi, backend fayllari o'zgarsa server avtomatik restart bo'ladi.

## API

- Frontend mahsulotlarni bitta endpoint orqali yuklaydi:
- `POST /api/salesdoc/products`
- Buyurtma yuborish uchun:
- `POST /api/dealers/send-order`

## Env

- `VITE_APP_TITLE`
- `VITE_APP_SUBTITLE`
- `VITE_APP_CURRENCY`
- `VITE_API_BASE_URL`
- `VITE_SALESDOC_ASSET_BASE_URL`
- `VITE_DEALER_ORDER_DIRECT_URL`
- `DEALER_API_BASE_URL`
- `DEALER_ORDER_ENDPOINT`

## Build

- `npm run build`
- `npm run preview`

## Netlify

- Netlify `dist` bilan birga `netlify/functions` papkasidagi serverless endpointlarni ham deploy qiladi.
- Frontend dealer ID ni URL path dan oladi. Masalan `site/tvMxtrl0zP` bo'lsa, `tvMxtrl0zP` dealer ID sifatida ishlatiladi.
- Server SalesDoc login, password, url va `price_type` ni `DEALER_API_BASE_URL/api/dealers/info/{dealerId}/` endpointidan oladi, shuning uchun ularni `.env` ichida saqlash shart emas.
- Dealer info va order API lokalda ishlasa, `DEALER_API_BASE_URL=http://localhost:8005` ni kiriting.
- Dealer buyurtma servisi ishlatilsa, `DEALER_ORDER_ENDPOINT` ni ham kiriting.
- Agar lokal `http://localhost` muhitida browserdan to'g'ridan-to'g'ri dealer endpointga urmoqchi bo'lsangiz, `VITE_DEALER_ORDER_DIRECT_URL` dan foydalaning. HTTPS saytda browser mixed-content sababli bundan foydalana olmaydi.
- `VITE_API_BASE_URL` ni Netlify'da bo'sh qoldiring yoki umuman bermang, shunda frontend shu domen ichidagi `/api/...` endpointlarga murojaat qiladi.
