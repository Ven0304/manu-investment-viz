import assert from "node:assert/strict";

import reportData from "../manu_report.data.json";
import { manuReportSchema } from "../src/data/manu-report.schema";
import { createReportResponse } from "../src/server/report-response";

async function main() {
  const validReport = manuReportSchema.parse(reportData);
  const successResponse = createReportResponse(() => validReport);
  const successBody = await successResponse.json();

  assert.equal(successResponse.status, 200);
  assert.equal(successResponse.headers.get("cache-control"), "no-store");
  assert.equal(Object.keys(successBody).length, 16);
  assert.ok(Array.isArray(successBody.data_quality_notes));
  assert.equal(successBody.executive_summary.target_price_usd.currency, "USD");
  assert.equal(successBody.executive_summary.target_price_eur.currency, "EUR");
  assert.equal(
    successBody.executive_summary.key_financials_summary.net_debt.currency,
    "GBP",
  );

  const failureResponse = createReportResponse(() => manuReportSchema.parse({}));
  const failureBody = await failureResponse.json();

  assert.equal(failureResponse.status, 500);
  assert.equal(failureResponse.headers.get("cache-control"), "no-store");
  assert.deepEqual(failureBody, {
    error: {
      code: "REPORT_VALIDATION_FAILED",
      message: "The MANU report data is currently unavailable.",
    },
  });

  console.log("Report API response tests passed.");
}

void main();