import { dealerOrderEndpoint, directDealerOrderEndpoint } from './env'

const compactText = (value) =>
  typeof value === 'string' ? value.trim() : ''

const normalizeDealerItems = (payload) => {
  if (Array.isArray(payload?.items)) {
    return payload.items.map((item) => ({
      name: compactText(item?.name),
      price: Number(item?.price) || 0,
      quantity: Number(item?.quantity) || 0,
    }))
  }

  if (Array.isArray(payload?.cart)) {
    return payload.cart.map((item) => ({
      name: compactText(item?.name),
      price: Number(item?.price) || 0,
      quantity: Number(item?.quantity) || 0,
    }))
  }

  return []
}

export const buildDealerOrderPayload = (payload) => ({
  name:
    compactText(payload?.name) ||
    compactText(payload?.customer?.name) ||
    compactText(payload?.customer?.customer_name) ||
    compactText(payload?.customer?.customerName),
  phone:
    compactText(payload?.phone) ||
    compactText(payload?.customer?.phone) ||
    compactText(payload?.customer?.customer_phone) ||
    compactText(payload?.customer?.customerPhone),
  link:
    compactText(payload?.link) ||
    compactText(payload?.pageUrl) ||
    compactText(payload?.page_url),
  items: normalizeDealerItems(payload),
})

const parseJsonResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw new Error(payload?.details || payload?.error || fallbackMessage)
  }

  return payload
}

export const submitDealerOrder = async (payload) => {
  const dealerPayload = buildDealerOrderPayload(payload)
  const endpoint =
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    directDealerOrderEndpoint
      ? directDealerOrderEndpoint
      : dealerOrderEndpoint

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealerPayload),
  })

  return parseJsonResponse(response, "Buyurtmani yuborib bo'lmadi.")
}
