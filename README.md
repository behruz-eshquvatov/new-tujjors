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
- `VITE_DEALER_SITE_LINK`
- `VITE_DEALER_ORDER_DIRECT_URL`
- `SALESDOC_BASE_URL`
- `DEALER_ORDER_ENDPOINT`
- `SALESDOC_PRICE_TYPE_ID`
- `SALESDOC_LOGIN`
- `SALESDOC_PASSWORD`

## Build

- `npm run build`
- `npm run preview`

## Netlify

- Netlify `dist` bilan birga `netlify/functions` papkasidagi serverless endpointlarni ham deploy qiladi.
- Netlify environment variables ichida kamida `SALESDOC_BASE_URL`, `SALESDOC_PRICE_TYPE_ID`, `SALESDOC_LOGIN`, `SALESDOC_PASSWORD`, `VITE_SALESDOC_ASSET_BASE_URL` ni kiriting.
- Dealer buyurtma servisi ishlatilsa, `DEALER_ORDER_ENDPOINT` ni ham kiriting.
- Agar dealer backend `link` orqali dealer topayotgan bo'lsa, `VITE_DEALER_SITE_LINK` ga backendda ro'yxatdan o'tgan aniq sayt URL manzilini kiriting.
- Frontend dealer ID ni URL path dan oladi. Masalan `site/tvMxtrl0zP` bo'lsa, `tvMxtrl0zP` dealer link sifatida ishlatiladi.
- Agar lokal `http://localhost` muhitida browserdan to'g'ridan-to'g'ri dealer endpointga urmoqchi bo'lsangiz, `VITE_DEALER_ORDER_DIRECT_URL` dan foydalaning. HTTPS saytda browser mixed-content sababli bundan foydalana olmaydi.
- `VITE_API_BASE_URL` ni Netlify'da bo'sh qoldiring yoki umuman bermang, shunda frontend shu domen ichidagi `/api/...` endpointlarga murojaat qiladi.
