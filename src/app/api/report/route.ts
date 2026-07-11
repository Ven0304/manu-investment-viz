import { getManuReport } from "@/data/manu-report";
import { createReportResponse } from "@/server/report-response";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return createReportResponse(getManuReport);
}