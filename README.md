# MANU 投资报告可视化

将曼联（MANU）投资研究报告转为经过运行时校验的数据资产，并通过 Next.js WebApp 展示投资结论、财务趋势、估值、SWOT、投资建议和数据质量说明。

## 当前技术栈

- **Next.js App Router**：统一组织 React 页面与 API Route。
- **TypeScript**：在开发和构建时检查组件、函数与报告字段的使用。
- **Tailwind CSS**：实现响应式页面布局和样式。
- **Zod**：在服务器端运行时校验真实报告 JSON，并由 schema 推导 TypeScript 类型。

仓库根目录中的 `index.html`、`app.js` 和 `styles.css` 是迁移前的静态种子版本，继续保留作为基准，不是当前应用入口。

## 目录职责

```text
manu_report.data.json               MANU 报告数据实例
manu_report.schema.json             原始 JSON Schema 数据契约
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

当前工作区目录名包含 `&`，因此 npm scripts 显式调用本地 Node 入口，以避开 Windows 对 `node_modules/.bin` 路径的解析问题。

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

静态种子版本用于验证“结构化数据 → 页面展示”的最小闭环。现代栈版本进一步增加了明确的 API 边界、运行时数据校验、类型安全、可复用组件和完整错误状态，为后续独立探索多套视觉方向提供稳定基础。
