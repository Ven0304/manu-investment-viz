import type { ManuReport } from "@/data/manu-report.schema";
import { formatMoney, formatPercent } from "@/lib/report-format";

type Props={report:ManuReport};
const fullRows=[
["total_revenue","总营收"],["commercial_revenue","商业收入"],["broadcasting_revenue","转播收入"],["matchday_revenue","比赛日收入"],["wages","工资支出"],["adjusted_ebitda","调整后 EBITDA"],["operating_pl","营业损益"],["net_loss","净亏损"],["net_debt","净负债"],
] as const;

function Heading({code,title,note}:{code:string;title:string;note?:string}){return <header className="section-heading"><div><span className="section-code">{code}</span><h2>{title}</h2></div>{note&&<p>{note}</p>}</header>}

export function FinancialSection({report}:Props){
 const h=report.financial_history;
 return <section className="report-section financial-detail"><Heading code="FINANCIALS / COMPLETE" title="完整财务轨迹" note={`${h.currency} · ${h.unit} · 负号按原报告保留`}/><div className="full-table" tabIndex={0} aria-label="可横向滚动的完整财务数据表"><table><thead><tr><th>指标</th>{h.years.map(y=><th key={y}>{y}</th>)}<th>5Y CAGR</th></tr></thead><tbody>{fullRows.map(([key,label])=><tr key={key}><th scope="row">{label}</th>{h.series[key].map((v,i)=><td key={h.years[i]} className={(v??0)<0?"negative-value":""}>{v===null?"—":v.toFixed(1)}</td>)}<td>{h.cagr_5yr_pct[key]==null?"n/a":formatPercent(h.cagr_5yr_pct[key]??0)}</td></tr>)}</tbody></table></div><p className="table-footnote">比赛日收入 FY2021 受特殊经营环境影响；CAGR 缺失项以 n/a 明示，不做推算。</p></section>
}

function latestPeers(peers:ManuReport["valuation"]["peer_comparison"]){const map=new Map<string,(typeof peers)[number]>();for(const peer of peers){const current=map.get(peer.club);if(!current||peer.fiscal_year>current.fiscal_year)map.set(peer.club,peer)}return [...map.values()]}

export function ValuationSection({report}:Props){
 const v=report.valuation;const f=v.fcff_model;const peers=latestPeers(v.peer_comparison);
 return <section id="valuation" className="report-section valuation-section"><Heading code="VALUATION / FCFF + PEERS" title="估值差异与同业参照" note="保留原报告口径，不在前端调和"/><div className="valuation-grid"><div className="fcff-block"><div className="value-pair"><div><span>基础计算 EV</span><strong>{formatMoney(f.enterprise_value.base_calculation)}</strong></div><div className="is-alert"><span>修正后 EV</span><strong>{formatMoney(f.enterprise_value.final_adjusted)}</strong></div></div><div className="assumption-grid"><div><span>WACC</span><b>{formatPercent(f.key_assumptions.wacc_pct)}</b></div><div><span>永续增长</span><b>{formatPercent(f.key_assumptions.terminal_growth_rate_pct)}</b></div><div><span>预测期 FCFF 现值</span><b>{formatMoney(f.pv_fcff_sum)}</b></div><div><span>终值现值</span><b>{formatMoney(f.terminal_value.present_value)}</b></div></div><p className="valuation-note"><span>≠</span>{f.enterprise_value.adjustment_note}</p><p className="fx-note">{f.fx_rate_note}</p></div><div className="peer-block"><h3>同业 EV / Revenue</h3><table><thead><tr><th>俱乐部</th><th>财年</th><th>企业价值</th><th>倍数</th></tr></thead><tbody>{peers.map(peer=><tr key={peer.club}><th scope="row">{peer.club}</th><td>FY{peer.fiscal_year}</td><td>{formatMoney(peer.enterprise_value)}</td><td><strong>{peer.ev_revenue_multiple.toFixed(2)}x</strong></td></tr>)}</tbody></table><p>同业数据取各俱乐部最新可用财年，单位和期间直接标注。</p></div></div></section>
}

export function SwotSection({report}:Props){
 const groups=[["S","优势","Strengths",report.swot.strengths],["W","劣势","Weaknesses",report.swot.weaknesses],["O","机会","Opportunities",report.swot.opportunities],["T","威胁","Threats",report.swot.threats]] as const;
 return <section className="report-section swot-section"><Heading code="POSITION / SWOT" title="竞争位置" note="标签用于定位，不以颜色单独编码"/><div className="swot-grid">{groups.map(([letter,title,en,items])=><article key={letter}><header><span>{letter}</span><div><small>{en}</small><h3>{title}</h3></div></header><div>{items.map(item=><section key={item.tag}><h4>{item.tag}</h4><p>{item.text}</p></section>)}</div></article>)}</div></section>
}

function NumberedList({title,items,kind}:{title:string;items:string[];kind:string}){return <div className="recommend-list"><h3><span>{kind}</span>{title}</h3><ol>{items.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol></div>}

export function RecommendationSection({report}:Props){
 const r=report.investment_recommendation;
 return <section id="risks" className="report-section recommendation-section"><Heading code="DECISION INPUTS" title="催化剂、风险与投资者动作" note="均来自静态报告快照"/><div className="recommend-grid"><NumberedList title="催化剂" kind="+ UP" items={r.catalysts}/><NumberedList title="关键风险" kind="! RISK" items={r.key_risks}/></div><div className="investor-actions"><header><span>INVESTOR TYPE</span><span>ACTION</span><span>TRIGGER / BASIS</span></header>{r.recommendations_by_investor_type.map(item=><article key={item.investor_type}><h3>{item.investor_type}</h3><strong>{item.action}</strong><p>{item.trigger}</p></article>)}</div></section>
}
