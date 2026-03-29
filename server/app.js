import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { fetchDealerConfig, resolveDealerId } from "./dealerApi.js";
import { sendDealerOrder } from "./dealerOrder.js";
import { fetchSalesDocCatalog, getSalesDocAuth } from "./salesDoc.js";

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/salesdoc/login", async (request, response) => {
  try {
    const dealerConfig = await fetchDealerConfig(resolveDealerId(request.body || {}));
    const loginData = await getSalesDocAuth(dealerConfig);

    response.json({
      status: true,
      result: loginData,
    });
  } catch (error) {
    response.status(500).json({
      status: false,
      error: "Failed to log in to SalesDoc",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/salesdoc/products", async (request, response) => {
  try {
    const dealerConfig = await fetchDealerConfig(resolveDealerId(request.body || {}));
    const data = await fetchSalesDocCatalog(dealerConfig);

    response.json(data);
  } catch (error) {
    response.status(500).json({
      status: false,
      error: "Failed to fetch SalesDoc catalog",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/dealers/send-order", async (request, response) => {
  try {
    const data = await sendDealerOrder(request.body || {});

    response.json(data);
  } catch (error) {
    response.status(error?.statusCode || 500).json({
      status: false,
      error: "Failed to send dealer order",
      details: error instanceof Error ? error.message : "Unknown error",
      upstream: error?.responsePayload || null,
    });
  }
});

export default app;
