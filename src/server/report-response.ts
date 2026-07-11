import { ZodError } from "zod";

import type { ManuReport } from "@/data/manu-report.schema";

type ReportLoader = () => ManuReport;

export function createReportResponse(loadReport: ReportLoader): Response {
  try {
    return Response.json(loadReport(), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const validationFailed = error instanceof ZodError;

    return Response.json(
      {
        error: {
          code: validationFailed
            ? "REPORT_VALIDATION_FAILED"
            : "REPORT_LOAD_FAILED",
          message: "The MANU report data is currently unavailable.",
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}