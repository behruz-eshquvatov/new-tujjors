const readEnv = (key, fallback = '') => {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : fallback
}

const apiBaseUrl = readEnv('VITE_API_BASE_URL', '')
const salesDocAssetBaseUrl = readEnv('VITE_SALESDOC_ASSET_BASE_URL', '')
const directDealerOrderUrl = readEnv('VITE_DEALER_ORDER_DIRECT_URL', '')
let hasLoggedApiConfig = false

const getBrowserOrigin = () =>
  typeof window !== 'undefined' ? window.location.origin : ''

export const frontendApiBaseUrl = apiBaseUrl || getBrowserOrigin()
export const frontendApiSource = apiBaseUrl ? 'VITE_API_BASE_URL' : 'same-origin'

export const logFrontendApiConfig = () => {
  if (hasLoggedApiConfig || typeof window === 'undefined') {
    return
  }

  hasLoggedApiConfig = true

  console.info(
    `[API] Browser is using ${frontendApiBaseUrl} via ${frontendApiSource}. DEALER_API_BASE_URL is used on the server side.`,
  )
}

export const appConfig = {
  title: readEnv('VITE_APP_TITLE', 'New Tujjors'),
  subtitle: readEnv('VITE_APP_SUBTITLE', ''),
  currency: readEnv('VITE_APP_CURRENCY', "so'm"),
}

export const healthEndpoint = `${apiBaseUrl}/health`
export const salesDocLoginEndpoint = `${apiBaseUrl}/api/salesdoc/login`
export const salesDocProductsEndpoint = `${apiBaseUrl}/api/salesdoc/products`
export const dealerOrderEndpoint = `${apiBaseUrl}/api/dealers/send-order`
export const salesDocAssetBaseEndpoint = salesDocAssetBaseUrl
export const directDealerOrderEndpoint = directDealerOrderUrl
