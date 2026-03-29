const defaultDealerOrderEndpoint =
  process.env.DEALER_ORDER_ENDPOINT ||
  "http://45.94.209.80:8005/api/dealers/send-order/";

const compactText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeCartItem = (item) => {
  const quantity = Number(item?.quantity) || 0;
  const price = Number(item?.price) || 0;

  return {
    name: compactText(item?.name),
    price,
    quantity,
  };
};

const normalizeCustomer = (customer) => ({
  name: compactText(customer?.name) || compactText(customer?.customer_name) || compactText(customer?.customerName),
  phone:
    compactText(customer?.phone) ||
    compactText(customer?.customer_phone) ||
    compactText(customer?.customerPhone),
});

export const buildDealerOrderPayload = (payload) => {
  const customer = normalizeCustomer(payload?.customer || payload);
  const link =
    compactText(payload?.link) ||
    compactText(payload?.pageUrl) ||
    compactText(payload?.page_url);
  const cartItems = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.cart)
      ? payload.cart.map(normalizeCartItem)
      : [];

  return {
    name: customer.name,
    phone: customer.phone,
    link,
    items: cartItems,
  };
};

const readResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const readErrorMessage = (payload, fallbackMessage) => {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail.trim();
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload?.raw === "string" && payload.raw.trim()) {
    return payload.raw.trim();
  }

  return fallbackMessage;
};

export const sendDealerOrder = async (payload) => {
  const dealerPayload = buildDealerOrderPayload(payload);
  const response = await fetch(defaultDealerOrderEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dealerPayload),
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    const error = new Error(
      readErrorMessage(
        data,
        `Dealer order API rejected the request with status ${response.status}.`,
      ),
    );

    error.statusCode = response.status;
    error.responsePayload = data;
    throw error;
  }

  return {
    status: true,
    result: data,
    forwardedTo: defaultDealerOrderEndpoint,
    payload: dealerPayload,
  };
};
