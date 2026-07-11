import type { ManuReport } from "@/data/manu-report.schema";

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type FetchReportOptions = {
  signal?: AbortSignal;
  fetcher?: Fetcher;
};

export class ReportRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportRequestError";
  }
}

export async function fetchManuReport({
  signal,
  fetcher = fetch,
}: FetchReportOptions = {}): Promise<ManuReport> {
  const response = await fetcher("/api/report", {
    cache: "no-store",
    signal,
  });

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new ReportRequestError("报告接口返回了无法解析的数据。");
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "message" in body.error &&
      typeof body.error.message === "string"
        ? body.error.message
        : "报告数据暂时无法读取。";

    throw new ReportRequestError(message);
  }

  return body as ManuReport;
}
