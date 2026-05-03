import dotenv from "dotenv";

import { fetchDealerConfig, resolveDealerId } from "../../server/dealerApi.js";
import { fetchSalesDocCatalog } from "../../server/salesDoc.js";

dotenv.config({ quiet: true });

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({
        status: false,
        error: "Method Not Allowed",
      }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const dealerConfig = await fetchDealerConfig(resolveDealerId(payload));
    const data = await fetchSalesDocCatalog(dealerConfig);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: error?.statusCode || 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        status: false,
        error: "Failed to fetch SalesDoc catalog",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
