import { apiConfig, appConfig } from './env'

const apiBase = `/${apiConfig.proxyPrefix}`

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== '' && entry != null),
  )

const parseJsonResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage)
  }

  return payload
}

export const loadCatalog = async () => {
  const response = await fetch(`${apiBase}/catalog`)
  const payload = await parseJsonResponse(
    response,
    'Katalogni yuklashda xatolik yuz berdi.',
  )

  return Array.isArray(payload.products) ? payload.products : []
}

export const loadCategories = async () => {
  const response = await fetch(`${apiBase}/categories`)
  const payload = await parseJsonResponse(
    response,
    'Kategoriyalarni yuklashda xatolik yuz berdi.',
  )

  return Array.isArray(payload.categories) ? payload.categories : []
}

export const loadSubCategories = async () => {
  const response = await fetch(`${apiBase}/subcategories`)
  const payload = await parseJsonResponse(
    response,
    'Subkategoriyalarni yuklashda xatolik yuz berdi.',
  )

  return Array.isArray(payload.subCategories) ? payload.subCategories : []
}

const buildComment = ({ customerName, customerPhone, note, cart }) => {
  const lines = []

  if (customerName) {
    lines.push(`Mijoz: ${customerName}`)
  }

  if (customerPhone) {
    lines.push(`Telefon: ${customerPhone}`)
  }

  if (note) {
    lines.push(`Izoh: ${note}`)
  }

  lines.push(
    `Savat: ${cart.map((item) => `${item.name} x ${item.quantity}`).join(', ')}`,
  )

  return lines.join(' | ')
}

const createOrderCode = () => {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `WEB-${stamp}-${randomPart}`
}

export const submitOrder = async ({ cart, customerName, customerPhone, note }) => {
  if (!cart.length) {
    throw new Error("Savatingiz hozircha bo'sh.")
  }

  const response = await fetch(`${apiBase}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cart: cart.map((item) => ({
        ...compactObject(item),
        entity: compactObject(item.entity || {}),
      })),
      customerName,
      customerPhone,
      note,
      clientMeta: {
        code: createOrderCode(),
        comment: buildComment({ customerName, customerPhone, note, cart }),
      },
    }),
  })

  return parseJsonResponse(response, 'Buyurtmani yuborishda xatolik yuz berdi.')
}

export const getFallbackCatalog = () => ({
  products: [],
  message: `${appConfig.title} katalogi hozircha mavjud emas.`,
})
