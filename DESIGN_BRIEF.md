# DESIGN_BRIEF.md — Style A: Evidence-Led Investment Dossier

[AESTHETIC] 把 MANU 投资报告处理成一条可阅读、可复核的结论链：评级与核心判断先建立论点，财务、估值与风险证据只在论证需要时突破阅读栏宽；中文衬线标题承担判断，克制的无衬线正文与等宽数字承担证据和操作。
[SIGNATURE] 一条贯穿首页与各章节的“结论—证据脊柱”，逐项连接投资判断、关键数字、图表、口径说明和数据质量注记，并在窄屏转为章节内联标记。
[ANTI-DEFAULT] Reject 把报告切成 KPI 卡片墙和独立图表岛屿，因为它会打断投资逻辑、掩盖证据与结论的因果关系。Replace it with 单一阅读轴、带编号的结论—证据脊柱和仅在必要处出现的宽幅数据突破区。

## Approval And Integrity Metadata
- Style: A
- Approval authority: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\approval-registry.md`; approval exists only when this exact file hash appears there
- Approval record: Style A row in the external approval registry, created only after Ven confirms the complete three-brief set
- Hash algorithm: SHA-256 over the exact UTF-8 file bytes
- Approved whole-file SHA-256: stored in the external Arena registry and Candidate Record; do not write the digest value back into this file
- Brief commit record: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\candidates\style-a-record.md`; the commit value is added there after Stage 2 materialization
- Reference snapshot ID: `VDA-MANU-20260714-01-C5C2592E`
- Reference manifest: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\reference-manifest.txt`
- Absolute SKILL_ROOT: `C:\Users\26349\.codex\skills\vibe-design-arena`
- Skill provenance: `NO-GIT/HASHED`

## Product Snapshot
- Product and subject: MANU（Manchester United plc）中文投资研究报告 WebApp，围绕持有评级、经营表现、FCFF/同业估值、风险和数据质量展开。
- Content or data shape: 经 Zod 校验的 16 个顶层报告分区；含评级与目标价、FY2021–FY2025 多序列财务数据、估值假设与同业倍数、SWOT、投资建议及 5 条口径矛盾说明。
- Audience: 在 15–30 分钟内审阅一份个股研究、需要区分结论、证据、假设与口径风险的金融学习者和研究人员。
- Priority routes and screens: 单页报告首屏；核心投资逻辑；财务趋势；估值；风险/建议；数据质量；loading/error/retry。
- Primary user flows: 先判断评级与上行空间，再沿核心论点定位财务和估值证据，最后复核风险、适用投资者与数据矛盾。
- Brand and content constraints: 使用真实 MANU 数据；不得编造实时行情、来源或修正原报告数值；保留 GBP/EUR/USD 和 million/billion 口径；不复制 FT 粉色、报头或曼联官网皮肤。

## Technical Snapshot
- Framework and runtime: Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Zod 4；Node.js 20.9+。
- Package manager: npm。
- Install command: `npm ci`。
- Development and preview commands: `npm run dev -- --hostname 127.0.0.1 --port 5173`；端口冲突时由主代理顺延并登记。
- Build, test, lint, and typecheck commands: `npm run validate:data`; `npm run test:api`; `npm run test:client`; `npm run lint`; `npm run build`（build 含 TypeScript 检查）。
- Required environment variables and local services: 无；本地 `manu_report.data.json` 经 `GET /api/report` 提供。
- Setup, code generation, or build-before-dev steps: 无代码生成；先 `npm ci`。Windows 沙箱内出现 `spawn EPERM` 时按原命令升级权限重试。
- Existing functionality that must be preserved: loading、success、error、retry；API/客户端错误边界；运行时数据校验；金额/百分比格式化；全部现有报告分区；响应式和可访问语义。

## 1. Subject / Audience / Single Job
- Subject: MANU 的“持有”投资判断及其财务趋势、估值依据、主要风险和口径矛盾组成的证据链。
- Audience: 熟悉基础估值但需要快速复核论证是否自洽、阅读时间约 20 分钟的中文金融学习者和初级研究人员。
- Single job: 解释“为什么当前结论是持有”，并让每个关键判断都能追溯到相邻证据或口径说明。

## 2. Aesthetic Thesis

让页面像一份可引用的投资备忘录，而不是把报告文字装进 dashboard。评级、结论和影响先建立阅读方向；财务趋势、同业倍数、FCFF 假设和数据质量注记沿同一论证轴出现。系统层面采用窄而稳定的阅读栏、克制的中文衬线标题、无衬线正文/控件、表格数字和少量宽幅证据突破区；背景与规则线承担层级，卡片只用于真正独立的对象或错误状态。

## 3. Signature Element

“结论—证据脊柱”位于桌面首屏主阅读栏左侧，并贯穿核心逻辑、财务、估值、建议和质量说明。每个节点承载一个短结论、证据类型标签、对应关键值与跳转锚点；读者沿脊柱可从“持有 / +3.7%”进入商业护城河、EBITDA 改善、净负债上升、FCFF 口径差异等证据。重复规则是每个主章节最多 1–3 个节点，只标记真正改变判断的材料。实现证据：DOM 中存在可聚焦的章节锚点、活动节点状态和对应 `aria-current`/可见标签；财务图、估值表和质量注记均能由节点直接定位，窄屏将节点转为章节标题下的内联“判断 → 证据”条。

## 4. One Justified Risk
- Benefit: 强烈的窄栏阅读轴会把报告从“信息集合”变成有先后次序的投资论证，显著提高结论与证据的可复核性。
- Failure mode: 扫描速度可能下降，宽表与多序列财务数据可能显得拥挤或被过度文学化。
- Boundary or mitigation: 结论区保持宽松，但所有数字比较、控件、元数据和表格使用无衬线/表格数字；宽数据只在明确标注的 evidence breakout 中突破栏宽；章节目录与脊柱节点提供直接跳转，不使用滚动劫持或段落入场动画。

## 5. Anti-Default Declaration

[ANTI-DEFAULT] Reject 通用 KPI 卡片行 + 图表卡片网格，因为 MANU 报告的价值来自评级、论点、证据和口径风险之间的连续关系，卡片墙会让每块信息看似同等重要。  
Replace it with 一条主阅读轴、结论—证据脊柱、正文内嵌小证据和少量带标题/定义/来源位置的宽幅数据突破区。

## 6. ASCII Wireframe

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ MANU / Investment Dossier       报告日期·币种口径      章节目录 / 数据状态 │
├──────────────┬───────────────────────────────────────┬─────────────────────┤
│ sticky       │ HOLD · 目标价 $18.14 · +3.7%         │ 报告身份 / 口径     │
│ contents     │ 曼联的品牌现金流仍稳，但杠杆与估值    │ author / API valid  │
│ 01 判断      │ 矛盾限制安全边际                     │ GBP / EUR / USD     │
│ 02 财务      │                                       │                     │
│ 03 估值      │ [SIGNATURE] 结论—证据脊柱            │ margin qualification│
│ 04 风险      │ ● 商业护城河 → 赞助 / 商业收入       │ 每章仅放定义、口径  │
│ 05 质量      │ ● 效率改善   → EBITDA / 工资          │ 与风险提示          │
│              │ ● 安全边际弱 → 净债务 / FCFF 差异    │                     │
├──────────────┴───────────────────────────────────────┴─────────────────────┤
│ continuation: 章节正文（窄栏）                                              │
│   结论段落 → 财务图 / 同业表（必要时宽幅 breakout）→ 影响 → 数据质量注记    │
├────────────────────────────────────────────────────────────────────────────┤
│ 适用投资者 / 催化剂 / 风险，以连续规则线分组，不做通用卡片墙               │
└────────────────────────────────────────────────────────────────────────────┘

NARROW ≤ 640px
┌─────────────────────────────┐
│ sticky jump bar: 判断·财务… │
│ HOLD / $18.14 / +3.7%       │
│ [结论 → 证据] 内联脊柱条    │
│ 正文                         │
│ 横向可访问的宽表 / 图        │
│ 定义与质量注记紧随证据       │
└─────────────────────────────┘
```

桌面以“目录 18% / 主阅读 57% / 资格注记 25%”为起点；正文内部大部分维持约 68–76 个中文字符的舒适行宽，图表/表格突破到主栏与右栏。窄屏取消三列并将目录改为可键盘操作的粘性跳转条，脊柱变成内联序列；任何关键值、单位或质量注记不得因折叠而丢失。

## 7. Observable Differences
- Versus Style B: A 首屏由一个评级结论和纵向证据脊柱支配，B 首屏由持续高密度的信号矩阵与右侧异常轨道支配；A 是长篇文章流和少量 breakout，B 是稳定 chrome、表格/图/分屏；A 以中文衬线判断建立身份且几乎静态，B 以无衬线/表格数字建立身份并提供短促空间反馈。
- Versus Style C: A 按论证顺序滚动并让来源/口径成为旁注，C 按研究对象与状态导航并让溯源成为常驻操作轨道；A 的主动作是阅读和跳转，C 的主动作是选择对象、切换状态和查看记录；A 使用暖纸面与最少表面，C 使用明亮中性工作区、稳定侧栏和渐进详情。
- Difference axes used: first-screen composition, typographic hierarchy, spatial organization, density rhythm, navigation model, motion behavior, signature placement.

## Token Summary
```yaml
color:
  canvas: "#F3EFE5 — continuous report field; not a copied publication brand color"
  surface: "#FFFDF7 — evidence breakout, table field, and independent error state"
  ink: "#1D1B16 — primary claims, body copy, and key values"
  muted: "#6C665C — dates, definitions, units, paths, and secondary evidence"
  accent: "#245E73 — links, focus, current section, and interactive selection only"
  signal: "#8A2E35 — rating judgment and conclusion-spine nodes only"
  status: "success #2F6B52, warning #9A641A, error #9A3B37, stale #706A62; each paired with icon/text/position, never color alone"
type:
  display: "\"Noto Serif SC\", \"Songti SC\", Georgia, serif — rating thesis and chapter identity; 600–700; display/page/section sizes"
  body: "\"Inter\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif — reading copy, UI, definitions, and controls; 400–650"
  data: "ui-monospace, \"SFMono-Regular\", Consolas, monospace with tabular-nums — prices, percentages, years, table values, data paths"
  scale: "display 56/64, page 40/48, section 28/36, body 16/28, meta 12/18; narrow sizes reduce one level without collapsing roles"
layout:
  concept: "a single argument axis with a persistent conclusion-to-evidence spine and occasional aligned evidence breakouts"
  wireframe: "see the desktop three-region and narrow inline-spine wireframes above"
  density: "claims and transitions breathe; tables, chart labels, and quality notes are compact but aligned"
  narrow: "collapse side regions into a sticky jump bar and inline qualifications; preserve full values via scroll or drill-down"
spacing:
  scale: "space-1/2/3/4/6/8/12 = 4/8/12/16/24/32/48"
  rule: "space-1–3 within evidence groups; space-6–12 between argument turns and chapters"
radius:
  scale: "radius-0, radius-sm, radius-pill"
  rule: "radius-0 for report fields/tables; radius-sm for buttons and error state; radius-pill only for compact status/filter tokens"
motion:
  duration: "instant 0–80ms, fast 140ms, panel 200ms"
  easing: "enter ease-out, exit ease-in, move standard ease-in-out"
  distance: "maximum 8px for disclosure or active-node feedback; no large scroll choreography"
  static: "body reading, numbers, charts, headings, and chapter entry remain static"
  reduced: "remove translation and smooth scrolling; retain immediate focus, selection, loading, and validation feedback"
```

## Replaceability Test
- Identity without label: 即使移除 MANU 名称，首屏仍通过“持有评级 → 目标价/上行空间 → 商业现金流/效率/杠杆/估值矛盾”的证据脊柱表达一份公司投资报告，而不是通用内容站。
- Resistance to generic transplant: 结论节点、FY2021–FY2025 财务证据、GBP/EUR/USD 口径、FCFF 矛盾和分投资者建议直接依赖本报告的数据模型；换成任务管理或电商产品时，该脊柱、breakout 和 token 角色不能原样成立。

## Domain Calibration
- Domain pack ID: `finance-data`
- Domain source ID: `finance-data/direction-a`
- Domain source snapshot SHA-256: `54CBBE91FF916DBB665FC9D301C10405D018BDD614E0356E6010C900B8060787`

### Adaptation And Precedence
- Normative contract: The user-approved seven elements, token summary, product constraints, and technical constraints above govern implementation.
- Calibration material: The complete domain source block below informs domain fidelity but does not override the normative contract.
- Conflict resolution: The domain source permits a readable serif or sans body; this brief resolves that range by reserving serif for Chinese investment judgments and chapter identity, while body copy, controls, metadata, and all comparable numbers remain sans/tabular for scanning. No recognizable FT surface treatment is permitted.
- Builder rule: If a conflict remains or appears later, stop and report it to the main agent. The builder must not reinterpret, rewrite, or choose between the two.

### Domain Direction Source — Complete Verbatim Copy
### Direction A — Editorial Investment Dossier

> **Purpose:** Supplies one domain-calibrated starting direction without exposing either sibling direction.
>
> **Readers:** The main agent only at this source path. The assigned builder receives this complete original text only through the worktree's root-level `DESIGN_BRIEF.md`.

**Reference logic:** Financial Times + Stratechery, with optional Every-style authorial annotation.

**Best fit:** Explain first; Compare second. Use when the product's value lies in an argument, an investment thesis, a report, or a chain from claim to evidence.

**Aesthetic thesis:** Treat the product as a readable and citable research object rather than a dashboard containing report text. Typography establishes judgment; charts and tables interrupt the measure only when the evidence needs width.

**System starting point:**

- Warm or low-chroma high-value canvas; near-black text; one cool interaction color and one restrained judgment/section accent.
- Serif display for claims and chapter identity; readable serif or sans body; sans UI and metadata; tabular numeric features for comparisons.
- One primary reading axis, visible source/date context, deliberate chapter transitions, and limited chart/table breakouts.
- Takeaway chart titles, direct labels, source notes, and tables with minimal rules.
- Reading remains static; contents navigation, filters, annotations, and disclosure receive brief feedback.

**Signature candidates — choose one:**

- a conclusion-to-evidence spine that links each claim to charts, source, and implication;
- a margin-note system that carries provenance, definitions, and analyst qualification;
- a controlled evidence breakout where wide data temporarily exceeds the reading measure.

**Justified risk:** Strong editorial voice can slow scanning or become nostalgic. Bound it by keeping all operations, metadata, and numeric comparison in restrained sans/tabular roles.

**Anti-default:** Reject dark terminal styling, KPI-card walls, fake newspaper furniture, and scroll-revealed paragraphs. Do not copy FT pink, a newspaper masthead, or another recognizable surface treatment.

**Brief fails when:**

- it says “editorial” but keeps a generic dashboard grid;
- serif type appears in filters and tiny table labels without a reading reason;
- the warm palette is the only connection to editorial authority;
- charts are decorative islands rather than steps in an argument;
- the signature is merely a large headline.
