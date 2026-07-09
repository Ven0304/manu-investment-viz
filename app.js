const DATA_URL = './manu_report.data.json';
const app = document.querySelector('#app');

const COLORS = ['#8d1e1e', '#0f5e55', '#b48a33', '#343a46'];
const MISSING = '数据未披露';

fetch(DATA_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(renderReport)
  .catch((error) => {
    app.innerHTML = '';
    const section = el('section', 'error');
    section.append(
      el('h1', '', '无法读取报告数据'),
      el('p', '', `请通过本地静态服务器打开页面，并确认 ${DATA_URL} 与 index.html 位于同一目录。`),
      el('p', '', error.message)
    );
    app.append(section);
  });

function renderReport(data) {
  app.innerHTML = '';
  const page = el('div', 'page');

  page.append(
    renderHero(data),
    renderThesis(data),
    renderFinancials(data),
    renderValuation(data),
    renderSwot(data),
    renderRecommendation(data),
    renderQualityNotes(data)
  );

  app.append(page);
}

function renderHero(data) {
  const meta = data.meta || {};
  const summary = data.executive_summary || {};
  const subject = meta.subject_company || meta.report_title || 'MANU';
  const displayName = (meta.report_title || '').replace(/\u6295\u8d44\u7814\u7a76\u62a5\u544a/g, '').trim() || `${subject} ${meta.ticker || ''}`.trim();

  const hero = el('section', 'hero');
  const inner = el('div', 'hero-inner');
  inner.append(
    el('p', 'eyebrow', `${meta.ticker || 'MANU'} Investment Report`),
    el('h1', '', displayName),
    el('p', 'subhead', subject)
  );

  const metrics = el('div', 'hero-metrics');
  [
    ['投资评级', summary.rating],
    ['目标价 USD', formatMoney(summary.target_price_usd)],
    ['目标价 EUR', formatMoney(summary.target_price_eur)],
    ['当前价', formatMoney(summary.current_price_usd)],
    ['潜在涨幅', formatPct(summary.upside_pct)]
  ].forEach(([label, value]) => metrics.append(metric(label, value)));

  inner.append(metrics);
  hero.append(inner);
  return hero;
}

function renderThesis(data) {
  const summary = data.executive_summary || {};
  const section = sectionShell('核心论点');
  const grid = el('div', 'lead-grid');
  const copy = el('div', 'analysis-copy');
  const thesis = arrayOrEmpty(summary.core_thesis);

  if (thesis.length) {
    thesis.forEach((item) => copy.append(el('p', '', item)));
  } else {
    copy.append(el('p', 'missing', MISSING));
  }

  const aside = el('aside');
  aside.append(el('div', 'minor-heading', 'Risk Factors'));
  const risks = el('ul', 'risk-list');
  arrayOrEmpty(summary.risk_factors).forEach((risk) => risks.append(el('li', '', risk)));
  if (!risks.children.length) risks.append(el('li', 'missing', MISSING));
  aside.append(risks);

  grid.append(copy, aside);
  section.append(grid);
  return section;
}

function renderFinancials(data) {
  const history = data.financial_history || {};
  const section = sectionShell('财务表现');
  const stats = el('div', 'stat-grid');
  const years = arrayOrEmpty(history.years);
  const series = history.series || {};
  const lastIndex = Math.max(0, years.length - 1);

  stats.append(
    stat(formatMoney({ value: getAt(series.total_revenue, lastIndex), currency: history.currency, unit: history.unit }), 'FY2025 总营收'),
    stat(formatMoney({ value: getAt(series.adjusted_ebitda, lastIndex), currency: history.currency, unit: history.unit }), 'FY2025 调整后 EBITDA'),
    stat(formatMoney({ value: getAt(series.net_debt, lastIndex), currency: history.currency, unit: history.unit }), 'FY2025 净负债'),
    stat(formatPct((history.cagr_5yr_pct || {}).total_revenue), '总营收五年 CAGR')
  );

  const chartShell = el('div', 'chart-shell');
  chartShell.append(chartHeading('五年趋势', `单位：${currencyName(history.currency)} ${unitName(history.unit)}`));
  chartShell.append(lineChart(years, [
    { label: '总营收', values: series.total_revenue, color: COLORS[0] },
    { label: '调整后 EBITDA', values: series.adjusted_ebitda, color: COLORS[1] },
    { label: '净负债', values: series.net_debt, color: COLORS[2] }
  ]));
  chartShell.append(legend([
    ['总营收', COLORS[0]],
    ['调整后 EBITDA', COLORS[1]],
    ['净负债', COLORS[2]]
  ]));

  section.append(stats, chartShell);
  return section;
}

function renderValuation(data) {
  const valuation = data.valuation || {};
  const fcff = valuation.fcff_model || {};
  const ev = fcff.enterprise_value || {};
  const tv = fcff.terminal_value || {};
  const section = sectionShell('估值分析');

  const stats = el('div', 'stat-grid');
  stats.append(
    stat(formatMoney(ev.final_adjusted), '修正后企业价值'),
    stat(formatMoney(ev.base_calculation), '原文基础计算'),
    stat(formatMoney(tv.present_value), '终值现值'),
    stat(formatPct((fcff.key_assumptions || {}).wacc_pct), 'WACC')
  );

  const layout = el('div', 'valuation-layout');
  const panel = el('div', 'text-panel');
  panel.append(
    el('p', '', ev.adjustment_note || MISSING),
    el('p', '', fcff.fx_rate_note || ''),
    el('p', '', `终值未折现：${formatMoney(tv.undiscounted)}。稳定增长率：${formatPct((fcff.key_assumptions || {}).terminal_growth_rate_pct)}。`)
  );

  const peers = latestPeerRows(arrayOrEmpty(valuation.peer_comparison));
  const chartShell = el('div', 'chart-shell');
  chartShell.append(chartHeading('同业 EV/Revenue 对比', '取每个俱乐部最新财年记录'));
  chartShell.append(barChart(peers.map((row, index) => ({
    label: `${row.club || 'Club'} ${row.fiscal_year || ''}`,
    value: row.ev_revenue_multiple,
    color: COLORS[index % COLORS.length]
  })), 'x'));

  layout.append(panel, chartShell);
  section.append(stats, layout);
  return section;
}

function renderSwot(data) {
  const swot = data.swot || {};
  const section = sectionShell('竞争格局');
  const grid = el('div', 'swot-grid');
  const groups = [
    ['Strengths', swot.strengths],
    ['Weaknesses', swot.weaknesses],
    ['Opportunities', swot.opportunities],
    ['Threats', swot.threats]
  ];

  groups.forEach(([title, items]) => {
    const block = el('article', 'swot-block');
    block.append(el('h3', '', title));
    const list = arrayOrEmpty(items);
    if (!list.length) {
      block.append(el('p', 'missing', MISSING));
    }
    list.forEach((item) => {
      const row = el('div', 'swot-item');
      row.append(el('strong', '', item.tag || MISSING), el('p', '', item.text || MISSING));
      block.append(row);
    });
    grid.append(block);
  });

  section.append(grid);
  return section;
}

function renderRecommendation(data) {
  const rec = data.investment_recommendation || {};
  const section = sectionShell('投资建议');
  const grid = el('div', 'recommendation-grid');

  const catalysts = listBlock('Catalysts', rec.catalysts);
  const risks = listBlock('Key Risks', rec.key_risks);
  const table = el('div', 'investor-table');
  arrayOrEmpty(rec.recommendations_by_investor_type).forEach((item) => {
    const row = el('div', 'investor-row');
    row.append(
      el('strong', '', item.investor_type || MISSING),
      el('span', '', item.action || MISSING),
      el('p', '', item.trigger || MISSING)
    );
    table.append(row);
  });
  if (!table.children.length) table.append(el('p', 'missing', MISSING));

  grid.append(catalysts, risks, table);
  section.append(grid);
  return section;
}

function renderQualityNotes(data) {
  const section = sectionShell('数据说明');
  section.classList.add('quality');
  const details = el('details');
  const summary = el('summary', '', '展开数据矛盾与抽取说明');
  details.append(summary);

  arrayOrEmpty(data.data_quality_notes).forEach((note, index) => {
    const item = el('article', 'quality-note');
    item.append(
      el('h3', '', `说明 ${index + 1}`),
      el('code', '', note.path || ''),
      el('p', '', note.issue || MISSING),
      pre(JSON.stringify(note.values_found || [], null, 2))
    );
    details.append(item);
  });

  if (details.children.length === 1) {
    details.append(el('p', 'missing', MISSING));
  }

  section.append(details);
  return section;
}

function sectionShell(title) {
  const section = el('section', 'section');
  section.append(el('h2', '', title));
  return section;
}

function metric(label, value) {
  const node = el('div', 'metric');
  node.append(el('span', 'metric-label', label), el('span', 'metric-value', value || MISSING));
  return node;
}

function stat(value, label) {
  const node = el('div', 'stat');
  node.append(el('strong', '', value || MISSING), el('span', '', label));
  return node;
}

function listBlock(title, items) {
  const block = el('div');
  block.append(el('div', 'minor-heading', title));
  const list = el('ul', 'simple-list');
  arrayOrEmpty(items).forEach((item) => list.append(el('li', '', item)));
  if (!list.children.length) list.append(el('li', 'missing', MISSING));
  block.append(list);
  return block;
}

function chartHeading(title, note) {
  const row = el('div', 'chart-title-row');
  row.append(el('h3', '', title), el('span', 'chart-note', note || ''));
  return row;
}

function lineChart(labels, series) {
  const width = 980;
  const height = 380;
  const pad = { top: 28, right: 38, bottom: 44, left: 64 };
  const allValues = series.flatMap((line) => arrayOrEmpty(line.values).filter(isNumber));
  if (!labels.length || !allValues.length) return el('p', 'missing', MISSING);

  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (plotW * index) / Math.max(1, labels.length - 1);
  const y = (value) => pad.top + plotH - ((value - min) / span) * plotH;
  const svg = svgNode('svg', { class: 'chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': '五年财务趋势图' });

  [0, 0.25, 0.5, 0.75, 1].forEach((ratio) => {
    const yy = pad.top + plotH * ratio;
    svg.append(svgNode('line', { x1: pad.left, y1: yy, x2: width - pad.right, y2: yy, class: 'grid-line' }));
  });

  labels.forEach((label, index) => {
    svg.append(svgText(x(index), height - 14, label));
  });

  series.forEach((line) => {
    const values = arrayOrEmpty(line.values);
    const points = values
      .map((value, index) => isNumber(value) ? `${x(index)},${y(value)}` : null)
      .filter(Boolean);
    if (points.length < 2) return;
    svg.append(svgNode('polyline', { points: points.join(' '), class: 'series-line', stroke: line.color }));
    values.forEach((value, index) => {
      if (!isNumber(value)) return;
      svg.append(svgNode('circle', { cx: x(index), cy: y(value), r: 5, fill: line.color, class: 'point' }));
    });
  });

  svg.append(svgNode('line', { x1: pad.left, y1: pad.top, x2: pad.left, y2: height - pad.bottom, class: 'axis-line' }));
  svg.append(svgNode('line', { x1: pad.left, y1: height - pad.bottom, x2: width - pad.right, y2: height - pad.bottom, class: 'axis-line' }));
  svg.append(svgText(8, pad.top + 6, String(Math.round(max))));
  svg.append(svgText(8, height - pad.bottom, String(Math.round(min))));
  return svg;
}

function barChart(rows, suffix) {
  const width = 760;
  const height = Math.max(220, rows.length * 68 + 70);
  const pad = { top: 24, right: 70, bottom: 34, left: 170 };
  const max = Math.max(...rows.map((row) => row.value || 0), 1);
  const svg = svgNode('svg', { class: 'chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': '同业估值倍数对比图' });
  const plotW = width - pad.left - pad.right;

  rows.forEach((row, index) => {
    const y = pad.top + index * 68;
    const barW = plotW * ((row.value || 0) / max);
    svg.append(svgText(0, y + 30, row.label || MISSING, 'bar-row-label'));
    svg.append(svgNode('rect', { x: pad.left, y, width: barW, height: 34, fill: row.color || COLORS[0] }));
    svg.append(svgText(pad.left + barW + 10, y + 24, `${formatNumber(row.value)}${suffix || ''}`, 'bar-value'));
  });

  svg.append(svgNode('line', { x1: pad.left, y1: pad.top - 12, x2: pad.left, y2: height - pad.bottom, class: 'axis-line' }));
  return svg;
}

function legend(items) {
  const node = el('div', 'legend');
  items.forEach(([label, color]) => {
    const item = el('span', 'legend-item');
    item.append(el('span', 'swatch'), document.createTextNode(label));
    item.querySelector('.swatch').style.background = color;
    node.append(item);
  });
  return node;
}

function latestPeerRows(rows) {
  const byClub = new Map();
  rows.forEach((row) => {
    if (!row || !row.club) return;
    const current = byClub.get(row.club);
    if (!current || (row.fiscal_year || 0) > (current.fiscal_year || 0)) {
      byClub.set(row.club, row);
    }
  });
  return Array.from(byClub.values());
}

function formatMoney(amount) {
  if (!amount || !isNumber(amount.value)) return MISSING;
  const symbol = { GBP: '£', EUR: '€', USD: '$' }[amount.currency] || `${amount.currency || ''} `;
  const unit = amount.unit === 'million' ? 'm' : amount.unit === 'billion' ? 'bn' : '';
  const value = unit ? formatNumber(amount.value) : Number(amount.value).toFixed(2);
  return `${symbol}${value}${unit}`;
}

function formatPct(value) {
  return isNumber(value) ? `${formatNumber(value)}%` : MISSING;
}

function formatNumber(value) {
  if (!isNumber(value)) return MISSING;
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function currencyName(currency) {
  return { GBP: '英镑', EUR: '欧元', USD: '美元' }[currency] || currency || '';
}

function unitName(unit) {
  return { million: '百万', billion: '十亿' }[unit] || unit || '';
}

function getAt(values, index) {
  return Array.isArray(values) ? values[index] : null;
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function pre(text) {
  const node = document.createElement('pre');
  node.textContent = text;
  return node;
}

function svgNode(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  return node;
}

function svgText(x, y, text, className) {
  const node = svgNode('text', { x, y });
  if (className) node.setAttribute('class', className);
  node.textContent = text;
  return node;
}
