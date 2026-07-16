import type { ManuReport } from "@/data/manu-report.schema";
import { formatMoney, formatPercent } from "@/lib/report-format";
import { type Locale, translateText } from "@/lib/i18n";

type ReportSectionProps = { report: ManuReport; locale: Locale };
type ChartSeries = { label: string; values: number[]; color: string; marker: string };

function SectionIntro({ index, eyebrow, title, description }: { index: string; eyebrow: string; title: string; description: string }) {
  return (
    <div className="section-intro">
      <p className="section-index">{index} / {eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function LineChart({ years, series }: { years: string[]; series: ChartSeries[] }) {
  const width = 780;
  const height = 328;
  const left = 52;
  const right = 28;
  const top = 28;
  const bottom = 48;
  const values = series.flatMap((item) => item.values);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (index: number) => left + (index / Math.max(years.length - 1, 1)) * (width - left - right);
  const y = (value: number) => top + ((max - value) / range) * (height - top - bottom);
  const gridValues = Array.from({ length: 5 }, (_, index) => min + (range * index) / 4);

  return (
    <div className="chart-scroll" tabIndex={0} role="region" aria-label="可横向滚动的 MANU 五年财务趋势图">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="financial-chart-title financial-chart-desc">
        <title id="financial-chart-title">FY2021 至 FY2025：营收恢复，EBITDA 转正，但净负债继续上升</title>
        <desc id="financial-chart-desc">折线比较总营收、调整后 EBITDA 与净负债，单位为百万英镑。</desc>
        {gridValues.map((value) => (
          <g key={value}>
            <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} className="chart-grid" />
            <text x={left - 10} y={y(value) + 4} textAnchor="end" className="chart-axis">{Math.round(value)}</text>
          </g>
        ))}
        {years.map((year, index) => (
          <text key={year} x={x(index)} y={height - 17} textAnchor="middle" className="chart-axis">{year}</text>
        ))}
        {series.map((item) => {
          const points = item.values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
          return (
            <g key={item.label}>
              <polyline points={points} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {item.values.map((value, index) => (
                <g key={`${item.label}-${years[index]}`}>
                  <circle cx={x(index)} cy={y(value)} r="4.5" fill="var(--paper)" stroke={item.color} strokeWidth="2.5" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function FinancialSection({ report, locale }: ReportSectionProps) {
  const history = report.financial_history;
  const lastIndex = history.years.length - 1;
  const toMoney = (value: number) => formatMoney({ value, currency: history.currency, unit: history.unit });
  const series: ChartSeries[] = [
    { label: locale === "en" ? "Total revenue" : "总营收", values: history.series.total_revenue, color: "#244A66", marker: locale === "en" ? "solid / dot" : "实线 / 圆点" },
    { label: locale === "en" ? "Adjusted EBITDA" : "调整后 EBITDA", values: history.series.adjusted_ebitda, color: "#245E73", marker: locale === "en" ? "solid / ring" : "实线 / 空心点" },
    { label: locale === "en" ? "Net debt" : "净负债", values: history.series.net_debt, color: "#7B6544", marker: locale === "en" ? "solid / square" : "实线 / 方位" },
  ];

  return (
    <section id="financials" className="chapter-section" aria-labelledby="financials-title">
      <SectionIntro index="02" eyebrow="FINANCIAL EVIDENCE" title={locale === "en" ? "Operating efficiency improves; the balance sheet still constrains" : "改善来自经营效率，约束来自资产负债表"} description={locale === "en" ? "Read the FY2021–FY2025 evidence together: recovering revenue and positive EBITDA have not removed net-debt pressure." : "FY2021–FY2025 的证据需要一起读：营收恢复和 EBITDA 转正并没有自动消除净负债压力。"} />

      <dl className="evidence-ledger" aria-label="FY2025 财务摘要">
        <div><dt>{locale === "en" ? "FY2025 total revenue" : "FY2025 总营收"}</dt><dd>{toMoney(history.series.total_revenue[lastIndex])}</dd><dd className="metric-note">report currency / unit</dd></div>
        <div><dt>{locale === "en" ? "Adjusted EBITDA" : "调整后 EBITDA"}</dt><dd>{toMoney(history.series.adjusted_ebitda[lastIndex])}</dd><dd className="metric-note">FY2025</dd></div>
        <div><dt>{locale === "en" ? "Net debt" : "净负债"}</dt><dd>{toMoney(history.series.net_debt[lastIndex])}</dd><dd className="metric-note">FY2025</dd></div>
        <div><dt>{locale === "en" ? "Five-year revenue CAGR" : "营收五年 CAGR"}</dt><dd>{formatPercent(history.cagr_5yr_pct.total_revenue ?? 0)}</dd><dd className="metric-note">reported calculation</dd></div>
      </dl>

      <figure className="evidence-breakout">
        <figcaption>
          <div><span className="evidence-label">E-02 · TREND</span><h3>{locale === "en" ? "Revenue recovers and EBITDA turns positive; net debt keeps rising" : "营收恢复，EBITDA 转正；净负债仍在抬升"}</h3></div>
          <p>{locale === "en" ? "Unit: " : "单位："}{history.currency} {history.unit}</p>
        </figcaption>
        <div className="chart-key" aria-label="图例">
          {series.map((item) => <span key={item.label}><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}<small>{item.marker}</small></span>)}
        </div>
        <LineChart years={history.years} series={series} />
        <div className="table-scroll" tabIndex={0} role="region" aria-label="可横向滚动的财务趋势数据表">
          <table>
            <caption>{locale === "en" ? "FY2021–FY2025 reported financial series" : "FY2021–FY2025 关键财务序列原始值"}</caption>
            <thead><tr><th scope="col">{locale === "en" ? "Metric" : "指标"}</th>{history.years.map((year) => <th scope="col" key={year}>{year}</th>)}</tr></thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.label}><th scope="row">{item.label}</th>{item.values.map((value, index) => <td key={`${item.label}-${history.years[index]}`}>{toMoney(value)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    </section>
  );
}

function latestPeerRows(peers: ManuReport["valuation"]["peer_comparison"]) {
  const latest = new Map<string, (typeof peers)[number]>();
  for (const peer of peers) {
    const current = latest.get(peer.club);
    if (!current || peer.fiscal_year > current.fiscal_year) latest.set(peer.club, peer);
  }
  return Array.from(latest.values()).sort((a, b) => b.ev_revenue_multiple - a.ev_revenue_multiple);
}

export function ValuationSection({ report, locale }: ReportSectionProps) {
  const fcff = report.valuation.fcff_model;
  const peers = latestPeerRows(report.valuation.peer_comparison);
  const maxMultiple = Math.max(...peers.map((peer) => peer.ev_revenue_multiple));

  return (
    <section id="valuation" className="chapter-section valuation-section" aria-labelledby="valuation-title">
      <SectionIntro index="03" eyebrow="VALUATION REVIEW" title={locale === "en" ? "The valuation is usable only when its inconsistencies remain visible" : "估值结论可用，但必须与口径矛盾一起呈现"} description={locale === "en" ? "FCFF and peer multiples offer distinct valuation anchors. Adjustments left unexplained in the source report should not be polished away by the interface." : "FCFF 与同业倍数提供不同角度的估值锚；原报告未充分展开的调整项不应被界面美化掉。"} />

      <div className="valuation-thesis">
        <p className="evidence-label">E-03 · FCFF</p>
        <dl>
          <div><dt>{locale === "en" ? "Adjusted enterprise value" : "修正后企业价值"}</dt><dd>{formatMoney(fcff.enterprise_value.final_adjusted)}</dd></div>
          <div><dt>{locale === "en" ? "Base enterprise value" : "基础计算企业价值"}</dt><dd>{formatMoney(fcff.enterprise_value.base_calculation)}</dd></div>
          <div><dt>{locale === "en" ? "PV of forecast FCFF" : "预测期 FCFF 现值合计"}</dt><dd>{formatMoney(fcff.pv_fcff_sum)}</dd></div>
          <div><dt>{locale === "en" ? "PV of terminal value" : "终值现值"}</dt><dd>{formatMoney(fcff.terminal_value.present_value)}</dd></div>
          <div><dt>WACC</dt><dd>{formatPercent(fcff.key_assumptions.wacc_pct)}</dd></div>
          <div><dt>{locale === "en" ? "Terminal growth" : "永续增长率"}</dt><dd>{formatPercent(fcff.key_assumptions.terminal_growth_rate_pct)}</dd></div>
        </dl>
        <div className="method-note"><strong>{locale === "en" ? "Method boundary" : "口径限定"}</strong><p>{translateText(fcff.enterprise_value.adjustment_note, locale)}</p><p>{translateText(fcff.fx_rate_note, locale)}</p></div>
      </div>

      <figure className="peer-breakout">
        <figcaption><div><span className="evidence-label">E-03B · PEERS</span><h3>{locale === "en" ? "Latest available EV/Revenue comparison" : "最新可得财年 EV/Revenue 对比"}</h3></div><p>{locale === "en" ? "Fiscal year and multiple definition retained on each row" : "同一行保留财年与倍数定义"}</p></figcaption>
        <div className="peer-register">
          {peers.map((peer) => (
            <div key={peer.club} className="peer-row">
              <div><strong>{peer.club}</strong><span>FY{peer.fiscal_year}</span></div>
              <div className="peer-track" aria-hidden="true"><span style={{ width: `${Math.max(6, (peer.ev_revenue_multiple / maxMultiple) * 100)}%` }} /></div>
              <p>{peer.ev_revenue_multiple.toFixed(2)}x</p>
            </div>
          ))}
        </div>
      </figure>

      <div className="sensitivity-register">
        <h3>{locale === "en" ? "Sensitivity boundary" : "敏感性边界"}</h3>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="可横向滚动的 FCFF 敏感性表">
          <table>
            <thead><tr><th scope="col">{locale === "en" ? "Variable" : "变量"}</th><th scope="col">{locale === "en" ? "Shock" : "冲击"}</th><th scope="col">{locale === "en" ? "Resulting enterprise value" : "结果企业价值"}</th><th scope="col">{locale === "en" ? "Change" : "变化"}</th></tr></thead>
            <tbody>{fcff.sensitivity.map((item) => <tr key={`${item.variable}-${item.shock}`}><th scope="row">{item.variable}</th><td>{locale === "en" ? item.shock.replaceAll("至", " to ") : item.shock}</td><td>{formatMoney(item.resulting_ev)}</td><td>{formatPercent(item.change_pct)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function SwotSection({ report, locale }: ReportSectionProps) {
  const groups = [
    { code: "S", title: "优势", english: "Strengths", items: report.swot.strengths },
    { code: "W", title: "劣势", english: "Weaknesses", items: report.swot.weaknesses },
    { code: "O", title: "机会", english: "Opportunities", items: report.swot.opportunities },
    { code: "T", title: "威胁", english: "Threats", items: report.swot.threats },
  ];
  return (
    <section className="chapter-section swot-section" aria-labelledby="swot-title">
      <SectionIntro index="03B" eyebrow="COMPETITIVE POSITION" title={locale === "en" ? "Read SWOT as an investment checklist, not four decorative cards" : "把 SWOT 当作判断清单，而不是四张卡片"} description={locale === "en" ? "Each group follows the same reading edge so strengths and constraints can be tested in sequence." : "每一组沿同一阅读边线展开，使优势与限制可以顺序核对。"} />
      <div className="swot-register">
        {groups.map((group) => (
          <article key={group.english}>
            <div className="swot-heading"><span>{group.code}</span><p>{group.english}</p><h3>{locale === "en" ? group.english : group.title}</h3></div>
            <div className="swot-items">{group.items.map((item) => <div key={`${group.code}-${item.tag}`}><h4>{translateText(item.tag, locale)}</h4><p>{translateText(item.text, locale)}</p></div>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NumberedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="ruled-list">
      <h3>{title}</h3>
      <ol>{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
    </div>
  );
}

export function RecommendationSection({ report, locale }: ReportSectionProps) {
  const summary = report.executive_summary;
  const recommendation = report.investment_recommendation;
  return (
    <section id="risk" className="chapter-section recommendation-section" aria-labelledby="risk-title">
      <SectionIntro index="04" eyebrow="RISK & RECOMMENDATION" title={locale === "en" ? "Hold is not neutrality; it is a conditional wait" : "持有不是中性陈述，而是有条件的等待"} description={locale === "en" ? "Risks, catalysts and investor-specific conditions belong on the same page so one action is not mistaken for universal advice." : "风险、催化剂与投资者适配条件必须同场出现，避免把单一动作误读为普遍建议。"} />

      <div className="risk-callout">
        <p className="evidence-label">E-04 · PRINCIPAL RISKS</p>
        <ol>{summary.risk_factors.map((risk, index) => <li key={risk}><span>{String(index + 1).padStart(2, "0")}</span><p>{translateText(risk, locale)}</p></li>)}</ol>
      </div>

      <div className="paired-registers">
        <NumberedList title={locale === "en" ? "Catalysts" : "催化剂"} items={recommendation.catalysts.map((item) => translateText(item, locale))} />
        <NumberedList title={locale === "en" ? "Key risks" : "关键风险"} items={recommendation.key_risks.map((item) => translateText(item, locale))} />
      </div>

      <div className="investor-register">
        <div className="register-heading"><h3>{locale === "en" ? "Recommendations by investor profile" : "分投资者建议"}</h3><p>{locale === "en" ? "Each action applies only when its stated trigger is met" : "动作只有在对应触发条件下成立"}</p></div>
        {recommendation.recommendations_by_investor_type.map((item) => (
          <article key={item.investor_type}>
            <h4>{translateText(item.investor_type, locale)}</h4><p className="investor-action">{translateText(item.action, locale)}</p><p>{translateText(item.trigger, locale)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
