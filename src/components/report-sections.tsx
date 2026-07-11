import type { ManuReport } from "@/data/manu-report.schema";
import { formatMoney, formatPercent } from "@/lib/report-format";

type ReportSectionProps = {
  report: ManuReport;
};

type ChartSeries = {
  label: string;
  values: number[];
  color: string;
};

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c1d28]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function SectionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/20 pt-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function LineChart({
  years,
  series,
}: {
  years: string[];
  series: ChartSeries[];
}) {
  const width = 720;
  const height = 300;
  const left = 48;
  const right = 20;
  const top = 24;
  const bottom = 42;
  const values = series.flatMap((item) => item.values);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (index: number) =>
    left + (index / Math.max(years.length - 1, 1)) * (width - left - right);
  const y = (value: number) =>
    top + ((max - value) / range) * (height - top - bottom);
  const gridValues = Array.from(
    { length: 5 },
    (_, index) => min + (range * index) / 4,
  );

  return (
    <div className="mt-8 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="MANU 五年财务趋势图"
        className="min-w-[640px]"
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={y(value)}
              y2={y(value)}
              stroke="rgba(24, 22, 17, 0.12)"
              strokeWidth="1"
            />
            <text
              x={left - 9}
              y={y(value) + 4}
              textAnchor="end"
              className="fill-black/45 text-[11px]"
            >
              {Math.round(value)}
            </text>
          </g>
        ))}

        {years.map((year, index) => (
          <text
            key={year}
            x={x(index)}
            y={height - 14}
            textAnchor="middle"
            className="fill-black/50 text-[11px]"
          >
            {year}
          </text>
        ))}

        {series.map((item) => {
          const points = item.values
            .map((value, index) => `${x(index)},${y(value)}`)
            .join(" ");

          return (
            <g key={item.label}>
              <polyline
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {item.values.map((value, index) => (
                <circle
                  key={`${item.label}-${years[index]}`}
                  cx={x(index)}
                  cy={y(value)}
                  r="4"
                  fill={item.color}
                  stroke="#f4f1ea"
                  strokeWidth="2"
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-4 text-sm text-black/60">
        {series.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FinancialSection({ report }: ReportSectionProps) {
  const history = report.financial_history;
  const lastIndex = history.years.length - 1;
  const toMoney = (value: number) =>
    formatMoney({
      value,
      currency: history.currency,
      unit: history.unit,
    });

  return (
    <section className="border-t border-black/15 bg-[#f4f1ea]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <SectionHeading eyebrow="Financial performance" title="财务表现" />

        <dl className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          <SectionMetric
            label="FY2025 总营收"
            value={toMoney(history.series.total_revenue[lastIndex])}
          />
          <SectionMetric
            label="FY2025 调整后 EBITDA"
            value={toMoney(history.series.adjusted_ebitda[lastIndex])}
          />
          <SectionMetric
            label="FY2025 净负债"
            value={toMoney(history.series.net_debt[lastIndex])}
          />
          <SectionMetric
            label="营收五年 CAGR"
            value={formatPercent(history.cagr_5yr_pct.total_revenue ?? 0)}
          />
        </dl>

        <div className="mt-12 border-t-4 border-[#181611] bg-white/70 p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-xl font-semibold">FY2021–FY2025 趋势</h3>
            <p className="text-sm text-black/50">
              单位：{history.currency} {history.unit}
            </p>
          </div>
          <LineChart
            years={history.years}
            series={[
              {
                label: "总营收",
                values: history.series.total_revenue,
                color: "#8c1d28",
              },
              {
                label: "调整后 EBITDA",
                values: history.series.adjusted_ebitda,
                color: "#0f5e55",
              },
              {
                label: "净负债",
                values: history.series.net_debt,
                color: "#b48a33",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function latestPeerRows(
  peers: ManuReport["valuation"]["peer_comparison"],
) {
  const latest = new Map<string, (typeof peers)[number]>();

  for (const peer of peers) {
    const current = latest.get(peer.club);
    if (!current || peer.fiscal_year > current.fiscal_year) {
      latest.set(peer.club, peer);
    }
  }

  return Array.from(latest.values());
}

export function ValuationSection({ report }: ReportSectionProps) {
  const valuation = report.valuation;
  const fcff = valuation.fcff_model;
  const peers = latestPeerRows(valuation.peer_comparison);
  const maxMultiple = Math.max(...peers.map((peer) => peer.ev_revenue_multiple));

  return (
    <section className="border-t border-black/15 bg-[#181611] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="[&_p:first-child]:text-[#d46c75]">
          <SectionHeading eyebrow="Valuation" title="估值分析" />
        </div>

        <dl className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 [&>div]:border-white/20 [&_dt]:text-white/45">
          <SectionMetric
            label="修正后企业价值"
            value={formatMoney(fcff.enterprise_value.final_adjusted)}
          />
          <SectionMetric
            label="基础计算企业价值"
            value={formatMoney(fcff.enterprise_value.base_calculation)}
          />
          <SectionMetric
            label="终值现值"
            value={formatMoney(fcff.terminal_value.present_value)}
          />
          <SectionMetric label="WACC" value={formatPercent(fcff.key_assumptions.wacc_pct)} />
        </dl>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-t border-white/25 pt-6">
            <h3 className="text-xl font-semibold">FCFF 口径说明</h3>
            <p className="mt-5 leading-7 text-white/65">
              {fcff.enterprise_value.adjustment_note}
            </p>
            <p className="mt-4 leading-7 text-white/50">{fcff.fx_rate_note}</p>
            <div className="mt-7 grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-white/40">预测期 FCFF 现值合计</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatMoney(fcff.pv_fcff_sum)}
                </p>
              </div>
              <div>
                <p className="text-white/40">永续增长率</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatPercent(fcff.key_assumptions.terminal_growth_rate_pct)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/25 pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-semibold">同业 EV/Revenue</h3>
              <span className="text-xs uppercase tracking-[0.12em] text-white/40">
                Latest fiscal year
              </span>
            </div>
            <div className="mt-7 space-y-6">
              {peers.map((peer) => (
                <div key={peer.club}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span>{peer.club} · FY{peer.fiscal_year}</span>
                    <span className="font-semibold">
                      {peer.ev_revenue_multiple.toFixed(2)}x
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10">
                    <div
                      className="h-full bg-[#d46c75]"
                      style={{
                        width: `${Math.max(
                          4,
                          (peer.ev_revenue_multiple / maxMultiple) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SwotSection({ report }: ReportSectionProps) {
  const groups = [
    { title: "优势", english: "Strengths", items: report.swot.strengths },
    { title: "劣势", english: "Weaknesses", items: report.swot.weaknesses },
    { title: "机会", english: "Opportunities", items: report.swot.opportunities },
    { title: "威胁", english: "Threats", items: report.swot.threats },
  ];

  return (
    <section className="border-t border-black/15 bg-[#f4f1ea]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <SectionHeading eyebrow="Competitive position" title="SWOT 分析" />
        <div className="mt-10 grid gap-px overflow-hidden border border-black/15 bg-black/15 md:grid-cols-2">
          {groups.map((group) => (
            <article key={group.english} className="bg-[#f4f1ea] p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c1d28]">
                {group.english}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{group.title}</h3>
              <div className="mt-6 divide-y divide-black/15">
                {group.items.map((item) => (
                  <div key={`${group.english}-${item.tag}`} className="py-5 first:pt-0 last:pb-0">
                    <h4 className="font-semibold">{item.tag}</h4>
                    <p className="mt-2 leading-7 text-black/65">{item.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendationList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <ul className="mt-5 divide-y divide-black/15 border-y border-black/15">
        {items.map((item, index) => (
          <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
            <span className="font-mono text-xs text-[#8c1d28]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="leading-7 text-black/70">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecommendationSection({ report }: ReportSectionProps) {
  const recommendation = report.investment_recommendation;

  return (
    <section className="border-t border-black/15 bg-white/65">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <SectionHeading eyebrow="Recommendation" title="投资建议" />

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <RecommendationList title="催化剂" items={recommendation.catalysts} />
          <RecommendationList title="关键风险" items={recommendation.key_risks} />
        </div>

        <div className="mt-14 border-t-4 border-[#181611]">
          {recommendation.recommendations_by_investor_type.map((item) => (
            <article
              key={item.investor_type}
              className="grid gap-3 border-b border-black/15 py-7 md:grid-cols-[1fr_0.45fr_1.55fr] md:gap-8"
            >
              <h3 className="font-semibold">{item.investor_type}</h3>
              <p className="font-semibold text-[#8c1d28]">{item.action}</p>
              <p className="leading-7 text-black/65">{item.trigger}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
