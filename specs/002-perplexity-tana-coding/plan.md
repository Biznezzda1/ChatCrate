# Implementation Plan: Perplexity to Tana Workflow

**Branch**: `002-perplexity-tana-coding` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-perplexity-tana-coding/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
3. Fill Constitution Check ✓
4. Evaluate Constitution Check ✓
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
7. Re-evaluate Constitution Check ✓
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command
```

## Summary

本功能实现从 Perplexity AI 聊天页面提取内容（问题、回答、引用、富媒体），转换为 Tana Paste 格式，并复制到用户剪贴板。核心技术方法：
- **提取**：使用 DOM 选择器从 Perplexity HTML 中提取结构化内容，转换为 Markdown 中间格式
- **格式化**：将 Markdown 内容映射到 Tana Paste 格式（保留层级、样式、引用）
- **导出**：通过浏览器 Clipboard API 将文本复制到剪贴板
- **UI 交互**：在浏览器扩展 popup 中提供格式/导出选择器、操作按钮、状态反馈

## Technical Context

**User-Provided Details**:
```
任务名称: 实现 Perplexity → Tana 工作流（增量改造 Extractor/Formatter/Exporter，含前端联动）
Confirm: 维持现有技术栈
Allow: 仅在需要时引入轻量 HTML 解析/选择器库以提升提取稳定性
Assume: Perplexity 页面可访问且结构与 samples 一致；Tana 接收基于文本的黏贴/导入格式
Defer: 上架插件市场

目标与成功标准:
- 提取覆盖: 顶部答案+前10条引用的标题/URL/摘要，覆盖率≥90%
- 解析稳定性: 页面结构微调下（样式变更不超10%）仍可成功导出
- 前端操作数: ≤2次点击完成复制/导出；提供预览与一键复制

数据流: Extractor→Formatter→Exporter 串行；前端仅调用 Exporter，并展示 Formatter 产物预览
```

**Derived Technical Context**:

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: 
- WXT 0.20 (浏览器扩展框架)
- React 19 (UI)
- TailwindCSS 4.1 (样式)
- 可选：轻量 HTML 解析库（如需提升选择器稳定性）

**Storage**: N/A（无需持久化存储，仅内存处理）  
**Testing**: Jest 30 + Testing Library（单元测试 + 集成测试）  
**Target Platform**: Chrome/Edge/Firefox 浏览器扩展（通过 WXT 构建）  
**Project Type**: Single (浏览器扩展单体项目)

**Performance Goals**:
- 提取耗时: <500ms（普通对话页面）
- 格式转换: <100ms
- 剪贴板复制: <50ms
- 总体用户感知延迟: <1秒

**Constraints**:
- 仅支持 Perplexity.ai 域名页面（URL 格式：`/search/<id>`）
- 页面类型通过 DOM 特征识别（无法通过 URL 区分 Search/DeepResearch/Labs）
- 提取覆盖率≥90%（答案+前10条引用）
- 页面结构变更容错性：样式变更<10%仍可工作
- 无需后端服务，纯前端处理

**Scale/Scope**:
- 支持3种页面类型（Search/DeepResearch/Labs）
- 单次提取内容量：约5-20KB文本
- 引用数量：通常5-15条
- 富媒体支持：图片、表格、代码块

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Library-First** | ✅ PASS | 复用现有模块（extractor/formatter/exporter），每个模块独立可测 |
| **II. CLI Interface** | ✅ READY | 模块将提供 CLI 入口（tasks.md T038-T040）：extractor/formatter/exporter 均可通过 CLI 独立测试和管道组合 |
| **III. Test-First** | ✅ READY | TDD 流程就绪，Phase 1 将生成测试先行的契约测试 |
| **IV. Integration Testing** | ✅ READY | 需集成测试：Extractor→Formatter→Exporter 管道测试，与 samples 对比验证 |
| **V. Observability** | ✅ READY | 日志记录：解析路径、选择器命中、提取计数、耗时 |
| **Versioning** | ✅ PASS | 遵循 MAJOR.MINOR.BUILD，当前 0.0.1 |
| **Simplicity** | ✅ PASS | 无额外复杂性，直接复用现有架构 |

**Decision**: ✅ Proceed to Phase 0

### Post-Design Check (After Phase 1)
*Will be updated after Phase 1 completion*

## Project Structure

### Documentation (this feature)
```
specs/002-perplexity-tana-coding/
├── spec.md              # Feature specification (已完成)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── extractor.contract.md
│   ├── formatter.contract.md
│   └── exporter.contract.md
├── samples/             # Sample HTML files (已存在)
│   ├── perplexity_research_report.html
│   ├── perplexity_deepresearch_report.html
│   └── perplexity_labs_report.html
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── modules/
│   ├── extractor/                    # Perplexity HTML → Markdown 提取
│   │   ├── README.md                 # (已存在)
│   │   ├── index.ts                  # 主提取逻辑
│   │   ├── types.ts                  # ExtractedContent 类型定义
│   │   ├── selectors.ts              # DOM 选择器配置
│   │   ├── parsers/
│   │   │   ├── search.ts             # Search 页面解析器
│   │   │   ├── deepresearch.ts       # DeepResearch 页面解析器
│   │   │   └── labs.ts               # Labs 页面解析器
│   │   └── utils/
│   │       ├── markdown.ts           # HTML → Markdown 转换
│   │       └── page-detector.ts      # 页面类型检测
│   │
│   ├── formatter/                    # Markdown → Tana Paste 格式化
│   │   ├── README.md                 # (已存在)
│   │   ├── index.ts                  # 主格式化逻辑
│   │   ├── types.ts                  # TanaPaste 类型定义
│   │   ├── tana-paste.ts             # Tana Paste 格式转换
│   │   └── utils/
│   │       └── markdown-to-tana.ts   # Markdown → Tana 语法映射
│   │
│   ├── exporter/                     # 输出到剪贴板
│   │   ├── README.md                 # (已存在)
│   │   ├── index.ts                  # 主导出逻辑
│   │   ├── types.ts                  # Exporter 类型定义
│   │   └── clipboard.ts              # Clipboard API 封装
│   │
│   └── ui/                           # UI 组件（共享）
│       ├── README.md                 # (已存在)
│       └── components/
│           ├── StatusDisplay.tsx     # 状态显示组件
│           ├── FormatSelector.tsx    # 格式选择器
│           └── ExportSelector.tsx    # 导出选择器
│
├── entrypoints/
│   └── popup/
│       ├── App.tsx                   # Popup 主界面（需更新）
│       ├── main.tsx                  # (已存在)
│       └── index.html                # (已存在)
│
└── utils/
    ├── page-context.ts               # PageContext 管理
    └── workflow.ts                   # Extractor→Formatter→Exporter 编排

tests/
├── unit/
│   ├── extractor/
│   │   ├── search.test.ts
│   │   ├── deepresearch.test.ts
│   │   ├── labs.test.ts
│   │   └── markdown.test.ts
│   ├── formatter/
│   │   └── tana-paste.test.ts
│   └── exporter/
│       └── clipboard.test.ts
│
├── integration/
│   ├── workflow.test.ts              # 端到端管道测试
│   └── samples/
│       └── snapshot.test.ts          # 与 samples 快照对比测试
│
└── contract/
    ├── extractor.contract.test.ts    # Extractor 契约测试
    ├── formatter.contract.test.ts    # Formatter 契约测试
    └── exporter.contract.test.ts     # Exporter 契约测试
```

**Structure Decision**: 单体浏览器扩展项目，采用模块化架构。核心逻辑在 `src/modules/` 中独立封装（extractor/formatter/exporter），UI 在 `src/entrypoints/popup/` 中调用这些模块。测试分层：单元测试（各模块独立）、契约测试（模块接口）、集成测试（端到端管道）。

## Phase 0: Outline & Research

### Research Tasks

1. **Tana Paste 格式规范研究**
   - 任务：调研 Tana Paste 格式的完整语法规则
   - 产出：Tana Paste 语法映射表（Markdown → Tana）
   - 关键点：层级缩进、引用格式、富媒体表示

2. **Perplexity 页面结构分析**
   - 任务：基于 samples 分析3种页面类型的 DOM 结构
   - 产出：DOM 选择器配置表（Search/DeepResearch/Labs）
   - 关键点：问题、回答、引用、富媒体的选择器稳定性

3. **HTML → Markdown 转换最佳实践**
   - 任务：评估是否需要引入 HTML 解析库
   - 产出：转换方案（原生 DOM API vs 轻量库）
   - 关键点：保留样式、处理嵌套、富媒体识别

4. **浏览器 Clipboard API 兼容性**
   - 任务：确认 Clipboard API 在目标浏览器的支持情况
   - 产出：API 使用指南 + 降级方案
   - 关键点：权限处理、错误处理、跨浏览器兼容

**Output**: `research.md` 文档（见下）

## Phase 1: Design & Contracts

### Data Model

详见 `data-model.md`（包含 ExtractedContent、TanaPaste、PageContext 实体定义）

### API Contracts

生成以下契约文档：
1. **`contracts/extractor.contract.md`**: Extractor 模块输入/输出规范
2. **`contracts/formatter.contract.md`**: Formatter 模块输入/输出规范
3. **`contracts/exporter.contract.md`**: Exporter 模块输入/输出规范

每个契约包含：
- 函数签名（TypeScript 类型）
- 输入验证规则
- 输出保证
- 错误场景

### Contract Tests

生成失败的契约测试（TDD Red Phase）：
- `tests/contract/extractor.contract.test.ts`
- `tests/contract/formatter.contract.test.ts`
- `tests/contract/exporter.contract.test.ts`

### Integration Test Scenarios

从用户故事提取集成测试场景：
- Scenario 1: Search 页面完整流程（提取→格式化→复制）
- Scenario 2: DeepResearch 页面完整流程
- Scenario 3: Labs 页面完整流程
- Scenario 4: 富媒体内容处理（图片、表格、代码块）
- Scenario 5: 错误处理（无效页面、加载中、剪贴板失败）

### Quickstart

详见 `quickstart.md`（用户验收测试步骤）

### Agent Context Update

执行更新脚本：
```bash
.specify/scripts/bash/update-agent-context.sh cursor
```

**Output**: 
- `data-model.md`
- `contracts/extractor.contract.md`
- `contracts/formatter.contract.md`
- `contracts/exporter.contract.md`
- `quickstart.md`
- 失败的契约测试
- `.cursorrules` (agent 上下文更新)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

任务从 Phase 1 设计文档生成，遵循 TDD 顺序：

**契约测试任务**（优先级最高，[P] 可并行）：
- T1: [P] 编写 Extractor 契约测试（基于 `contracts/extractor.contract.md`）
- T2: [P] 编写 Formatter 契约测试（基于 `contracts/formatter.contract.md`）
- T3: [P] 编写 Exporter 契约测试（基于 `contracts/exporter.contract.md`）

**数据模型任务**（[P] 可并行）：
- T4: [P] 定义 TypeScript 类型（ExtractedContent、TanaPaste、PageContext）

**Extractor 模块任务**（依赖 T1、T4）：
- T5: 实现页面类型检测（page-detector.ts）
- T6: [P] 实现 Search 页面解析器（parsers/search.ts）
- T7: [P] 实现 DeepResearch 页面解析器（parsers/deepresearch.ts）
- T8: [P] 实现 Labs 页面解析器（parsers/labs.ts）
- T9: 实现 HTML → Markdown 转换工具（utils/markdown.ts）
- T10: 集成 Extractor 主逻辑（index.ts）

**Formatter 模块任务**（依赖 T2、T4）：
- T11: 实现 Markdown → Tana 语法映射（utils/markdown-to-tana.ts）
- T12: 实现 Tana Paste 格式化（tana-paste.ts）
- T13: 集成 Formatter 主逻辑（index.ts）

**Exporter 模块任务**（依赖 T3）：
- T14: 实现 Clipboard API 封装（clipboard.ts）
- T15: 集成 Exporter 主逻辑（index.ts）

**UI 组件任务**（[P] 可并行）：
- T16: [P] 实现状态显示组件（StatusDisplay.tsx）
- T17: [P] 实现格式选择器（FormatSelector.tsx）
- T18: [P] 实现导出选择器（ExportSelector.tsx）

**前端集成任务**（依赖 T10、T13、T15、T16-T18）：
- T19: 实现工作流编排（utils/workflow.ts）
- T20: 更新 Popup 主界面（entrypoints/popup/App.tsx）

**集成测试任务**（依赖所有实现任务）：
- T21: 编写端到端管道测试（tests/integration/workflow.test.ts）
- T22: 编写 samples 快照对比测试（tests/integration/samples/snapshot.test.ts）

**验收任务**（依赖 T21、T22）：
- T23: 执行 quickstart.md 验收测试
- T24: 验证提取覆盖率≥90%
- T25: 验证性能指标（延迟<1秒）

### Ordering Strategy

1. **TDD 优先**：契约测试 → 数据模型 → 实现 → 集成测试
2. **依赖顺序**：类型定义 → 模块实现 → UI 组件 → 前端集成
3. **并行标记 [P]**：独立文件/模块可并行开发

### Estimated Output

**任务总数**：约25个编号任务  
**并行任务**：约12个（标记 [P]）  
**顺序任务**：约13个（有依赖）  
**预估工期**：2-3天（单人全职）

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

无复杂性偏差。项目遵循现有架构，无需引入新的复杂性。

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (无新增复杂性)
- [x] All NEEDS CLARIFICATION resolved (已在 /clarify 阶段解决)
- [x] Complexity deviations documented (无偏差)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
