import assert from "node:assert/strict";

import reportData from "../manu_report.data.json";
import {
  fetchManuReport,
  ReportRequestError,
} from "../src/lib/report-client";

async function main() {
  const success = await fetchManuReport({
    fetcher: async () =>
      new Response(JSON.stringify(reportData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });

  assert.equal(success.meta.ticker, "MANU");
  assert.equal(success.data_quality_notes.length, 5);

  await assert.rejects(
    fetchManuReport({
      fetcher: async () =>
        Response.json(
          {
            error: {
              code: "REPORT_VALIDATION_FAILED",
              message: "The MANU report data is currently unavailable.",
            },
          },
          { status: 500 },
        ),
    }),
    (error: unknown) =>
      error instanceof ReportRequestError &&
      error.message === "The MANU report data is currently unavailable.",
  );

  await assert.rejects(
    fetchManuReport({
      fetcher: async () => new Response("not-json", { status: 200 }),
    }),
    (error: unknown) =>
      error instanceof ReportRequestError &&
      error.message === "报告接口返回了无法解析的数据。",
  );

  console.log("Report client tests passed.");
}

void main();
