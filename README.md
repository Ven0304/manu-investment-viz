# MANU 投资报告可视化

将曼联（MANU）投资研究报告转为经过运行时校验的数据资产，并通过 Next.js WebApp 展示投资结论、财务趋势、估值、SWOT、投资建议和数据质量说明。

## 当前设计版本

当前分支采用 Style A 的更新版本：Evidence-Led Investment Dossier。页面以中性白底、理性深蓝强调和杂志式排版组织研究结论；中文采用本地衬线阅读字体，英文标题采用 Times 系列、正文采用修长无衬线字体。

- 桌面端提供章节导航，移动端使用粘性跳转导航；结论—证据脊柱连接投资判断与对应证据。
- 保留评级与目标价、核心投资逻辑、FY2021–FY2025 财务趋势、FCFF/同业估值、SWOT、催化剂、风险、分投资者建议和数据质量说明。
- 桌面、移动端及键盘操作共享同步的章节选中状态。
- 已覆盖 320px、834px 和 1440px 布局，以及 loading、error、retry 状态。
- 支持简体中文与英文切换：选择会保存在浏览器中；英文视图使用展示层译文映射，不改写原始报告 JSON 或校验链路。
- 字体全部通过本地字体栈回退，不依赖网络字体服务。

其他独立设计分支保留完整历史并可单独运行：

- [`style-b`](https://github.com/Ven0304/manu-investment-viz/tree/style-b)：财务信号比较分析工作台。
- [`style-c`](https://github.com/Ven0304/manu-investment-viz/tree/style-c)：证据溯源与对象检查研究终端。

## 项目演进与关键版本节点

项目先以原生静态页面启动，随后完成现代前端栈与受控数据层迁移；在 `main` 稳定后，使用 Vibe Design Arena 基于同一基线创建三个独立 `git worktree` 方案。最终选择 Style A 合入主线，Style B/C 作为可单独运行的备选分支保留。

```text
1387b52  原生静态页面种子版本（HTML + CSS + JavaScript）
    │
cade213  开始 Next.js 应用迁移
    │
2849ffa  完成报告区块迁移（Next.js + TypeScript + Tailwind + Zod）
    │
8ea94cd  移除已被迁移替代的 app.js / index.html / styles.css
    │
d29b5f7  固化 Arena worktree 忽略规则，作为三方案共同基线
    ├── 6c55e29  Style A 实现 → 72c2d1d 最终润色 → ae0d014 QA 修复 → main
    ├── 93d5bdd  Style B 实现 → 5211912 QA 修复（保留在 style-b）
    └── dc21324  Style C 实现 → 2dd8949 QA 修复（保留在 style-c）
             │
          f01c1be  记录已选设计分支
```

| 节点 | 提交 | 说明 |
| --- | --- | --- |
| 原生版本起点 | [`1387b52`](https://github.com/Ven0304/manu-investment-viz/commit/1387b528ac74882dfc4cc89c11801b2958079a0f) | 种子版本；仓库包含 `index.html`、`styles.css` 和 `app.js`，尚未引入框架。 |
| 迁移启动 | [`cade213`](https://github.com/Ven0304/manu-investment-viz/commit/cade213) | 建立 Next.js 应用骨架，并引入 TypeScript、Tailwind 等现代工程配置。 |
| 迁移完成 | [`2849ffa`](https://github.com/Ven0304/manu-investment-viz/commit/2849ffa0e9c9e325eeef192ec64d722c6a09a66b) | 报告页面及组件迁移完成；此前用于迁移的 `codex/nextjs-migration` 已合入 `main` 并删除。 |
| 清理旧静态实现 | [`8ea94cd`](https://github.com/Ven0304/manu-investment-viz/commit/8ea94cd98a7a58a73356ac5403f83eb0047572d5) | 删除迁移后不再使用的原生 `app.js`、`index.html` 与 `styles.css`。 |
| Arena 共同基线 | [`d29b5f7`](https://github.com/Ven0304/manu-investment-viz/commit/d29b5f77f40c6fb63e9cb0430ab4018b86641248) | 为三套 worktree 设计方案准备共同基线与忽略规则。 |
| 选中方案：Style A | [`6c55e29`](https://github.com/Ven0304/manu-investment-viz/commit/6c55e29437c943efa5c9af2ad09f81401d369e46) → [`ae0d014`](https://github.com/Ven0304/manu-investment-viz/commit/ae0d01422a7588c6f9d1736cde6e4c12406cd2d4) | 实现、视觉润色与可访问性/交互 QA 后，沿主线进入当前版本。 |
| 保留方案：Style B | [`93d5bdd`](https://github.com/Ven0304/manu-investment-viz/commit/93d5bddb9e207af4ec32d4de9a9488942cf29b9b) → [`5211912`](https://github.com/Ven0304/manu-investment-viz/commit/5211912) | 未合入 `main`，完整历史保留在 [`style-b`](https://github.com/Ven0304/manu-investment-viz/tree/style-b)。 |
| 保留方案：Style C | [`dc21324`](https://github.com/Ven0304/manu-investment-viz/commit/dc21324de1ef7a27f5bd2671bcdcbf0c9455a4fe) → [`2dd8949`](https://github.com/Ven0304/manu-investment-viz/commit/2dd8949) | 未合入 `main`，完整历史保留在 [`style-c`](https://github.com/Ven0304/manu-investment-viz/tree/style-c)。 |
| 当前主线记录 | [`f01c1be`](https://github.com/Ven0304/manu-investment-viz/commit/f01c1bee2eb70fd22c3ed31f6dc91fc9e5912918) | 记录最终选择 Style A，以及 Style B/C 的保留方式。 |

## 当前技术栈

- **Next.js App Router**：统一组织 React 页面与 API Route。
- **TypeScript**：在开发和构建时检查组件、函数与报告字段的使用。
- **Tailwind CSS**：实现响应式页面布局和样式。
- **Zod**：在服务器端运行时校验真实报告 JSON，并由 schema 推导 TypeScript 类型。

## 目录职责

```text
manu_report.data.json               MANU 报告数据实例
manu_report.schema.json             原始 JSON Schema 数据契约
DESIGN_BRIEF.md                     Style A 已确认的设计方向与实施约束
src/data/manu-report.schema.ts      应用层 Zod schema 与 TypeScript 类型
src/data/manu-report.ts             服务器端受控数据读取与校验
src/app/api/report/route.ts         GET /api/report
src/server/report-response.ts       API 成功和失败响应边界
src/lib/report-client.ts            浏览器端 API 请求与错误处理
src/lib/report-format.ts            币种、单位和百分比格式化
src/lib/i18n.ts                     简中/英文界面文案与报告译文映射
src/components/report-sections.tsx  财务、估值、SWOT 与投资建议区块
src/app/page.tsx                    加载、成功、错误及重试状态与首页结构
scripts/                            数据、API 和客户端验证脚本
```

## 数据流

```text
manu_report.data.json
  → Zod schema 校验
  → 服务器端受控数据层
  → GET /api/report
  → 浏览器 fetch
  → React 页面状态与报告组件
```

页面不直接导入报告 JSON，也不在组件中写死报告数值。金额对象各自携带 `currency` 与可选 `unit`，页面按对象自身的 GBP、EUR 或 USD 口径展示。原报告中的数值矛盾不在展示层擅自修正，统一保留在 `data_quality_notes`；英文页面的文案译文同样只位于展示层。

## 本地运行

需要 Node.js 20.9 或更高版本。

```bash
npm ci
npm run dev
```

然后访问 `http://localhost:3000`。

## 验证命令

```bash
npm run validate:data
npm run test:api
npm run test:client
npm run lint
npm run build
```

- `validate:data`：用真实 MANU JSON 执行完整 Zod 校验。
- `test:api`：覆盖 API 的 `200` 成功响应和安全 `500` 校验失败响应。
- `test:client`：覆盖浏览器端成功、API 错误、非法 JSON 与金额格式化。
- `lint`：检查 React、TypeScript 和项目代码规范。
- `build`：执行生产编译、TypeScript 检查与路由生成。

> 在部分 Windows 沙箱环境中，`npm run build` 可能在编译成功后因 `spawn EPERM` 无法启动后续工作进程；可用 `node node_modules/typescript/bin/tsc --noEmit` 配合上述数据、API、客户端与 lint 检查验证代码。

## 页面结构

1. 封面、评级、当前价、目标价与潜在涨幅
2. 核心投资逻辑与主要风险
3. 五年财务表现与趋势图
4. FCFF 估值摘要与同业 EV/Revenue 对比
5. SWOT 分析
6. 催化剂、关键风险与分投资者建议
7. 数据质量说明

## 技术选型理由

当前版本通过明确的 API 边界、运行时数据校验、类型安全、可复用组件和完整错误状态，将长篇投资报告组织为可核对的结论—证据界面。三套 Arena 方案均保留完整 Git 历史；`main` 与 `style-a` 指向最终采用版本，`style-b` 和 `style-c` 保留为可独立运行的备选方向。
