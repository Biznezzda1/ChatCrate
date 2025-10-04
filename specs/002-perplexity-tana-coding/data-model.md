# Data Model: Perplexity to Tana Workflow

**Feature**: 002-perplexity-tana-coding  
**Date**: 2025-10-04  
**Status**: Phase 1 Complete

## Overview

本文档定义 Perplexity → Tana 工作流中的核心数据实体、字段、关系和验证规则。所有类型定义遵循 TypeScript 类型系统。

---

## Entity 1: PageContext

**描述**: 当前浏览器页面的上下文信息，用于判断页面类型和加载状态。

### Fields

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `url` | `string` | ✅ | 当前页面完整 URL | `"https://www.perplexity.ai/search/..."` |
| `pageType` | `PageType` | ✅ | 页面类型枚举 | `"search"` \| `"deepresearch"` \| `"labs"` \| `"unknown"` |
| `isSupported` | `boolean` | ✅ | 是否为支持的 Perplexity chat 页面 | `true` / `false` |
| `loadingState` | `LoadingState` | ✅ | 页面加载状态 | `"loading"` \| `"complete"` |
| `detectedAt` | `number` | ✅ | 检测时间戳（毫秒） | `1704326400000` |

### Enums

```typescript
enum PageType {
  SEARCH = 'search',
  DEEP_RESEARCH = 'deepresearch',
  LABS = 'labs',
  UNKNOWN = 'unknown'
}

enum LoadingState {
  LOADING = 'loading',
  COMPLETE = 'complete'
}
```

### TypeScript Definition

```typescript
interface PageContext {
  url: string;
  pageType: PageType;
  isSupported: boolean;
  loadingState: LoadingState;
  detectedAt: number;
}
```

### Validation Rules

1. `url` 必须是有效 URL（以 `https://` 开头）
2. `url` 路径必须匹配 `/search/<id>` 格式（所有页面类型共享此 URL 格式）
3. `pageType` 为 `unknown` 时，`isSupported` 必须为 `false`
4. `pageType` 为 `search` / `deepresearch` / `labs` 时，`isSupported` 必须为 `true`
5. `pageType` 通过 DOM 特征识别，而非 URL 模式
6. `detectedAt` 必须是正整数（Unix 时间戳毫秒）

**注意**: Perplexity 的 Search、DeepResearch 和 Labs 页面均使用相同的 URL 格式 (`/search/<id>`)，必须通过 DOM 结构特征区分页面类型。

### State Transitions

```
初始状态: unknown + loading
    ↓
检测页面类型
    ↓
支持的页面: search/deepresearch/labs + loading
不支持的页面: unknown + complete (终止)
    ↓
监听DOM稳定性
    ↓
完成状态: search/deepresearch/labs + complete
```

---

## Entity 2: ExtractedContent

**描述**: 从 Perplexity 页面提取的原始内容对象，使用 Markdown 作为中间格式。

### Fields

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `pageType` | `PageType` | ✅ | 内容来源页面类型 | `"search"` |
| `query` | `string` | ✅ | 用户问题/查询文本 | `"What is TypeScript?"` |
| `answer` | `string` | ✅ | AI 回答内容（Markdown 格式） | `"TypeScript is **a superset** of JavaScript..."` |
| `citations` | `Citation[]` | ✅ | 引用列表（可为空数组） | `[{title: "...", url: "..."}]` |
| `media` | `MediaContent[]` | ✅ | 富媒体内容列表（可为空数组） | `[{type: "image", markdown: "![...]"}]` |
| `extractedAt` | `number` | ✅ | 提取时间戳（毫秒） | `1704326400000` |

### Nested Types

#### Citation

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `title` | `string` | ✅ | 引用来源标题 | `"TypeScript Official Docs"` |
| `url` | `string` | ✅ | 引用链接 URL | `"https://www.typescriptlang.org/"` |

#### MediaContent

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `type` | `MediaType` | ✅ | 富媒体类型 | `"image"` \| `"table"` \| `"code"` |
| `markdown` | `string` | ✅ | Markdown 表示 | `"![Image](url)"` 或 ` ```code``` ` |

```typescript
enum MediaType {
  IMAGE = 'image',
  TABLE = 'table',
  CODE = 'code'
}
```

### TypeScript Definition

```typescript
interface ExtractedContent {
  pageType: PageType;
  query: string;
  answer: string;
  citations: Citation[];
  media: MediaContent[];
  extractedAt: number;
}

interface Citation {
  title: string;
  url: string;
}

interface MediaContent {
  type: MediaType;
  markdown: string;
}
```

### Validation Rules

1. `query` 不能为空字符串
2. `answer` 必须至少包含 10 个字符（避免空回答）
3. `citations` 数组长度 ≤ 50（防止异常数据）
4. `Citation.url` 必须是有效 URL
5. `MediaContent.markdown` 必须符合对应类型的 Markdown 语法：
   - `image`: 以 `![` 开头
   - `code`: 以 ` ``` ` 包围
   - `table`: 包含 `|` 分隔符

### Markdown Format Specification

- **标题**: `# `, `## `, `### ` 等
- **加粗**: `**text**`
- **斜体**: `*text*`
- **列表**: `- item` 或 `1. item`
- **链接**: `[title](url)`
- **图片**: `![alt](url)`
- **代码块**: ` ```language\ncode\n``` `
- **表格**: Markdown 表格语法 `| col1 | col2 |`

---

## Entity 3: TanaPaste

**描述**: 格式化后的 Tana Paste 文本内容，遵循 Tana Paste 格式规范。

### Fields

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `content` | `string` | ✅ | Tana Paste 格式的纯文本 | `"- **Query**: What...\n  - **Answer**..."` |
| `metadata` | `PasteMetadata` | ✅ | 元数据信息 | `{nodeCount: 15, ...}` |
| `formattedAt` | `number` | ✅ | 格式化时间戳（毫秒） | `1704326400000` |

### Nested Types

#### PasteMetadata

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `nodeCount` | `number` | ✅ | 节点总数（行数） | `15` |
| `citationCount` | `number` | ✅ | 引用数量 | `5` |
| `mediaCount` | `number` | ✅ | 富媒体数量 | `2` |
| `characterCount` | `number` | ✅ | 字符总数 | `1024` |

### TypeScript Definition

```typescript
interface TanaPaste {
  content: string;
  metadata: PasteMetadata;
  formattedAt: number;
}

interface PasteMetadata {
  nodeCount: number;
  citationCount: number;
  mediaCount: number;
  characterCount: number;
}
```

### Validation Rules

1. `content` 必须以 `-` 开头（第一个节点）
2. `content` 每行缩进必须是 2 的倍数（2、4、6...个空格）
3. `nodeCount` 必须 > 0
4. `characterCount` 必须 ≥ `content.length`
5. 引用和媒体计数应与实际内容匹配（±1 容差）

### Tana Paste Format Specification

```
- **Query**: [用户问题]
  - **Answer**
    - [回答段落1]
    - [回答段落2]
  - **Citations**
    - [标题1](URL1)
    - [标题2](URL2)
  - **Media**
    - ![图片](URL)
    - ```code block```
```

**关键规则**:
- 每级缩进 2 个空格
- 节点以 `- ` 开头
- 加粗使用 `**text**`
- 引用使用 `[title](url)`
- 可选元数据标记 `%%tana%%`

---

## Entity Relationships

```
┌─────────────┐
│ PageContext │ (检测)
└──────┬──────┘
       │ 驱动
       ↓
┌──────────────────┐
│ ExtractedContent │ (提取)
└──────┬───────────┘
       │ 输入
       ↓
┌──────────────┐
│  TanaPaste   │ (格式化)
└──────────────┘
       │ 输出
       ↓
   Clipboard
```

1. **PageContext → ExtractedContent**: 页面类型决定提取策略（不同解析器）
2. **ExtractedContent → TanaPaste**: 单向转换，输入验证后格式化
3. **TanaPaste → Clipboard**: 纯文本输出到系统剪贴板

---

## Data Flow

```
1. 用户打开插件
   ↓
2. 生成 PageContext (检测页面类型和加载状态)
   ↓
3. 如果 isSupported=false 或 loadingState=loading → 禁用按钮
   ↓
4. 用户点击操作按钮
   ↓
5. Extractor: Document → ExtractedContent (Markdown)
   ↓
6. Formatter: ExtractedContent → TanaPaste
   ↓
7. Exporter: TanaPaste.content → Clipboard
   ↓
8. 用户在 Tana 中粘贴
```

---

## Error States

| 实体 | 错误状态 | 描述 | 处理方式 |
|------|---------|------|---------|
| `PageContext` | `pageType=unknown` | 不支持的页面 | 禁用按钮 + 提示 |
| `PageContext` | `loadingState=loading` | 页面加载中 | 禁用按钮 + 提示"正在加载" |
| `ExtractedContent` | `answer` 为空 | 提取失败 | 返回错误，显示失败状态 |
| `ExtractedContent` | `citations` 过多 (>50) | 异常数据 | 截断到前 50 条 |
| `TanaPaste` | `content` 格式错误 | 格式化失败 | 返回错误，提供原始文本预览 |

---

## Implementation Notes

### 类型定义位置
- `src/modules/extractor/types.ts`: `PageContext`, `ExtractedContent`, `PageType`, `LoadingState`
- `src/modules/formatter/types.ts`: `TanaPaste`, `PasteMetadata`
- `src/modules/exporter/types.ts`: 导出相关类型（如 `ExportResult`）

### 共享类型
`PageType` 和 `Citation` 在多个模块间共享，建议定义在公共类型文件：
```typescript
// src/types/common.ts
export { PageType, Citation, MediaType };
```

---

**Status**: ✅ Data model complete. Ready for contract generation.

