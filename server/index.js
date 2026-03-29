import app from './app.js'
import { getDealerApiBaseUrl } from './dealerApi.js'

const port = Number(process.env.PORT) || 3000
const isDealerApiBaseUrlFromEnv = Boolean(process.env.DEALER_API_BASE_URL?.trim())

app.listen(port, () => {
  console.log(`SalesDoc proxy running at http://localhost:${port}`)
  console.log(
    `Dealer API base URL: ${getDealerApiBaseUrl()} (${isDealerApiBaseUrlFromEnv ? 'from DEALER_API_BASE_URL' : 'fallback default'})`,
  )
})
