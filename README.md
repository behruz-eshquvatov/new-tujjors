# NewTujjors

Frontend endi Sales Doctor bilan to'g'ridan-to'g'ri brauzerdan emas, ichki Node proxy orqali ishlaydi. Shu sabab `url`, `login`, `password`, `token` kabi ma'lumotlar foydalanuvchiga ko'rinmaydi.

## Ishga tushirish

1. `.env.example` asosida `.env` tayyorlang.
2. Server uchun `SD_*` qiymatlarini kiriting.
3. Frontend ko'radigan maskalangan yo'l uchun `VITE_API_PROXY_PREFIX=akdnaskds` kabi qiymat bering.
4. `npm run dev` ni ishga tushiring.

`npm run dev` bir vaqtda:

- Vite clientni
- Express proxy serverni

ishga tushiradi.

## Muhim env lar

Public:

- `VITE_APP_TITLE`
- `VITE_APP_SUBTITLE`
- `VITE_APP_CURRENCY`
- `VITE_API_PROXY_PREFIX`

Server-only:

- `SD_API_URL`
- `SD_LOGIN`
- `SD_PASSWORD`
- `SD_LOGIN` + `SD_PASSWORD` tavsiya qilinadi, server tokenni runtime’da yangilab oladi
- ixtiyoriy fallback: `SD_USER_ID` va `SD_TOKEN`
- `SD_FILIAL_ID`
- `SD_TRADE_*`
- `SD_PRICE_TYPE_*`
- `SD_ORDER_CLIENT_*`
- `SD_ORDER_AGENT_*`
- `SD_ORDER_WAREHOUSE_*`

## Build

- `npm run build` client build qiladi
- `npm run start` Express serverni ko'taradi va mavjud bo'lsa `dist` ni ham serve qiladi
