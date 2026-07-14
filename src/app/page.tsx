"use client";

import { useEffect, useState } from "react";

import { ResearchWorkspace } from "@/components/research-workspace";
import type { ManuReport } from "@/data/manu-report.schema";
import { fetchManuReport } from "@/lib/report-client";

type ReportViewState =
  | { status: "loading" }
  | { status: "success"; report: ManuReport }
  | { status: "error"; message: string };

function LoadingState() {
  return (
    <main className="state-screen" aria-busy="true">
      <section className="state-panel" role="status" aria-live="polite">
        <div className="state-brand"><span>M</span><strong>MANU Research</strong></div>
        <p className="eyebrow">Report pipeline</p>
        <h1>正在校验研究对象</h1>
        <p>从 GET /api/report 读取报告，并确认 16 个顶层分区的数据契约。</p>
        <div className="loading-track" aria-hidden="true"><span /></div>
        <div className="loading-map" aria-hidden="true"><span /><span /><span /><span /></div>
      </section>
    </main>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="state-screen">
      <section className="state-panel error-panel" aria-live="assertive">
        <div className="state-brand"><span>!</span><strong>MANU Research</strong></div>
        <p className="eyebrow">Report unavailable</p>
        <h1>暂时无法读取报告</h1>
        <p>{message}</p>
        <p className="error-note">现有数据不会被展示层改写。重试将重新请求同一个本地报告接口。</p>
        <button type="button" onClick={onRetry}>重新加载报告</button>
      </section>
    </main>
  );
}

export default function Home() {
  const [state, setState] = useState<ReportViewState>({ status: "loading" });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchManuReport({ signal: controller.signal })
      .then((report) => setState({ status: "success", report }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "报告数据暂时无法读取。",
        });
      });
    return () => controller.abort();
  }, [requestKey]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") {
    return <ErrorState message={state.message} onRetry={() => { setState({ status: "loading" }); setRequestKey((key) => key + 1); }} />;
  }
  return <ResearchWorkspace report={state.report} />;
}
