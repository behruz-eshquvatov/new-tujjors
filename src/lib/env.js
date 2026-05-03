const readEnv = (key, fallback = '') => {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : fallback
}

const salesDocAssetBaseUrl = readEnv('VITE_SALESDOC_ASSET_BASE_URL', '')
let hasLoggedApiConfig = false

const getBrowserOrigin = () =>
  typeof window !== 'undefined' ? window.location.origin : ''

export const frontendApiBaseUrl = getBrowserOrigin()
export const frontendApiSource = 'same-origin'

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

export const healthEndpoint = '/health'
export const salesDocProductsEndpoint = '/api/salesdoc/products'
export const dealerOrderEndpoint = '/api/dealers/send-order'
export const salesDocAssetBaseEndpoint = salesDocAssetBaseUrl
