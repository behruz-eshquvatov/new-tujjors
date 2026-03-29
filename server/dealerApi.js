const defaultPriceTypeId = "d0_2";

const compactText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeBaseUrl = (value) => {
  const baseUrl = compactText(value);

  if (!baseUrl) {
    throw new Error("Set DEALER_API_BASE_URL before starting the server.");
  }

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
};

export const getDealerApiBaseUrl = () =>
  compactText(process.env.DEALER_API_BASE_URL) || "http://localhost:8005";

const readJsonResponse = async (response) => {
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

export const resolveDealerId = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return compactText(String(value));
  }

  return compactText(value?.dealerId || value?.dealer_id || value?.link);
};

export const fetchDealerConfig = async (dealerId) => {
  const resolvedDealerId = resolveDealerId(dealerId);

  if (!resolvedDealerId) {
    throw new Error("Dealer ID is required.");
  }

  const baseUrl = normalizeBaseUrl(getDealerApiBaseUrl());
  console.log(baseUrl);
  const endpoint = new URL(`api/dealers/info/${resolvedDealerId}/`, baseUrl);
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      readErrorMessage(
        data,
        `Dealer info API rejected the request with status ${response.status}.`,
      ),
    );
  }

  const salesDocBaseUrl = compactText(data?.url);
  const login = compactText(data?.login);
  const password = compactText(data?.password);
  const priceTypeId = compactText(data?.price_type) || defaultPriceTypeId;

  if (!salesDocBaseUrl || !login || !password) {
    throw new Error("Dealer info API returned incomplete SalesDoc credentials.");
  }

  return {
    dealerId: resolvedDealerId,
    salesDocBaseUrl,
    login,
    password,
    priceTypeId,
  };
};
