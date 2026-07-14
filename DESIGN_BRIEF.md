# DESIGN_BRIEF.md — Style B: Signal-Risk Decision Terminal

[AESTHETIC] 把静态 MANU 报告重组为高密度决策面：用稳定对齐、明度层级和一个受限信号色，让用户在同一视野识别五年经营变化、估值差异与数据质量异常；紧凑无衬线、表格数字和固定空间上下文承担专业感。
[SIGNATURE] 右侧常驻“异常轨道”按对投资判断的影响排列净负债上升、转播收入下滑、FCFF/EV 口径差异等信号，并与中央表格和图表同步定位。
[ANTI-DEFAULT] Reject 暗色 + 全站等宽字 + 霓虹数字的复古终端 cosplay，因为它会把专业性变成装饰并放大所有数值。Replace it with 多级中性明度、表格数字、少量高对比热点和真正改变阅读顺序的同步异常轨道。

## Approval And Integrity Metadata
- Style: B
- Approval authority: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\approval-registry.md`; approval exists only when this exact file hash appears there
- Approval record: Style B row in the external approval registry, created only after Ven confirms the complete three-brief set
- Hash algorithm: SHA-256 over the exact UTF-8 file bytes
- Approved whole-file SHA-256: stored in the external Arena registry and Candidate Record; do not write the digest value back into this file
- Brief commit record: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\candidates\style-b-record.md`; the commit value is added there after Stage 2 materialization
- Reference snapshot ID: `VDA-MANU-20260714-01-C5C2592E`
- Reference manifest: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\reference-manifest.txt`
- Absolute SKILL_ROOT: `C:\Users\26349\.codex\skills\vibe-design-arena`
- Skill provenance: `NO-GIT/HASHED`

## Product Snapshot
- Product and subject: MANU（Manchester United plc）中文投资研究报告 WebApp，围绕持有评级、经营表现、FCFF/同业估值、风险和数据质量展开。
- Content or data shape: 经 Zod 校验的 16 个顶层报告分区；含评级与目标价、FY2021–FY2025 多序列财务数据、估值假设与同业倍数、SWOT、投资建议及 5 条口径矛盾说明。
- Audience: 在 10–20 分钟内寻找变化、异常和风险集中点，习惯阅读财务表格与估值倍数的金融学习者和研究人员。
- Priority routes and screens: 总览信号面；财务趋势；估值对比；风险/催化剂；数据质量；loading/error/retry。
- Primary user flows: 从异常轨道选择高优先级信号，在中央矩阵复核期间/单位/数值，再切换到对应图表、估值或质量说明，最后回到评级影响。
- Brand and content constraints: 使用真实静态报告快照，不伪造实时行情、刷新频率或告警；保留原始单位与数值矛盾；不复制 Bloomberg 颜色、命令语法或品牌皮肤。

## Technical Snapshot
- Framework and runtime: Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Zod 4；Node.js 20.9+。
- Package manager: npm。
- Install command: `npm ci`。
- Development and preview commands: `npm run dev -- --hostname 127.0.0.1 --port 5174`；端口冲突时由主代理顺延并登记。
- Build, test, lint, and typecheck commands: `npm run validate:data`; `npm run test:api`; `npm run test:client`; `npm run lint`; `npm run build`（build 含 TypeScript 检查）。
- Required environment variables and local services: 无；本地 `manu_report.data.json` 经 `GET /api/report` 提供。
- Setup, code generation, or build-before-dev steps: 无代码生成；先 `npm ci`。Windows 沙箱内出现 `spawn EPERM` 时按原命令升级权限重试。
- Existing functionality that must be preserved: loading、success、error、retry；API/客户端错误边界；运行时数据校验；金额/百分比格式化；全部现有报告分区；响应式和可访问语义。

## 1. Subject / Audience / Single Job
- Subject: MANU FY2021–FY2025 的经营趋势、当前估值、安全边际和原报告数据矛盾构成的静态信号快照。
- Audience: 能读懂财务指标和 EV/Revenue 倍数、希望在约 15 分钟内定位风险/变化并决定深入阅读顺序的中文研究人员。
- Single job: 监测这份报告中最可能改变“持有”判断的经营与估值异常。

## 2. Aesthetic Thesis

把页面设计成高密度但有明确热点的决策终端，而不是暗色营销 dashboard。报告不是实时行情，因此所有时间状态明确标为 FY2021–FY2025 或报告快照；变化来自同一数据集内的期间比较和口径冲突。系统层面以稳定 L 形 chrome、中央财务/估值矩阵、同步趋势图和右侧异常轨道组织空间；紧凑无衬线、表格数字、多级明度与局部信号色形成身份，任何频繁操作保持立即响应。

## 3. Signature Element

“异常轨道”固定在桌面右侧，按“评级影响 × 证据强度”排列 4–7 个真实信号，例如净负债 FY2021→FY2025 上升、广播收入五年 CAGR 为负、调整后 EBITDA 改善、目标价上行仅 3.7%、EV 31.4/42.87 亿欧元矛盾。每项显示方向符号、期间/口径、简短影响、非颜色状态图形和跳转动作；选择后中央表格高亮同一行/列，趋势图定位相应序列，详情面板显示定义或质量注记。轨道只保留高优先级异常，不把所有数据变成告警。实现证据：轨道与数据区域共享可见选择状态和键盘焦点，切换时位置关系保持，窄屏将轨道变成首屏可横向浏览的优先级队列并提供展开详情。

## 4. One Justified Risk
- Benefit: 持续高密度让财务趋势、估值和口径异常尽量处于同一决策视野，减少长报告中的来回滚动。
- Failure mode: 暗色高密度可能造成视觉噪声、移动端挤压和“所有数值都重要”的错觉。
- Boundary or mitigation: 只允许少数高对比热点；其余层级依赖对齐、明度和细分规则线；默认优先级清晰，单位/期间固定；窄屏不压缩所有列，而是保留评级、变化、值和单位，次级证据进入可访问详情；红/绿之外必须有符号、标签或位置。

## 5. Anti-Default Declaration

[ANTI-DEFAULT] Reject 近黑背景、全站等宽字、霓虹绿/青和跳动数字组成的“金融终端”外观，因为本产品是有静态报告日期与数据口径的研究快照，这类装饰会伪造实时感并让每个数字争抢注意力。  
Replace it with 四级中性明度、紧凑无衬线 + 表格数字、清楚标注的期间/单位、只用于当前选择与异常的受限色，以及能同步表格/图表/详情的常驻异常轨道。

## 6. ASCII Wireframe

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ MANU / REPORT SNAPSHOT │ HOLD +3.7% │ FY2025 │ API VALID │ search / help   │
├──────────────┬─────────────────────────────────────────┬───────────────────┤
│ stable nav   │ signal matrix                           │ [SIGNATURE]       │
│ OVERVIEW     │ 指标        FY21  FY22  FY23  FY24 FY25 │ anomaly rail      │
│ FINANCIALS   │ Revenue     494   583   648   662  667  │ 01 Net debt ↑     │
│ VALUATION    │ EBITDA       95    81   155   148  183  │ 02 TV units !     │
│ RISKS        │ Net debt    420   515   613   649  749  │ 03 EV gap !       │
│ QUALITY (5)  │                                         │ 04 Upside 3.7%    │
│              ├─────────────────────────────────────────┤                   │
│ view modes   │ synchronized chart / valuation compare │ selected impact   │
│ table · chart│ ─ trend axes remain stable on selection│ definition / note │
├──────────────┴─────────────────────────────────────────┴───────────────────┤
│ continuation: split detail — thesis / risk / peer table / quality evidence │
└────────────────────────────────────────────────────────────────────────────┘

NARROW ≤ 640px
┌──────────────────────────────┐
│ HOLD +3.7% · FY2025 · VALID │
│ anomalies: [01][02][03][04] │
│ focused metric + trend       │
│ essential columns            │
│ value · unit · period · Δ    │
│ expandable detail            │
│ bottom task navigation       │
└──────────────────────────────┘
```

桌面约为“导航 14% / 决策面 61% / 异常轨道 25%”；中央区域持续高密度，只有当前选择和风险热点高对比。详情在中央下部/侧向分屏出现，不导航离开上下文。窄屏将导航转为底部/顶部任务切换，异常轨道变为优先级队列；表格按任务列裁剪并提供显式“更多列”，而不是把 5 年数据缩到不可读。

## 7. Observable Differences
- Versus Style A: B 首屏是高密度矩阵 + 异常轨道，A 是单一评级结论 + 纵向论证脊柱；B 使用稳定应用 chrome 和分屏，A 使用文章流和证据 breakout；B 以无衬线/表格数字和连续密度建立身份，A 以衬线判断和“宽松结论—紧凑证据”节奏建立身份；B 的选择反馈短促且空间连续，A 几乎静态。
- Versus Style C: B 按异常优先级监测数值，C 按研究对象与状态操作；B 的右轨道回答“哪里变了/哪里矛盾”，C 的右轨道回答“这个结论来自哪里/何时修订”；B 的中央是矩阵/图/分屏，C 的中央是对象摘要、属性和记录；B 是近黑高密度，C 是明亮中性、中高密度的工作区。
- Difference axes used: first-screen composition, primary mode, navigation, data role, density rhythm, surface logic, signature meaning, motion behavior.

## Token Summary
```yaml
color:
  canvas: "#101313 — persistent terminal field with no decorative glow"
  surface: "#181D1D — grouped matrix, split detail, and stable chrome regions"
  ink: "#F3F6F1 — primary labels and key comparable values"
  muted: "#8F9B96 — inactive values, definitions, units, and secondary periods"
  accent: "#D8A942 — keyboard focus, current view, and active selection only"
  signal: "#53B8A6 — bounded anomaly link/cursor; not a generic positive color"
  status: "success #68B58A, warning #D8A942, error #E0716E, stale #9AA29E; every state includes sign/icon/text/position"
type:
  display: "\"Inter Tight\", \"Arial Narrow\", \"Microsoft YaHei\", sans-serif — page state, rating, and section names; 600–750"
  body: "\"Inter\", \"Segoe UI\", \"PingFang SC\", sans-serif — controls, labels, explanations; 400–650"
  data: "ui-monospace, \"SFMono-Regular\", Consolas, monospace with tabular-nums — ticker, years, prices, percentages, values, shortcuts; not used for prose"
  scale: "page 28/32, panel 18/24, body 14/20, data 13/18, meta 11/16"
layout:
  concept: "stable L-shaped chrome around a synchronized metric matrix, chart/detail split, and persistent anomaly rail"
  wireframe: "see desktop three-region decision surface and narrow prioritized queue above"
  density: "continuously compact with only active selection and 4–7 anomalies as contrast hotspots"
  narrow: "prioritize rating, anomaly queue, focused metric, value/unit/period; reveal secondary columns and detail explicitly"
spacing:
  scale: "space-1/2/3/4/6 = 4/8/12/16/24"
  rule: "space-1–2 inside rows/cells; space-3–4 between panels; space-6 only at major task boundaries"
radius:
  scale: "radius-0, radius-xs, radius-pill"
  rule: "radius-0 for matrix/panels; radius-xs for controls/popovers; radius-pill only for compact status/filter selection"
motion:
  duration: "instant 0–60ms, fast 120ms, panel 180ms"
  easing: "enter fast ease-out, exit ease-in, move linear-to-ease-out for cursor continuity"
  distance: "maximum 12px for side-panel disclosure; table/chart selection does not translate"
  static: "numbers, axes, baselines, sorting results, and frequent navigation remain immediate/static"
  reduced: "remove panel translation and crossfades; switch state instantly while preserving focus, loading, and selection cues"
```

## Replaceability Test
- Identity without label: 移除 MANU 品牌后，FY2021–FY2025 财务矩阵、GBP/EUR/USD 单位、EV/Revenue 对比、净负债/EBITDA 信号和估值口径异常仍明确表达“个股投资报告风险监测”。
- Resistance to generic transplant: 异常优先级、同步行列、期间比较和质量冲突直接依赖这份报告的时间序列与估值字段；换成普通 SaaS 分析页或新闻站时，轨道内容、矩阵结构和选择模型不能原样使用。

## Domain Calibration
- Domain pack ID: `finance-data`
- Domain source ID: `finance-data/direction-b`
- Domain source snapshot SHA-256: `2E16EBC6BB7B023CCC18B73A16DC3CAC1B9D6F686F0735934C809FA2E4D74DB9`

### Adaptation And Precedence
- Normative contract: The user-approved seven elements, token summary, product constraints, and technical constraints above govern implementation.
- Calibration material: The complete domain source block below informs domain fidelity but does not override the normative contract.
- Conflict resolution: The source direction speaks of current signals; the product has no live feed. This brief resolves the conflict by defining “current” as the validated report snapshot and deriving anomalies only from FY2021–FY2025 comparisons, valuation fields, and data-quality notes. The implementation must never imply real-time quotes, alerts, or freshness beyond the data.
- Builder rule: If a conflict remains or appears later, stop and report it to the main agent. The builder must not reinterpret, rewrite, or choose between the two.

### Domain Direction Source — Complete Verbatim Copy
### Direction B — Analyst Signal Terminal

> **Purpose:** Supplies one domain-calibrated starting direction without exposing either sibling direction.
>
> **Readers:** The main agent only at this source path. The assigned builder receives this complete original text only through the worktree's root-level `DESIGN_BRIEF.md`.

**Reference logic:** Bloomberg Terminal + Linear.

**Best fit:** Monitor first; Compare second. Use when experts must detect changes, anomalies, and relationships without leaving the primary field of view.

**Aesthetic thesis:** Build a high-density decision surface where alignment, luminance, and one bounded signal color separate actionable change from background evidence. Speed and spatial continuity carry the product identity.

**System starting point:**

- Near-black or charcoal canvas with several surface/text luminance steps; one amber or cool accent for focus and key signal, not for every heading.
- Compact sans UI; tabular numerals; local mono only for identifiers, ticker, or strict fixed-width comparison.
- Stable L-shaped chrome or equivalent persistent context; list/table/chart/split views selected by task; detail in a side panel.
- Right-aligned values, stable decimals, low-area state markers, and brief local highlight for changed data.
- Frequent actions are immediate; popovers, panels, and focus movement use short, interruptible spatial transitions.

**Signature candidates — choose one:**

- a persistent anomaly rail that ranks and explains the few high-priority changes;
- a synchronized table-chart cursor that preserves comparison context;
- a split view where selection, evidence, and detail remain spatially connected.

**Justified risk:** High density can become indiscriminate noise. Bound it with a small number of contrast hotspots, stable alignment, and clear defaults for panel priority.

**Anti-default:** Reject retro green-terminal cosplay, full-site monospaced type, copied Bloomberg amber-black branding, neon glows, and animated-number spectacle.

**Brief fails when:**

- “terminal” means only dark mode plus mono type;
- every panel has equal weight or every value is highlighted;
- the primary route starts with marketing copy instead of current signals;
- mobile merely compresses all columns;
- motion delays filters, tabs, sorting, or keyboard work.
