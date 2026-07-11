"use client";

import { useEffect, useState } from "react";

import type {
  ManuReport,
  MonetaryAmount,
} from "@/data/manu-report.schema";
import { fetchManuReport } from "@/lib/report-client";

type ReportViewState =
  | { status: "loading" }
  | { status: "success"; report: ManuReport }
  | { status: "error"; message: string };

const unitSuffix = {
  million: "m",
  billion: "bn",
} as const;

function formatMoney(amount: MonetaryAmount): string {
  const value = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount.value);
  const suffix = amount.unit ? unitSuffix[amount.unit] : "";

  return `${amount.currency} ${value}${suffix}`;
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-6 text-[#181611]">
      <div className="w-full max-w-md" role="status" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c1d28]">
          MANU Investment Report
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          正在加载报告数据
        </h1>
        <div className="mt-8 h-1 overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-2/5 animate-pulse rounded-full bg-[#8c1d28]" />
        </div>
      </div>
    </main>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-6 text-[#181611]">
      <section
        className="w-full max-w-xl border-t-4 border-[#8c1d28] bg-white p-8 shadow-sm"
        aria-live="assertive"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c1d28]">
          Data unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          暂时无法读取报告
        </h1>
        <p className="mt-4 leading-7 text-black/65">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 rounded-sm bg-[#181611] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1d28] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8c1d28]"
        >
          重新加载
        </button>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/25 pt-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
        {label}
      </dt>
      <dd className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function ReportPage({ report }: { report: ManuReport }) {
  const { meta, executive_summary: summary } = report;

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#181611]">
      <header className="border-b border-black/15 bg-[#181611] text-white">
        <div className="mx-auto max-w-6xl px-6 py-5 sm:px-10">
          <div className="flex items-center justify-between gap-6 text-xs font-semibold uppercase tracking-[0.18em]">
            <span>{meta.ticker} Investment Report</span>
            <span className="text-white/55">Validated via /api/report</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8c1d28]">
              Equity Research · {meta.ticker}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-7xl">
              {meta.report_title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/60">
              {meta.subject_company}
            </p>
          </div>
          <div className="border-l-4 border-[#8c1d28] pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">
              Investment rating
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-[#8c1d28]">
              {summary.rating}
            </p>
          </div>
        </div>

        <dl className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="当前价格"
            value={formatMoney(summary.current_price_usd)}
          />
          <MetricCard
            label="目标价 USD"
            value={formatMoney(summary.target_price_usd)}
          />
          <MetricCard
            label="目标价 EUR"
            value={formatMoney(summary.target_price_eur)}
          />
          <MetricCard label="潜在涨幅" value={`${summary.upside_pct}%`} />
        </dl>
      </section>

      <section className="bg-white/65">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c1d28]">
              Core thesis
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              核心投资逻辑
            </h2>
            <ol className="mt-8 space-y-7">
              {summary.core_thesis.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span className="font-mono text-sm text-[#8c1d28]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-lg leading-8 text-black/75">{item}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="border-t-4 border-[#181611] bg-[#ece7dc] p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
              Risk factors
            </p>
            <h2 className="mt-3 text-2xl font-semibold">主要风险</h2>
            <ul className="mt-6 divide-y divide-black/15">
              {summary.risk_factors.map((risk) => (
                <li key={risk} className="py-5 first:pt-0 last:pb-0">
                  <p className="leading-7 text-black/70">{risk}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c1d28]">
            Data quality
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            数据质量说明
          </h2>
          <p className="mt-4 leading-7 text-black/60">
            以下内容保留原报告中的数值矛盾或口径差异，不在展示层擅自修正。
          </p>
        </div>

        <div className="mt-10 divide-y divide-black/15 border-y border-black/15">
          {report.data_quality_notes.map((note, index) => (
            <article
              key={`${note.path}-${index}`}
              className="grid gap-3 py-7 md:grid-cols-[2.25rem_16rem_1fr] md:gap-6"
            >
              <span className="font-mono text-sm text-[#8c1d28]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <code className="break-words text-sm text-black/55">
                {note.path}
              </code>
              <p className="leading-7 text-black/75">{note.issue}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/15 px-6 py-8 text-center text-xs uppercase tracking-[0.14em] text-black/45">
        {meta.institution} · {meta.author}
      </footer>
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
          message:
            error instanceof Error ? error.message : "报告数据暂时无法读取。",
        });
      });

    return () => controller.abort();
  }, [requestKey]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") {
    return (
      <ErrorState
        message={state.message}
        onRetry={() => {
          setState({ status: "loading" });
          setRequestKey((key) => key + 1);
        }}
      />
    );
  }

  return <ReportPage report={state.report} />;
}
