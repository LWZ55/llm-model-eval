# Wealth Wallet 七大模型代码质量对比分析

## 1. 项目概述

基于相同的提示词，分别使用 **Auto、Claude、DeepSeek、GLM、Kimi、MiniMax、Qwen** 七个大模型生成了财富钱包应用（Wealth Wallet），包含 Python 后端 + React 前端。核心需求：记录账户存款/负债、券商持仓、多币种（CNY/USD/HKD）、折线图/饼状图、antd 样式。

---

## 2. 后端架构对比

### 2.1 整体结构

| 维度 | Auto | Claude | DeepSeek | GLM | Kimi | MiniMax | Qwen |
|------|------|--------|----------|-----|------|---------|------|
| 框架 | FastAPI | FastAPI | FastAPI | FastAPI | FastAPI | FastAPI | FastAPI |
| 分层 | main+crud | router+service | 单文件main | router分层 | router分层 | 单文件main | route+utils分层 |
| ORM | SQLAlchemy | SQLAlchemy | SQLAlchemy | SQLAlchemy(async) | SQLAlchemy | SQLAlchemy | SQLAlchemy |
| 数据库 | SQLite | SQLite(data/) | SQLite | SQLite(async) | SQLite | SQLite | SQLite |
| TS | JS | **TypeScript** | JS | JS | JS | **TypeScript** | JS |

### 2.2 代码组织

- **Claude**：最佳分层 —— `routers/`(4个路由模块) + `services/balance.py`(业务逻辑层)，职责清晰，路由器模式规范，是唯一将汇率转换逻辑抽象为独立 service 的实现。
- **Qwen**：`routes/`(4个模块) + `utils/calculations.py`，分层合理但计算逻辑未使用 Decimal。
- **Kimi**：`routers/`(4个模块)，分层合理但缺少独立的 service 层。
- **GLM**：使用 `routers/` 分层，且是唯一使用 **async SQLAlchemy + aiosqlite** 的实现，但异步数据库在 SQLite 场景下收益有限且增加了复杂度。
- **Auto**：`main.py` + `crud.py` 分层，将所有路由放在 main.py 中，通过 crud.py 做数据访问，属于中等组织。
- **DeepSeek**：341行单文件 `main.py`，所有路由和辅助函数混在一起，代码组织最差。
- **MiniMax**：395行单文件 `main.py`，与 DeepSeek 类似，代码臃肿。

### 2.3 数据模型

| 模型 | Auto | Claude | DeepSeek | GLM | Kimi | MiniMax | Qwen |
|------|------|--------|----------|-----|------|---------|------|
| Account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Transaction | ✅ | ✅ | ✅ | ❌(拆为Deposit+Liability) | ✅ | ✅ | ✅ |
| StockHolding | ✅ | ✅(Holding) | ✅ | ✅ | ✅ | ✅ | ✅ |
| BalanceSnapshot | ❌ | ✅ | ✅(BalanceHistory) | ✅ | ❌ | ❌ | ❌ |
| ExchangeRate | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**关键差异**：
- **Claude** 是唯一实现了 `ExchangeRate` 模型的实现，汇率可持久化、可更新，支持 inverse rate 查找。其他实现的汇率要么硬编码要么没有。
- **Claude** 的 `BalanceSnapshot` 模型带 `UniqueConstraint`，确保每个账户每天只有一条快照，且 `history()` 方法实现了 forward-fill 缺失日期，是折线图数据最稳健的方案。
- **GLM** 将 Transaction 拆分为 `Deposit` 和 `Liability` 两个独立表，虽然语义更明确，但增加了代码复杂度，也不符合一般金融系统的 Transaction 设计惯例。
- **MiniMax** 的 Account 模型直接存储 `balance` 字段，在 Transaction 创建/删除时手动更新，存在数据一致性风险。

### 2.4 数值精度

| 实现 | 金额类型 | 精度风险 |
|------|----------|----------|
| **Claude** | `Numeric(18,2)` + Python `Decimal` | ✅ 无浮点误差 |
| Auto | `Float` | ⚠️ 有浮点误差风险 |
| DeepSeek | `Float` | ⚠️ 有浮点误差风险 |
| GLM | `Float` | ⚠️ 有浮点误差风险 |
| Kimi | `Float` | ⚠️ 有浮点误差风险 |
| MiniMax | `Float` | ⚠️ 有浮点误差风险 |
| Qwen | `Float` | ⚠️ 有浮点误差风险 |

**Claude** 是唯一使用 `Decimal` 算术的实现，数据库列用 `Numeric(18,2)` / `Numeric(18,4)`，从根本上避免了金融计算的浮点精度问题。其他所有实现均使用 `Float`，在金额累加时可能出现 `0.1 + 0.2 != 0.3` 的问题。

### 2.5 多币种处理

| 实现 | 汇率机制 | 跨币种聚合 |
|------|----------|-----------|
| **Claude** | 数据库 ExchangeRate 表，支持 API 更新 | ✅ 自动转换到基础币种(CNY) |
| GLM | 硬编码汇率常量 | ⚠️ 硬编码，仅 CNY 等价换算 |
| MiniMax | 硬编码汇率字典 | ⚠️ 硬编码，且汇率值有误 |
| Qwen | 无汇率转换 | ❌ 直接加总不同币种 |
| Auto | 无汇率转换 | ❌ 直接加总不同币种 |
| DeepSeek | 无汇率转换 | ❌ 直接加总不同币种 |
| Kimi | 无汇率转换 | ❌ 直接加总不同币种 |

**这是最关键的差异之一**：只有 Claude 和 GLM/MiniMax 做了跨币种换算，其中 Claude 的实现最完善。Auto/DeepSeek/Kimi/Qwen 在 `/api/total-balance` 或 `/api/summary` 中直接将 CNY、USD、HKD 金额相加，这在金融系统中是严重错误。

MiniMax 的汇率字典有明显错误：`"USD": {"CNY": 0.138}` 表示 1 USD = 0.138 CNY，实际应为 ~7.24；`"HKD": {"CNY": 1.087}` 表示 1 HKD = 1.087 CNY，实际应为 ~0.92。base/quote 方向搞反了。

### 2.6 Schema 验证

| 实现 | 验证强度 |
|------|----------|
| **Claude** | `Literal` 类型约束 + `Field(gt=0, min_length, max_length)` |
| Auto | Enum 约束，基础验证 |
| Qwen | Enum 约束，基础验证 |
| DeepSeek | 纯 `str` 类型，无约束 |
| GLM | 纯 `str` 类型，无约束 |
| Kimi | 纯 `str` 类型，无约束 |
| MiniMax | 纯 `str` 类型，无约束 |

Claude 使用 `Literal["bank", "brokerage", "transit_card"]` 代替 enum，配合 `Field(gt=0)` 等约束，API 入参验证最严格。

### 2.7 API 设计

| 实现 | API 规范性 | HTTP 状态码 | DELETE 返回 |
|------|-----------|------------|------------|
| **Claude** | RESTful，带 tags | 201/204 正确使用 | 204 No Content |
| Qwen | RESTful，带 tags | 基本正确 | 200 + message |
| Auto | RESTful | 基本正确 | 200 + message |
| DeepSeek | RESTful | 基本正确 | 200 + message |
| GLM | RESTful | 基本正确 | 200 + message |
| Kimi | RESTful | 基本正确 | 200 + message |
| MiniMax | RESTful | 基本正确 | 200 + message |

### 2.8 余额历史折线图

| 实现 | 方案 | 数据质量 |
|------|------|----------|
| **Claude** | BalanceSnapshot + forward-fill | ✅ 最稳健，每天有数据点 |
| DeepSeek | SQL 聚合按天计算 | ⚠️ 30天循环查询，N+1性能问题 |
| Auto | 交易时序推算 | ⚠️ 仅在有交易的日期有数据点 |
| MiniMax | 交易时序推算 | ⚠️ 预填充7天零值 |
| Qwen | 交易聚合 | ⚠️ 仅在有交易的日期有数据点 |
| GLM | BalanceSnapshot 查询 | ⚠️ 依赖快照写入频率 |
| Kimi | 无明确实现 | ❌ 需确认 |

---

## 3. 前端架构对比

### 3.1 技术栈

| 实现 | 语言 | UI 框架 | 图表库 | 路由版本 |
|------|------|---------|--------|----------|
| Auto | JSX | antd 6 | recharts 3 | react-router v7 |
| **Claude** | **TSX** | **antd CSS(自定义)** | **recharts 2** | **react-router v6** |
| DeepSeek | JSX | antd 6 | recharts 3 | react-router v7 |
| GLM | JSX | antd 6 + dayjs | recharts 3 | react-router v7 |
| Kimi | JSX | antd 6 + lucide-react | recharts 2 | react-router v6 |
| MiniMax | **TSX** | **Tailwind CSS** | recharts 2 | react-router v6 |
| Qwen | JSX | **MUI (Material UI)** | recharts 2 | react-router v6 |

**关键发现**：
- **需求明确要求 antd**，但 Qwen 使用了 MUI (Material UI)，MiniMax 使用了 Tailwind CSS —— 这是不遵循需求的表现。
- **Claude** 使用 TypeScript，类型安全性最佳。
- **MiniMax** 虽是 TypeScript，但 UI 框架选择与需求不符。
- Auto/DeepSeek/GLM 使用了较新的 antd 6 + react-router v7。

### 3.2 组件结构

| 实现 | 组件数 | 页面数 | 组件粒度 |
|------|--------|--------|----------|
| DeepSeek | 7 | 2 | 最细(7组件) |
| **Claude** | **6** | **3** | **合理(6组件+Settings页)** |
| Auto | 5 | 3 | 合理 |
| Qwen | 6 | 4 | 合理(多出Transactions/StockHoldings页) |
| GLM | 1 | 3 | 粗粒度(组件全写在页面中) |
| Kimi | 1 | 3 | 粗粒度(仅Navbar组件) |
| MiniMax | 0 | 3 | 无独立组件(全写在页面中) |

- **Claude** 的组件拆分最为合理：`AccountCard`、`AccountPieChart`、`BalanceChart`、`HoldingsTable`、`NewAccountForm`、`TransactionList`，每个组件职责单一。
- **DeepSeek** 组件最多(7个)，但有些组件（如 `SummaryCards`) 过于碎片化。
- **GLM/Kimi/MiniMax** 组件几乎无拆分，大量逻辑堆在页面文件中（GLM 的 AccountDetail 达 20KB）。

### 3.3 路由与页面

| 实现 | Dashboard | 账户列表 | 账户详情 | 饼状图 | 折线图 | 其他 |
|------|-----------|----------|----------|--------|--------|------|
| Auto | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| **Claude** | **✅** | **✅(Dashboard内)** | **✅** | **✅** | **✅** | **Settings(汇率)** |
| DeepSeek | ✅ | ❌ | ✅ | ✅ | ✅ | - |
| GLM | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Kimi | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| MiniMax | ✅ | ❌ | ✅ | ✅ | ✅ | NewAccount |
| Qwen | ✅ | ✅ | ❌ | ✅ | ✅ | Transactions/StockHoldings独立页 |

- **Qwen** 缺少账户详情页，使用独立页面替代（Transactions 页、StockHoldings 页），架构与需求偏离。
- **DeepSeek** 缺少账户列表页。
- **Claude** 独有 Settings 页面，可查看和修改汇率，功能最完整。

---

## 4. 功能完整性对比

| 功能需求 | Auto | Claude | DeepSeek | GLM | Kimi | MiniMax | Qwen |
|----------|------|--------|----------|-----|------|---------|------|
| 账户CRUD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 存款/负债记录 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 券商持仓 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 多币种(CNY/USD/HKD) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 自动计算余额 | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️(手动更新) | ✅ |
| 跨币种换算 | ❌ | ✅ | ❌ | ⚠️ | ❌ | ⚠️(汇率有误) | ❌ |
| 折线图(账户余额) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 饼状图(账户占比) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| antd 图标/样式 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌(Tailwind) | ❌(MUI) |
| 账户类型校验(券商才能加持仓) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 5. 代码质量详细评分

### 5.1 后端评分 (满分10分)

| 维度 | Auto | Claude | DeepSeek | GLM | Kimi | MiniMax | Qwen |
|------|------|--------|----------|-----|------|---------|------|
| 代码组织 | 6 | **9** | 3 | 7 | 6 | 3 | 7 |
| 数据模型 | 7 | **9** | 6 | 6 | 6 | 5 | 7 |
| 数值精度 | 5 | **10** | 5 | 5 | 5 | 5 | 5 |
| 多币种处理 | 3 | **10** | 3 | 6 | 3 | 4 | 3 |
| Schema验证 | 7 | **9** | 4 | 4 | 4 | 4 | 7 |
| API设计 | 7 | **9** | 6 | 7 | 7 | 6 | 7 |
| 历史数据方案 | 5 | **9** | 4 | 6 | 3 | 5 | 4 |
| **后端总分** | **40** | **65** | **31** | **41** | **34** | **32** | **40** |

### 5.2 前端评分 (满分10分)

| 维度 | Auto | Claude | DeepSeek | GLM | Kimi | MiniMax | Qwen |
|------|------|--------|----------|-----|------|---------|------|
| 技术选型合规 | 9 | **9** | 9 | 9 | 9 | 4 | 3 |
| 类型安全 | 6 | **9** | 6 | 6 | 6 | 8 | 6 |
| 组件拆分 | 7 | **8** | 8 | 4 | 4 | 3 | 7 |
| 页面完整性 | 8 | **9** | 6 | 8 | 8 | 6 | 5 |
| UI美观度 | 7 | **8** | 7 | 7 | 7 | 6 | 6 |
| **前端总分** | **37** | **43** | **36** | **34** | **34** | **27** | **27** |

### 5.3 综合评分

| 排名 | 实现 | 后端分 | 前端分 | **总分** | 等级 |
|------|------|--------|--------|----------|------|
| 1 | **Claude** | 65 | 43 | **108** | A |
| 2 | Auto | 40 | 37 | **77** | B |
| 3 | GLM | 41 | 34 | **75** | B- |
| 3 | Qwen | 40 | 27 | **67** | C+ |
| 5 | DeepSeek | 31 | 36 | **67** | C+ |
| 6 | Kimi | 34 | 34 | **68** | C |
| 7 | MiniMax | 32 | 27 | **59** | C- |

---

## 6. 各实现关键问题汇总

### Claude
- **优势**：Decimal 精度、ExchangeRate 模型、BalanceSnapshot + forward-fill、TypeScript、Literal 类型约束、Settings 页面(汇率管理)
- **不足**：antd 使用 CSS 自定义样式而非组件库直接引入（但仍满足需求）；react-router v6 而非最新 v7

### Auto
- **优势**：功能完整，CRUD + 图表齐全，代码组织中等偏上
- **不足**：无跨币种换算（直接加总不同币种金额是严重逻辑错误）；Float 精度问题

### GLM
- **优势**：async 架构（虽然过度设计），拆分 Deposit/Liability 语义清晰，有 BalanceSnapshot
- **不足**：异步 SQLite 增加不必要的复杂度；Deposit/Liability 拆分增加代码量；汇率硬编码；组件未拆分(AccountDetail 20KB)

### DeepSeek
- **优势**：组件拆分最细(7个)，图表组件丰富
- **不足**：单文件后端 341 行；无跨币种换算；余额历史 N+1 查询性能差；Float 精度

### Kimi
- **优势**：router 分层合理，基础功能完整
- **不足**：无跨币种换算；组件几乎未拆分；缺少账户类型校验

### MiniMax
- **优势**：有汇率换算意识，持仓可合并更新
- **不足**：**汇率值完全错误**（方向反了）；Account 存 balance 字段手动更新（数据一致性风险）；使用了 Tailwind 而非 antd；无组件拆分

### Qwen
- **优势**：route + utils 分层，schema 使用 Enum 验证
- **不足**：使用 MUI 而非 antd（不遵循需求）；无账户详情页；无跨币种换算；无持仓账户类型校验

---

## 7. 结论

**Claude 以显著优势排名第一**，核心优势体现在：
1. **金融级精度**：唯一使用 Decimal + Numeric 的实现
2. **正确的多币种处理**：唯一实现 ExchangeRate 数据库模型 + API 可更新
3. **稳健的历史数据**：BalanceSnapshot + forward-fill 方案
4. **TypeScript 类型安全**：前后端都有严格的类型约束
5. **功能最完整**：独有 Settings 页面和汇率管理

其他实现普遍存在的问题：
- **跨币种直接加总**（Auto/DeepSeek/Kimi/Qwen）—— 金融系统中的致命错误
- **Float 精度**（6/7 个实现）—— 累积误差风险
- **UI 框架不合规**（MiniMax 用 Tailwind、Qwen 用 MUI）—— 不遵循需求
- **代码组织差**（DeepSeek/MiniMax 单文件 340+ 行）—— 可维护性低
