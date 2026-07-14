# MANU 投资报告可视化

将曼联（MANU）投资研究报告转为经过运行时校验的数据资产，并通过 Next.js WebApp 展示投资结论、财务趋势、估值、SWOT、投资建议和数据质量说明。

## 当前设计版本

`main` 当前采用 Style A：Evidence-Led Investment Dossier。页面以冷调浅灰色哑光报纸材质为基础，使用克制的酒红色强调，并明确区分中文阅读字体、界面字体和数据字体的职责。

- 桌面端提供章节导航，移动端使用粘性跳转导航；结论—证据脊柱连接投资判断与对应证据。
- 保留评级与目标价、核心投资逻辑、FY2021–FY2025 财务趋势、FCFF/同业估值、SWOT、催化剂、风险、分投资者建议和数据质量说明。
- 桌面、移动端及键盘操作共享同步的章节选中状态。
- 已覆盖 320px、834px 和 1440px 布局，以及 loading、error、retry 状态。
- 中文衬线阅读字体通过本地字体栈回退，不依赖网络字体服务。

其他独立设计分支保留完整历史并可单独运行：

- [`style-b`](https://github.com/Ven0304/manu-investment-viz/tree/style-b)：财务信号比较分析工作台。
- [`style-c`](https://github.com/Ven0304/manu-investment-viz/tree/style-c)：证据溯源与对象检查研究终端。

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

页面不直接导入报告 JSON，也不在组件中写死报告数值。金额对象各自携带 `currency` 与可选 `unit`，页面按对象自身的 GBP、EUR 或 USD 口径展示。原报告中的数值矛盾不在展示层擅自修正，统一保留在 `data_quality_notes`。

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
