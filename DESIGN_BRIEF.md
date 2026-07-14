# DESIGN_BRIEF.md — Style C: Traceable Research Workspace

[AESTHETIC] 把 MANU 报告变成可导航、可追踪的研究工作区：稳定的研究对象导航、完整状态和渐进详情承担操作效率，少量衬线判断只标记投资结论；明亮中性表面、关键线和适中密度让来源、修订与下一步始终可见。
[SIGNATURE] 一条与当前研究对象同步的“溯源轨道”，把每个结论连接到报告分区、数据路径、期间/单位、质量状态和修订需求，并提供返回对象与后续核查动作。
[ANTI-DEFAULT] Reject 通用 SaaS 侧栏 + 圆角 CRUD 卡片，因为它会把投资论证伪装成任意后台并让来源/口径退化为次要文本。Replace it with 研究对象工作区、结构化属性/历史和承担实际导航与核查任务的同步溯源轨道。

## Approval And Integrity Metadata
- Style: C
- Approval authority: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\approval-registry.md`; approval exists only when this exact file hash appears there
- Approval record: Style C row in the external approval registry, created only after Ven confirms the complete three-brief set
- Hash algorithm: SHA-256 over the exact UTF-8 file bytes
- Approved whole-file SHA-256: stored in the external Arena registry and Candidate Record; do not write the digest value back into this file
- Brief commit record: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\candidates\style-c-record.md`; the commit value is added there after Stage 2 materialization
- Reference snapshot ID: `VDA-MANU-20260714-01-C5C2592E`
- Reference manifest: `C:\Users\26349\.codex\visualizations\2026\07\14\019f606a-4fa6-7e23-87f8-52307bf5597b\vibe-design-arena\runs\manu-investment-viz-20260714-01\reference-manifest.txt`
- Absolute SKILL_ROOT: `C:\Users\26349\.codex\skills\vibe-design-arena`
- Skill provenance: `NO-GIT/HASHED`

## Product Snapshot
- Product and subject: MANU（Manchester United plc）中文投资研究报告 WebApp，围绕持有评级、经营表现、FCFF/同业估值、风险和数据质量展开。
- Content or data shape: 经 Zod 校验的 16 个顶层报告分区；含评级与目标价、公司/资产/赞助信息、FY2021–FY2025 财务数据、估值假设与同业倍数、竞争分析、投资建议及 5 条口径矛盾说明。
- Audience: 希望系统浏览、筛选、追踪结论和口径问题，并把一次阅读转化为后续核查清单的金融学习者和研究人员。
- Priority routes and screens: 研究总览；结论对象；财务/估值对象；竞争与风险；建议；质量/修订记录；loading/error/retry。
- Primary user flows: 从左侧选择研究对象，在主区查看摘要、关键属性与证据，在右侧复核数据路径/期间/质量状态，再标记下一项需要核查的材料或返回相关章节。
- Brand and content constraints: 使用真实报告数据；当前数据没有独立来源 URL、协作账户或持久化后端，不得伪造用户、保存、版本提交或外部来源；“溯源”限定为报告分区、字段路径、期间/单位和已存在的数据质量记录。

## Technical Snapshot
- Framework and runtime: Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Zod 4；Node.js 20.9+。
- Package manager: npm。
- Install command: `npm ci`。
- Development and preview commands: `npm run dev -- --hostname 127.0.0.1 --port 5175`；端口冲突时由主代理顺延并登记。
- Build, test, lint, and typecheck commands: `npm run validate:data`; `npm run test:api`; `npm run test:client`; `npm run lint`; `npm run build`（build 含 TypeScript 检查）。
- Required environment variables and local services: 无；本地 `manu_report.data.json` 经 `GET /api/report` 提供。
- Setup, code generation, or build-before-dev steps: 无代码生成；先 `npm ci`。Windows 沙箱内出现 `spawn EPERM` 时按原命令升级权限重试。
- Existing functionality that must be preserved: loading、success、error、retry；API/客户端错误边界；运行时数据校验；金额/百分比格式化；全部现有报告分区；响应式和可访问语义。

## 1. Subject / Audience / Single Job
- Subject: 由结论、财务/估值对象、风险建议和数据质量记录构成的 MANU 研究资产及其内部溯源关系。
- Audience: 需要逐项核查报告字段、理解结论依据并记录后续关注重点，工作时间约 20–30 分钟的中文金融学习者和研究人员。
- Single job: 追踪一个投资结论从报告对象到数据口径和质量状态的完整路径。

## 2. Aesthetic Thesis

把研究报告从一次性长页变成有对象、有状态、有上下文的操作系统，但不伪造协作或保存功能。稳定左导航展示结论、财务、估值、竞争、建议和质量对象；中央工作区呈现当前对象的判断、属性、证据和相关动作；右侧溯源轨道持续解释数据路径、期间/单位与质量状态。系统以明亮中性表面、精细关键线、无衬线 UI 和表格数字构成工作层，只有短投资判断使用衬线，从而让 authorial voice 不污染控件和数据。

## 3. Signature Element

“溯源轨道”位于桌面右侧，并与中央当前研究对象同步。它至少显示对象名称、报告分区、字段路径、期间/币种/单位、API 校验状态、是否关联 `data_quality_notes`、相关结论和“返回证据/查看质量说明”动作；没有外部来源时明确写“当前数据未提供独立来源 URL”，不得生成虚假引用。每次只跟随一个当前对象，避免整页堆叠元数据。实现证据：选择财务指标、FCFF 企业价值、同业倍数或建议条目时轨道内容和可见焦点同步更新；从质量说明可返回对应对象；窄屏轨道变为对象详情中的可展开“溯源与口径”区，关闭后焦点返回触发控件。

## 4. One Justified Risk
- Benefit: 稳定应用壳和对象模型能把长报告转成可重复核查的研究流程，让数据质量不再只是页尾附注。
- Failure mode: 侧栏与分区结构可能变成通用 CRUD 后台，压低报告的投资判断和作者声音；虚构“版本/来源/保存”功能也会误导用户。
- Boundary or mitigation: 所有导航项、对象属性和轨道字段必须来自真实 schema；只用一处衬线结论角色保持研究声音；没有持久化后端的动作限定为本地视图切换、锚点跳转和可撤销筛选；不宣称已保存、已协作或已引用外部来源。

## 5. Anti-Default Declaration

[ANTI-DEFAULT] Reject 泛化的左侧栏、顶部搜索和一组圆角 CRUD 卡片，因为同一外壳可以容纳任何管理后台，无法证明这是投资研究，也会让数据口径与质量矛盾继续埋在页尾。  
Replace it with 按真实报告对象组织的导航、当前对象的摘要/属性/证据/关联建议，以及与对象同步、能返回证据并暴露缺失来源的溯源轨道。

## 6. ASCII Wireframe

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ MANU Research Workspace       HOLD · snapshot valid        object search   │
├──────────────────┬───────────────────────────────────┬─────────────────────┤
│ research objects │ current object                    │ [SIGNATURE]         │
│ ● Investment view│ “安全边际有限”                    │ provenance rail     │
│ ○ Company        │ HOLD / $17.50 → $18.14 / +3.7%   │ section: valuation  │
│ ○ Financials     │ short serif judgment              │ path: target_price… │
│ ○ Valuation      ├───────────────────────────────────┤ period/unit/currency│
│ ○ Competition    │ attributes / evidence             │ API: validated      │
│ ○ Risks          │ assumption groups · peer table    │ quality: linked (2) │
│ ○ Recommendation │ related catalyst / risk           │ missing source URL  │
│ ! Quality (5)    │ next review focus                 │ return to evidence  │
├──────────────────┴───────────────────────────────────┴─────────────────────┤
│ continuation: object history / related evidence / quality-note timeline    │
└────────────────────────────────────────────────────────────────────────────┘

NARROW ≤ 640px
┌──────────────────────────────┐
│ object switcher + HOLD state │
│ current object judgment      │
│ attributes                   │
│ evidence / chart / table     │
│ [溯源与口径 ▾]               │
│ related quality notes        │
│ task navigation              │
└──────────────────────────────┘
```

桌面约为“对象导航 19% / 工作区 56% / 溯源轨道 25%”；主区按“摘要 → 关键属性 → 证据 → 相关记录”渐进展开，只有独立对象或动作边界使用表面。窄屏将对象导航改为可搜索/可键盘操作的切换器，溯源轨道成为详情 disclosure；任何质量状态、单位和返回关系必须可访问，不能因隐藏侧栏而丢失。

## 7. Observable Differences
- Versus Style A: C 以对象选择和当前状态开场，A 以评级结论和文章论证开场；C 使用稳定侧栏、工作区与溯源详情，A 使用连续阅读轴与宽幅 evidence breakout；C 的衬线仅标记短投资判断，A 的衬线承担整份报告章节身份；C 通过选择/展开操作，A 主要阅读与锚点跳转。
- Versus Style B: C 的主问题是“此结论来自哪里、口径和质量状态是什么”，B 的主问题是“哪个数字变化或矛盾最值得注意”；C 是明亮中性、中高密度并按对象渐进披露，B 是近黑、持续高密度并用异常热点；C 的签名轨道承载溯源/返回关系，B 的签名轨道承载异常优先级/同步数据选择；C 动效用于层级和 disclosure，B 用于快速选择和空间连续。
- Difference axes used: primary mode, first-screen promise, navigation model, spatial grammar, type identity, surface logic, data role, signature meaning, motion posture.

## Token Summary
```yaml
color:
  canvas: "#F6F7F4 — application field and stable workspace background"
  surface: "#FFFFFF — selected object, grouped attributes, popover, and independent state"
  ink: "#202522 — primary UI text, conclusions, and key values"
  muted: "#66706A — metadata, inactive navigation, definitions, and secondary evidence"
  accent: "#3F5F8A — actions, focus, current object, and links only"
  signal: "#8A433A — provenance/quality attention and bounded authorial judgment"
  status: "success #39745A, warning #A06C23, error #A84444, stale #737A76; every status includes label/icon and explicit text"
type:
  display: "\"Noto Serif SC\", \"Songti SC\", Georgia, serif — one-line investment propositions and object chapter identity only; 600–700"
  body: "\"Inter\", \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif — navigation, object properties, explanations, and controls; 400–650"
  data: "ui-monospace, \"SFMono-Regular\", Consolas, monospace with tabular-nums — values, periods, currencies, field paths, and validation metadata"
  scale: "page 36/44, object 24/32, section 18/26, body 15/24, meta 12/18"
layout:
  concept: "stable research-object navigation, focused workspace, and a synchronized provenance rail with progressive detail"
  wireframe: "see desktop object/workspace/provenance layout and narrow disclosure transformation above"
  density: "calm object summary, medium-density attributes, high-density tables and history only where needed"
  narrow: "replace sidebar with object switcher and provenance rail with a focus-returning disclosure; preserve state and metadata"
spacing:
  scale: "space-1/2/3/4/6/8 = 4/8/12/16/24/32"
  rule: "space-1–3 within object groups; space-4–6 between summary/evidence/history; space-8 only at major workspace boundaries"
radius:
  scale: "radius-0, radius-sm, radius-md, radius-pill"
  rule: "radius-0 for tables/keyline regions; radius-sm for controls; radius-md only for independent state/action boundaries; radius-pill for status/filter tokens"
motion:
  duration: "instant 0–80ms, fast 140ms, panel 200ms"
  easing: "enter ease-out, exit ease-in, move standard ease-in-out"
  distance: "maximum 12px for provenance disclosure or object-detail panel"
  static: "reading copy, charts, numbers, tables, and object summary remain static"
  reduced: "replace sliding panels with instant visibility; preserve focus return, selection, validation, and loading feedback"
```

## Replaceability Test
- Identity without label: 即使移除 MANU 名称，对象导航中的 Investment view / Financials / Valuation / Risks / Quality、字段路径、期间/币种、验证状态和质量关联仍明确表达一个投资研究工作区。
- Resistance to generic transplant: 对象类型、溯源字段、FCFF/同业估值、FY 财务序列、投资者建议和质量注记均来自该报告 schema；换成通用 CRM 或任务管理器时，导航、轨道、状态和详情结构不能原样成立。

## Domain Calibration
- Domain pack ID: `finance-data`
- Domain source ID: `finance-data/direction-c`
- Domain source snapshot SHA-256: `77D2CA61C5FDDF68C25F38779B03F3D865242CC6E496484B57CD9E864F5344A3`

### Adaptation And Precedence
- Normative contract: The user-approved seven elements, token summary, product constraints, and technical constraints above govern implementation.
- Calibration material: The complete domain source block below informs domain fidelity but does not override the normative contract.
- Conflict resolution: The source direction allows save/trace/update workflows, but this product has no authentication or persistence layer. This brief limits operation to real report-object navigation, view state, filters, anchors, quality links, and focus-safe disclosure. It must not claim saved state, collaboration, external source URLs, or revision commits that do not exist.
- Builder rule: If a conflict remains or appears later, stop and report it to the main agent. The builder must not reinterpret, rewrite, or choose between the two.

### Domain Direction Source — Complete Verbatim Copy
### Direction C — Research Operating System

> **Purpose:** Supplies one domain-calibrated starting direction without exposing either sibling direction.
>
> **Readers:** The main agent only at this source path. The assigned builder receives this complete original text only through the worktree's root-level `DESIGN_BRIEF.md`.

**Reference logic:** Stripe + Linear for operations, with Every for bounded authorial voice.

**Best fit:** Operate first; Explain second. Use when users navigate, filter, save, trace, and update a body of research while retaining source and thesis context.

**Aesthetic thesis:** Turn research into a durable, traceable product system: stable navigation and complete object states make the work operational, while selective typographic voice marks conclusions without contaminating the controls.

**System starting point:**

- Bright neutral canvas and deep-gray text; one indigo or other bounded action color; low-saturation section colors may organize research domains but must not enter control semantics.
- Neutral sans for application, body, and object properties; optional distinctive serif only for investment propositions, chapter titles, or short conclusion quotations.
- Stable left navigation, focused research area, and optional source/definition panel; summary, object detail, and event history use progressive disclosure.
- Tables and grouped lists remain primary; KPI cards are limited to true summaries or action boundaries.
- Navigation, state, panel, and disclosure transitions are light and short; reading and chart first frames remain static.

**Signature candidates — choose one:**

- a provenance rail linking each conclusion to source, timestamp, and revision history;
- a research-object workspace that keeps thesis, evidence, and actions synchronized;
- a section-aware annotation system that changes authorial tone without changing control semantics.

**Justified risk:** A stable operating shell can feel generic or suppress authorial judgment. Bound it by giving one conclusion or provenance element a distinctive typographic role while keeping the rest quiet.

**Anti-default:** Reject a Stripe-purple marketing page, generic SaaS settings chrome, excessive cards, and decorative Every-style handwriting. The identity must come from traceability and state completeness.

**Brief fails when:**

- the shell could host any CRUD product without modification;
- purple or indigo is the only connection to Stripe's route;
- every research object is a rounded card;
- sources and revisions remain secondary text rather than an operational feature;
- the serif accent spreads into controls, tables, or long UI copy.
