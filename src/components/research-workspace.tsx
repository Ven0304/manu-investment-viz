"use client";

import { useMemo, useState } from "react";

import type { ManuReport, MonetaryAmount } from "@/data/manu-report.schema";
import { formatMoney, formatPercent } from "@/lib/report-format";

type ObjectId =
  | "investment"
  | "financials"
  | "valuation"
  | "competition"
  | "recommendation"
  | "quality";

type Trace = {
  title: string;
  section: string;
  path: string;
  period: string;
  unit: string;
  evidenceId: string;
};

const OBJECTS: Array<{ id: ObjectId; label: string; meta: string }> = [
  { id: "investment", label: "投资结论", meta: "评级 · 逻辑" },
  { id: "financials", label: "财务趋势", meta: "FY2021–FY2025" },
  { id: "valuation", label: "估值对象", meta: "FCFF · 同业" },
  { id: "competition", label: "竞争与风险", meta: "SWOT · 五力" },
  { id: "recommendation", label: "行动建议", meta: "催化剂 · 风险" },
  { id: "quality", label: "质量记录", meta: "5 项待核查" },
];

const DEFAULT_TRACE: Trace = {
  title: "目标价与评级",
  section: "executive_summary",
  path: "executive_summary.target_price_usd",
  period: "报告快照",
  unit: "USD / share",
  evidenceId: "evidence-rating",
};

function traceObjectForPath(path: string): ObjectId {
  if (path.startsWith("valuation") || path.startsWith("target_price")) {
    return "valuation";
  }
  if (
    path.startsWith("financial_history") ||
    path.startsWith("adjusted_ebitda") ||
    path.startsWith("key_ratios")
  ) {
    return "financials";
  }
  return "investment";
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Intl.NumberFormat("en-US").format(value);
  if (value === null) return "—";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const label = typeof record.label === "string" ? `${record.label}: ` : "";
    if (typeof record.expression === "string") return `${label}${record.expression}`;
    if (typeof record.value === "number") {
      const unit = typeof record.unit === "string" ? ` ${record.unit}` : "";
      const currency = typeof record.currency === "string" ? `${record.currency} ` : "";
      return `${label}${currency}${record.value}${unit}`;
    }
  }
  return JSON.stringify(value);
}

function EvidenceButton({
  trace,
  onInspect,
}: {
  trace: Trace;
  onInspect: (trace: Trace) => void;
}) {
  return (
    <button className="trace-trigger" type="button" onClick={() => onInspect(trace)}>
      查看溯源 <span aria-hidden="true">→</span>
    </button>
  );
}

function MoneyValue({ amount }: { amount: MonetaryAmount }) {
  return <span className="data-value">{formatMoney(amount)}</span>;
}

function Metric({
  label,
  value,
  note,
  trace,
  onInspect,
  evidenceId,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  trace: Trace;
  onInspect: (trace: Trace) => void;
  evidenceId: string;
  emphasis?: boolean;
}) {
  return (
    <article
      className={emphasis ? "metric metric-emphasis" : "metric"}
      id={evidenceId}
      tabIndex={-1}
    >
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-note">{note}</p>
      <EvidenceButton trace={trace} onInspect={onInspect} />
    </article>
  );
}

function SectionHeader({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="workspace-heading">
      <div className="section-index" aria-hidden="true">
        {index}
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

function TrendChart({ report }: { report: ManuReport }) {
  const { years, series } = report.financial_history;
  const chartSeries = [
    { label: "总营收", values: series.total_revenue, color: "#3f5f8a" },
    { label: "调整后 EBITDA", values: series.adjusted_ebitda, color: "#39745a" },
    { label: "净负债", values: series.net_debt, color: "#8a433a" },
  ];
  const width = 720;
  const height = 270;
  const left = 44;
  const right = 20;
  const top = 24;
  const bottom = 36;
  const allValues = chartSeries.flatMap((item) => item.values);
  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const x = (index: number) =>
    left + (index / Math.max(years.length - 1, 1)) * (width - left - right);
  const y = (value: number) => top + ((max - value) / range) * (height - top - bottom);

  return (
    <figure className="trend-figure" aria-labelledby="trend-title">
      <figcaption>
        <div>
          <p className="eyebrow">五年同口径观察</p>
          <h3 id="trend-title">营收修复，但债务压力仍处高位</h3>
        </div>
        <p className="figure-unit">GBP million · FY2021–FY2025</p>
      </figcaption>
      <div className="chart-scroll" tabIndex={0} aria-label="财务趋势图，可横向滚动">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="总营收、调整后 EBITDA 与净负债五年趋势" className="trend-chart">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = min + range * ratio;
            return (
              <g key={ratio}>
                <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} className="chart-grid" />
                <text x={left - 8} y={y(value) + 4} textAnchor="end" className="chart-label">
                  {Math.round(value)}
                </text>
              </g>
            );
          })}
          {years.map((year, index) => (
            <text key={year} x={x(index)} y={height - 10} textAnchor="middle" className="chart-label">
              {year}
            </text>
          ))}
          {chartSeries.map((item) => (
            <g key={item.label}>
              <polyline
                points={item.values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {item.values.map((value, index) => (
                <circle key={`${item.label}-${years[index]}`} cx={x(index)} cy={y(value)} r="4" fill={item.color} stroke="#fff" strokeWidth="2" />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="chart-legend" aria-label="图例">
        {chartSeries.map((item) => (
          <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>
        ))}
      </div>
    </figure>
  );
}

function InvestmentView({ report, onInspect }: ViewProps) {
  const summary = report.executive_summary;
  return (
    <>
      <SectionHeader
        index="01"
        eyebrow="Investment view"
        title="安全边际有限，维持持有"
        description="先确认结论与价格口径，再沿核心逻辑和风险因子下钻。"
      />
      <div className="judgment-strip" id="evidence-rating" tabIndex={-1}>
        <div>
          <p className="judgment-label">当前判断</p>
          <p className="judgment">{summary.rating}</p>
        </div>
        <p>
          目标价 <strong>{formatMoney(summary.target_price_usd)}</strong>，相对当前价{" "}
          <strong>{summary.upside_pct > 0 ? "+" : ""}{formatPercent(summary.upside_pct)}</strong>。
        </p>
        <EvidenceButton trace={DEFAULT_TRACE} onInspect={onInspect} />
      </div>
      <div className="metric-grid">
        <Metric
          label="当前价格"
          value={<MoneyValue amount={summary.current_price_usd} />}
          note="报告快照，非实时行情"
          trace={{ title: "当前价格", section: "executive_summary", path: "executive_summary.current_price_usd", period: "报告快照", unit: "USD / share", evidenceId: "metric-current" }}
          onInspect={onInspect}
          evidenceId="metric-current"
        />
        <Metric
          label="目标价（USD）"
          value={<MoneyValue amount={summary.target_price_usd} />}
          note="由 EUR 目标价折算"
          trace={{ title: "美元目标价", section: "target_price_derivation", path: "target_price_derivation.target_price_usd", period: "报告估值期", unit: "USD / share", evidenceId: "metric-target" }}
          onInspect={onInspect}
          evidenceId="metric-target"
          emphasis
        />
        <Metric
          label="目标价（EUR）"
          value={<MoneyValue amount={summary.target_price_eur} />}
          note={`汇率假设 EUR/USD ${summary.fx_rate_eur_usd}`}
          trace={{ title: "欧元目标价", section: "target_price_derivation", path: "target_price_derivation.target_price_eur", period: "报告估值期", unit: "EUR / share", evidenceId: "metric-target-eur" }}
          onInspect={onInspect}
          evidenceId="metric-target-eur"
        />
      </div>
      <section className="evidence-section">
        <div className="subhead"><span>核心投资逻辑</span><span>{summary.core_thesis.length} 条证据链</span></div>
        <ol className="argument-list">
          {summary.core_thesis.map((item, index) => (
            <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
          ))}
        </ol>
      </section>
      <section className="evidence-section">
        <div className="subhead"><span>主要风险</span><span>原报告列示</span></div>
        <ul className="risk-list">
          {summary.risk_factors.map((item) => <li key={item}><span aria-hidden="true">!</span>{item}</li>)}
        </ul>
      </section>
    </>
  );
}

type ViewProps = { report: ManuReport; onInspect: (trace: Trace) => void };

function FinancialView({ report, onInspect }: ViewProps) {
  const history = report.financial_history;
  const latest = history.years.length - 1;
  const money = (value: number) => formatMoney({ value, currency: history.currency, unit: history.unit });
  const rows = [
    ["total_revenue", "总营收", history.series.total_revenue],
    ["commercial_revenue", "商业收入", history.series.commercial_revenue],
    ["broadcasting_revenue", "转播收入", history.series.broadcasting_revenue],
    ["matchday_revenue", "比赛日收入", history.series.matchday_revenue],
    ["wages", "工资成本", history.series.wages],
    ["adjusted_ebitda", "调整后 EBITDA", history.series.adjusted_ebitda],
    ["operating_pl", "经营损益", history.series.operating_pl],
    ["net_loss", "净亏损", history.series.net_loss],
    ["net_debt", "净负债", history.series.net_debt],
  ] as const;
  return (
    <>
      <SectionHeader index="02" eyebrow="Financial object" title="财务趋势" description="同一期间、币种和单位下比较收入修复、盈利能力与杠杆。" />
      <div className="metric-grid">
        <Metric label="FY2025 总营收" value={money(history.series.total_revenue[latest])} note="GBP million" trace={{ title: "FY2025 总营收", section: "financial_history", path: "financial_history.series.total_revenue[4]", period: history.years[latest], unit: "GBP million", evidenceId: "financial-revenue" }} onInspect={onInspect} evidenceId="financial-revenue" emphasis />
        <Metric label="FY2025 调整后 EBITDA" value={money(history.series.adjusted_ebitda[latest])} note="报告调整口径" trace={{ title: "FY2025 调整后 EBITDA", section: "financial_history", path: "financial_history.series.adjusted_ebitda[4]", period: history.years[latest], unit: "GBP million", evidenceId: "financial-ebitda" }} onInspect={onInspect} evidenceId="financial-ebitda" />
        <Metric label="FY2025 净负债" value={money(history.series.net_debt[latest])} note="杠杆仍需关注" trace={{ title: "FY2025 净负债", section: "financial_history", path: "financial_history.series.net_debt[4]", period: history.years[latest], unit: "GBP million", evidenceId: "financial-debt" }} onInspect={onInspect} evidenceId="financial-debt" />
      </div>
      <TrendChart report={report} />
      <section className="evidence-section" id="financial-table" tabIndex={-1}>
        <div className="subhead"><span>完整财务序列</span><span>{history.currency} {history.unit}</span></div>
        <div className="table-scroll" tabIndex={0} aria-label="完整财务序列表，可横向滚动">
          <table>
            <thead><tr><th scope="col">指标</th>{history.years.map((year) => <th scope="col" key={year}>{year}</th>)}<th scope="col">溯源</th></tr></thead>
            <tbody>
              {rows.map(([field, label, values]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {values.map((value, index) => <td key={`${label}-${history.years[index]}`} className={typeof value === "number" && value < 0 ? "negative" : ""}>{value === null ? "—" : value.toFixed(1)}</td>)}
                  <td><EvidenceButton trace={{ title: `${label}五年序列`, section: "financial_history", path: `financial_history.series.${field}`, period: "FY2021–FY2025", unit: "GBP million", evidenceId: "financial-table" }} onInspect={onInspect} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ratio-row" aria-label="FY2025 关键比率">
        <div><span>工资 / 营收</span><strong>{formatPercent(report.key_ratios_fy2025.wages_to_revenue_pct)}</strong></div>
        <div><span>净负债 / EBITDA</span><strong>{report.key_ratios_fy2025.net_debt_to_ebitda.toFixed(1)}x</strong></div>
        <div><span>利息保障倍数</span><strong>{report.key_ratios_fy2025.interest_cover.toFixed(1)}x</strong></div>
      </section>
    </>
  );
}

function ValuationView({ report, onInspect }: ViewProps) {
  const fcff = report.valuation.fcff_model;
  const peers = report.valuation.peer_comparison;
  const latestPeers = Array.from(new Map(peers.map((peer) => [peer.club, peer])).values());
  return (
    <>
      <SectionHeader index="03" eyebrow="Valuation object" title="FCFF 与同业估值" description="基础企业价值、修正后结果和同业倍数并列，矛盾不在展示层消失。" />
      <div className="valuation-callout" id="valuation-enterprise" tabIndex={-1}>
        <div><p className="metric-label">基础计算企业价值</p><p className="metric-value"><MoneyValue amount={fcff.enterprise_value.base_calculation} /></p></div>
        <span aria-hidden="true">→</span>
        <div><p className="metric-label">原报告修正后企业价值</p><p className="metric-value"><MoneyValue amount={fcff.enterprise_value.final_adjusted} /></p></div>
        <EvidenceButton trace={{ title: "FCFF 企业价值修正", section: "valuation.fcff_model", path: "valuation.fcff_model.enterprise_value", period: "估值预测期", unit: "EUR billion", evidenceId: "valuation-enterprise" }} onInspect={onInspect} />
      </div>
      <p className="quality-warning"><span aria-hidden="true">!</span>{fcff.enterprise_value.adjustment_note}</p>
      <div className="metric-grid compact">
        <Metric label="WACC" value={formatPercent(fcff.key_assumptions.wacc_pct)} note="现金流贴现率" trace={{ title: "WACC", section: "valuation.fcff_model", path: "valuation.fcff_model.key_assumptions.wacc_pct", period: "预测期", unit: "%", evidenceId: "valuation-wacc" }} onInspect={onInspect} evidenceId="valuation-wacc" />
        <Metric label="永续增长率" value={formatPercent(fcff.key_assumptions.terminal_growth_rate_pct)} note="终值假设" trace={{ title: "永续增长率", section: "valuation.fcff_model", path: "valuation.fcff_model.key_assumptions.terminal_growth_rate_pct", period: "终值", unit: "%", evidenceId: "valuation-growth" }} onInspect={onInspect} evidenceId="valuation-growth" />
        <Metric label="终值现值" value={<MoneyValue amount={fcff.terminal_value.present_value} />} note="折现至估值基准日" trace={{ title: "终值现值", section: "valuation.fcff_model", path: "valuation.fcff_model.terminal_value.present_value", period: "终值", unit: "EUR billion", evidenceId: "valuation-terminal" }} onInspect={onInspect} evidenceId="valuation-terminal" />
      </div>
      <section className="evidence-section" id="peer-table" tabIndex={-1}>
        <div className="subhead"><span>同业 EV / Revenue</span><span>原报告最新可用财年</span></div>
        <div className="table-scroll" tabIndex={0} aria-label="同业估值表，可横向滚动">
          <table>
            <thead><tr><th scope="col">俱乐部</th><th scope="col">财年</th><th scope="col">企业价值</th><th scope="col">营收</th><th scope="col">EV / Revenue</th><th scope="col">溯源</th></tr></thead>
            <tbody>{latestPeers.map((peer) => <tr key={peer.club}><th scope="row">{peer.club}</th><td>FY{peer.fiscal_year}</td><td>{formatMoney(peer.enterprise_value)}</td><td>{formatMoney(peer.revenue)}</td><td><strong>{peer.ev_revenue_multiple.toFixed(2)}x</strong></td><td><EvidenceButton trace={{ title: `${peer.club} 同业倍数`, section: "valuation.peer_comparison", path: `valuation.peer_comparison[${peers.indexOf(peer)}]`, period: `FY${peer.fiscal_year}`, unit: "EV / Revenue", evidenceId: "peer-table" }} onInspect={onInspect} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="evidence-section">
        <div className="subhead"><span>敏感性观察</span><span> resulting EV</span></div>
        <div className="sensitivity-list">{fcff.sensitivity.map((item) => <div key={`${item.variable}-${item.shock}`}><span>{item.variable}</span><strong>{item.shock}</strong><span><MoneyValue amount={item.resulting_ev} /></span><span className={item.change_pct < 0 ? "negative" : "positive"}>{item.change_pct > 0 ? "+" : ""}{formatPercent(item.change_pct)}</span></div>)}</div>
      </section>
    </>
  );
}

function CompetitionView({ report }: ViewProps) {
  const groups = [
    ["S", "优势", report.swot.strengths],
    ["W", "劣势", report.swot.weaknesses],
    ["O", "机会", report.swot.opportunities],
    ["T", "威胁", report.swot.threats],
  ] as const;
  const forces = Object.entries(report.five_forces);
  return (
    <>
      <SectionHeader index="04" eyebrow="Competition object" title="竞争位置与风险" description="SWOT 负责判断，五力负责行业结构；两者不混成彩色卡片墙。" />
      <div className="swot-grid">{groups.map(([letter, title, items]) => <section key={letter}><header><span>{letter}</span><h3>{title}</h3></header><ul>{items.map((item) => <li key={item.tag}><strong>{item.tag}</strong><p>{item.text}</p></li>)}</ul></section>)}</div>
      <section className="evidence-section">
        <div className="subhead"><span>波特五力</span><span>强度 + 原报告摘要</span></div>
        <div className="force-list">{forces.map(([key, force]) => <article key={key}><div><span>{key.replaceAll("_", " ")}</span><strong>{force.intensity}</strong></div><p>{force.summary}</p></article>)}</div>
      </section>
    </>
  );
}

function RecommendationView({ report }: ViewProps) {
  const recommendation = report.investment_recommendation;
  return (
    <>
      <SectionHeader index="05" eyebrow="Recommendation object" title="催化剂、风险与分投资者建议" description="建议不是统一买卖按钮，而是与投资者类型和触发条件绑定的判断。" />
      <div className="recommendation-columns">
        <section><div className="subhead"><span>催化剂</span><span>可能改善预期</span></div><ol>{recommendation.catalysts.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></section>
        <section><div className="subhead"><span>关键风险</span><span>需持续核查</span></div><ol>{recommendation.key_risks.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></section>
      </div>
      <section className="evidence-section">
        <div className="subhead"><span>分投资者建议</span><span>行动取决于触发条件</span></div>
        <div className="investor-list">{recommendation.recommendations_by_investor_type.map((item) => <article key={item.investor_type}><h3>{item.investor_type}</h3><p className="action-label">{item.action}</p><p>{item.trigger}</p></article>)}</div>
      </section>
    </>
  );
}

function QualityView({ report, onReturn }: { report: ManuReport; onReturn: (id: ObjectId, trace: Trace) => void }) {
  return (
    <>
      <SectionHeader index="06" eyebrow="Quality records" title="口径与矛盾记录" description="保留原报告中的 5 项矛盾；这些记录用于核查，不代表展示层已修正。" />
      <div className="quality-ledger">{report.data_quality_notes.map((note, index) => {
        const objectId = traceObjectForPath(note.path);
        const trace: Trace = { title: `质量记录 ${String(index + 1).padStart(2, "0")}`, section: "data_quality_notes", path: note.path, period: "原报告口径", unit: "见关联字段", evidenceId: `quality-${index}` };
        return <article key={`${note.path}-${index}`} id={`quality-${index}`} tabIndex={-1}><header><span>Q{String(index + 1).padStart(2, "0")}</span><code>{note.path}</code></header><p>{note.issue}</p><div className="found-values">{note.values_found.map((value, valueIndex) => <span key={valueIndex}>{formatUnknown(value)}</span>)}</div><button type="button" onClick={() => onReturn(objectId, trace)}>返回关联对象 <span aria-hidden="true">↗</span></button></article>;
      })}</div>
    </>
  );
}

function ProvenanceContent({
  trace,
  report,
  onQuality,
}: {
  trace: Trace;
  report: ManuReport;
  onQuality: () => void;
}) {
  const related = report.data_quality_notes.filter((note) =>
    note.path.includes(trace.path.split(".").slice(0, 2).join(".")),
  );
  const returnToEvidence = () => {
    const target = document.getElementById(trace.evidenceId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    target?.focus({ preventScroll: true });
  };
  return (
    <div className="provenance-content">
      <div className="rail-state"><span aria-hidden="true">●</span> 当前研究对象</div>
      <h2>{trace.title}</h2>
      <dl>
        <div><dt>报告分区</dt><dd>{trace.section}</dd></div>
        <div><dt>字段路径</dt><dd><code>{trace.path}</code></dd></div>
        <div><dt>期间</dt><dd>{trace.period}</dd></div>
        <div><dt>单位 / 币种</dt><dd>{trace.unit}</dd></div>
        <div><dt>API 状态</dt><dd><span className="status-ok">✓ Zod 校验通过</span></dd></div>
        <div><dt>质量关联</dt><dd>{related.length ? `${related.length} 项记录` : "未发现直接关联记录"}</dd></div>
      </dl>
      <div className="source-gap"><span aria-hidden="true">i</span><p><strong>来源边界</strong>当前数据未提供独立来源 URL；这里的“溯源”只连接报告分区、字段路径、期间、单位与已存在的质量记录。</p></div>
      <div className="rail-actions"><button type="button" onClick={returnToEvidence}>返回证据</button><button type="button" onClick={onQuality}>查看质量说明</button></div>
    </div>
  );
}

export function ResearchWorkspace({ report }: { report: ManuReport }) {
  const [activeObject, setActiveObject] = useState<ObjectId>("investment");
  const [trace, setTrace] = useState<Trace>(DEFAULT_TRACE);
  const [query, setQuery] = useState("");
  const filteredObjects = useMemo(() => OBJECTS.filter((item) => `${item.label}${item.meta}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const selectObject = (id: ObjectId) => {
    setActiveObject(id);
    document.getElementById("workspace-main")?.focus({ preventScroll: true });
  };

  const inspect = (nextTrace: Trace) => setTrace(nextTrace);
  const renderActive = () => {
    if (activeObject === "investment") return <InvestmentView report={report} onInspect={inspect} />;
    if (activeObject === "financials") return <FinancialView report={report} onInspect={inspect} />;
    if (activeObject === "valuation") return <ValuationView report={report} onInspect={inspect} />;
    if (activeObject === "competition") return <CompetitionView report={report} onInspect={inspect} />;
    if (activeObject === "recommendation") return <RecommendationView report={report} onInspect={inspect} />;
    return <QualityView report={report} onReturn={(id, nextTrace) => { setActiveObject(id); setTrace(nextTrace); }} />;
  };

  return (
    <main className="research-shell">
      <a className="skip-link" href="#workspace-main">跳至当前研究对象</a>
      <header className="topbar">
        <div className="brand-block"><span className="brand-mark">M</span><div><strong>MANU Research</strong><span>Traceable workspace</span></div></div>
        <div className="snapshot-state"><span className="rating-state">{report.executive_summary.rating}</span><span>报告快照 · API 已校验</span></div>
      </header>
      <div className="workspace-grid">
        <aside className="object-sidebar" aria-label="研究对象导航">
          <div className="object-intro"><p className="eyebrow">Research objects</p><h1>{report.meta.ticker}</h1><p>{report.meta.subject_company}</p></div>
          <label className="object-search"><span>筛选研究对象</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="财务、估值、质量…" /></label>
          <nav>
            {filteredObjects.map((item, index) => <button key={item.id} type="button" aria-current={activeObject === item.id ? "page" : undefined} onClick={() => selectObject(item.id)}><span className="nav-index">{String(index + 1).padStart(2, "0")}</span><span><strong>{item.label}</strong><small>{item.meta}</small></span>{item.id === "quality" && <b>{report.data_quality_notes.length}</b>}</button>)}
          </nav>
          <div className="sidebar-note"><span aria-hidden="true">◎</span><p><strong>当前数据范围</strong>本地报告快照，不含实时行情、外部来源或保存功能。</p></div>
        </aside>
        <section className="workspace-main" id="workspace-main" tabIndex={-1}>
          <div className="mobile-object-switcher">
            <label htmlFor="object-select">当前研究对象</label>
            <select id="object-select" value={activeObject} onChange={(event) => selectObject(event.target.value as ObjectId)}>{OBJECTS.map((item) => <option value={item.id} key={item.id}>{item.label} · {item.meta}</option>)}</select>
          </div>
          {renderActive()}
          <details className="mobile-provenance">
            <summary>溯源与口径 <span>{trace.title}</span></summary>
            <ProvenanceContent trace={trace} report={report} onQuality={() => selectObject("quality")} />
          </details>
        </section>
        <aside className="provenance-rail" aria-label="同步溯源轨道">
          <p className="rail-kicker">Provenance rail</p>
          <ProvenanceContent trace={trace} report={report} onQuality={() => selectObject("quality")} />
        </aside>
      </div>
      <footer className="workspace-footer"><span>{report.meta.institution} · {report.meta.author}</span><span>不修正原报告矛盾 · 不构成投资建议</span></footer>
    </main>
  );
}
