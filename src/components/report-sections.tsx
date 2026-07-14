import type { ManuReport } from "@/data/manu-report.schema";
import { formatMoney, formatPercent } from "@/lib/report-format";

type ReportSectionProps = { report: ManuReport };
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
                  <circle cx={x(index)} cy={y(value)} r="4.5" fill="#fffdf7" stroke={item.color} strokeWidth="2.5" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function FinancialSection({ report }: ReportSectionProps) {
  const history = report.financial_history;
  const lastIndex = history.years.length - 1;
  const toMoney = (value: number) => formatMoney({ value, currency: history.currency, unit: history.unit });
  const series: ChartSeries[] = [
    { label: "总营收", values: history.series.total_revenue, color: "#8A2E35", marker: "实线 / 圆点" },
    { label: "调整后 EBITDA", values: history.series.adjusted_ebitda, color: "#245E73", marker: "实线 / 空心点" },
    { label: "净负债", values: history.series.net_debt, color: "#7B6544", marker: "实线 / 方位" },
  ];

  return (
    <section id="financials" className="chapter-section" aria-labelledby="financials-title">
      <SectionIntro index="02" eyebrow="FINANCIAL EVIDENCE" title="改善来自经营效率，约束来自资产负债表" description="FY2021–FY2025 的证据需要一起读：营收恢复和 EBITDA 转正并没有自动消除净负债压力。" />

      <dl className="evidence-ledger" aria-label="FY2025 财务摘要">
        <div><dt>FY2025 总营收</dt><dd>{toMoney(history.series.total_revenue[lastIndex])}</dd><span>report currency / unit</span></div>
        <div><dt>调整后 EBITDA</dt><dd>{toMoney(history.series.adjusted_ebitda[lastIndex])}</dd><span>FY2025</span></div>
        <div><dt>净负债</dt><dd>{toMoney(history.series.net_debt[lastIndex])}</dd><span>FY2025</span></div>
        <div><dt>营收五年 CAGR</dt><dd>{formatPercent(history.cagr_5yr_pct.total_revenue ?? 0)}</dd><span>reported calculation</span></div>
      </dl>

      <figure className="evidence-breakout">
        <figcaption>
          <div><span className="evidence-label">E-02 · TREND</span><h3>营收恢复，EBITDA 转正；净负债仍在抬升</h3></div>
          <p>单位：{history.currency} {history.unit}</p>
        </figcaption>
        <div className="chart-key" aria-label="图例">
          {series.map((item) => <span key={item.label}><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}<small>{item.marker}</small></span>)}
        </div>
        <LineChart years={history.years} series={series} />
        <div className="table-scroll" tabIndex={0} role="region" aria-label="可横向滚动的财务趋势数据表">
          <table>
            <caption>FY2021–FY2025 关键财务序列原始值</caption>
            <thead><tr><th scope="col">指标</th>{history.years.map((year) => <th scope="col" key={year}>{year}</th>)}</tr></thead>
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

export function ValuationSection({ report }: ReportSectionProps) {
  const fcff = report.valuation.fcff_model;
  const peers = latestPeerRows(report.valuation.peer_comparison);
  const maxMultiple = Math.max(...peers.map((peer) => peer.ev_revenue_multiple));

  return (
    <section id="valuation" className="chapter-section valuation-section" aria-labelledby="valuation-title">
      <SectionIntro index="03" eyebrow="VALUATION REVIEW" title="估值结论可用，但必须与口径矛盾一起呈现" description="FCFF 与同业倍数提供不同角度的估值锚；原报告未充分展开的调整项不应被界面美化掉。" />

      <div className="valuation-thesis">
        <p className="evidence-label">E-03 · FCFF</p>
        <dl>
          <div><dt>修正后企业价值</dt><dd>{formatMoney(fcff.enterprise_value.final_adjusted)}</dd></div>
          <div><dt>基础计算企业价值</dt><dd>{formatMoney(fcff.enterprise_value.base_calculation)}</dd></div>
          <div><dt>预测期 FCFF 现值合计</dt><dd>{formatMoney(fcff.pv_fcff_sum)}</dd></div>
          <div><dt>终值现值</dt><dd>{formatMoney(fcff.terminal_value.present_value)}</dd></div>
          <div><dt>WACC</dt><dd>{formatPercent(fcff.key_assumptions.wacc_pct)}</dd></div>
          <div><dt>永续增长率</dt><dd>{formatPercent(fcff.key_assumptions.terminal_growth_rate_pct)}</dd></div>
        </dl>
        <div className="method-note"><strong>口径限定</strong><p>{fcff.enterprise_value.adjustment_note}</p><p>{fcff.fx_rate_note}</p></div>
      </div>

      <figure className="peer-breakout">
        <figcaption><div><span className="evidence-label">E-03B · PEERS</span><h3>最新可得财年 EV/Revenue 对比</h3></div><p>同一行保留财年与倍数定义</p></figcaption>
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
        <h3>敏感性边界</h3>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="可横向滚动的 FCFF 敏感性表">
          <table>
            <thead><tr><th scope="col">变量</th><th scope="col">冲击</th><th scope="col">结果企业价值</th><th scope="col">变化</th></tr></thead>
            <tbody>{fcff.sensitivity.map((item) => <tr key={`${item.variable}-${item.shock}`}><th scope="row">{item.variable}</th><td>{item.shock}</td><td>{formatMoney(item.resulting_ev)}</td><td>{formatPercent(item.change_pct)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function SwotSection({ report }: ReportSectionProps) {
  const groups = [
    { code: "S", title: "优势", english: "Strengths", items: report.swot.strengths },
    { code: "W", title: "劣势", english: "Weaknesses", items: report.swot.weaknesses },
    { code: "O", title: "机会", english: "Opportunities", items: report.swot.opportunities },
    { code: "T", title: "威胁", english: "Threats", items: report.swot.threats },
  ];
  return (
    <section className="chapter-section swot-section" aria-labelledby="swot-title">
      <SectionIntro index="03B" eyebrow="COMPETITIVE POSITION" title="把 SWOT 当作判断清单，而不是四张卡片" description="每一组沿同一阅读边线展开，使优势与限制可以顺序核对。" />
      <div className="swot-register">
        {groups.map((group) => (
          <article key={group.english}>
            <div className="swot-heading"><span>{group.code}</span><p>{group.english}</p><h3>{group.title}</h3></div>
            <div className="swot-items">{group.items.map((item) => <div key={`${group.code}-${item.tag}`}><h4>{item.tag}</h4><p>{item.text}</p></div>)}</div>
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

export function RecommendationSection({ report }: ReportSectionProps) {
  const summary = report.executive_summary;
  const recommendation = report.investment_recommendation;
  return (
    <section id="risk" className="chapter-section recommendation-section" aria-labelledby="risk-title">
      <SectionIntro index="04" eyebrow="RISK & RECOMMENDATION" title="持有不是中性陈述，而是有条件的等待" description="风险、催化剂与投资者适配条件必须同场出现，避免把单一动作误读为普遍建议。" />

      <div className="risk-callout">
        <p className="evidence-label">E-04 · PRINCIPAL RISKS</p>
        <ol>{summary.risk_factors.map((risk, index) => <li key={risk}><span>{String(index + 1).padStart(2, "0")}</span><p>{risk}</p></li>)}</ol>
      </div>

      <div className="paired-registers">
        <NumberedList title="催化剂" items={recommendation.catalysts} />
        <NumberedList title="关键风险" items={recommendation.key_risks} />
      </div>

      <div className="investor-register">
        <div className="register-heading"><h3>分投资者建议</h3><p>动作只有在对应触发条件下成立</p></div>
        {recommendation.recommendations_by_investor_type.map((item) => (
          <article key={item.investor_type}>
            <h4>{item.investor_type}</h4><p className="investor-action">{item.action}</p><p>{item.trigger}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
