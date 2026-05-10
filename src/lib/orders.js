import {
  dealerOrderEndpoint,
  logFrontendApiConfig,
} from './env'

const compactText = (value) =>
  typeof value === 'string' ? value.trim() : ''

const normalizeDealerItems = (payload) => {
  if (Array.isArray(payload?.items)) {
    return payload.items.map((item) => ({
      id: compactText(item?.id),
      code: compactText(item?.code),
      productCode:
        compactText(item?.productCode) ||
        compactText(item?.product_code) ||
        compactText(item?.raw?.code) ||
        compactText(item?.raw?.code_1C),
      name: compactText(item?.name),
      price: Number(item?.price) || 0,
      quantity: Number(item?.quantity) || 0,
      priceType:
        compactText(item?.priceType) ||
        compactText(item?.price_type) ||
        compactText(item?.raw?.price_type),
      priceTypeCode:
        compactText(item?.priceTypeCode) ||
        compactText(item?.price_type_code) ||
        compactText(item?.raw?.price_type_code),
      warehouseCode:
        compactText(item?.warehouseCode) ||
        compactText(item?.warehouse_code) ||
        compactText(item?.raw?.warehouseCode) ||
        compactText(item?.raw?.warehouse_code),
      raw: item?.raw,
    }))
  }

  if (Array.isArray(payload?.cart)) {
    return payload.cart.map((item) => ({
      id: compactText(item?.id),
      code: compactText(item?.code),
      productCode:
        compactText(item?.productCode) ||
        compactText(item?.product_code) ||
        compactText(item?.raw?.code) ||
        compactText(item?.raw?.code_1C),
      name: compactText(item?.name),
      price: Number(item?.price) || 0,
      quantity: Number(item?.quantity) || 0,
      priceType:
        compactText(item?.priceType) ||
        compactText(item?.price_type) ||
        compactText(item?.raw?.price_type),
      priceTypeCode:
        compactText(item?.priceTypeCode) ||
        compactText(item?.price_type_code) ||
        compactText(item?.raw?.price_type_code),
      warehouseCode:
        compactText(item?.warehouseCode) ||
        compactText(item?.warehouse_code) ||
        compactText(item?.raw?.warehouseCode) ||
        compactText(item?.raw?.warehouse_code),
      raw: item?.raw,
    }))
  }

  return []
}

export const buildDealerOrderPayload = (payload) => ({
  dealerId: compactText(payload?.dealerId) || compactText(payload?.dealer_id),
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
  const endpoint = dealerOrderEndpoint

  logFrontendApiConfig()
  console.info(`[Dealer Order] Sending order to ${endpoint}`)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealerPayload),
  })

  return parseJsonResponse(response, "Buyurtmani yuborib bo'lmadi.")
}
