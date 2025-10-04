# Contract: Formatter Module

**Module**: `src/modules/formatter`  
**Version**: 1.0.0  
**Last Updated**: 2025-10-04

## Purpose

将 Markdown 格式的 `ExtractedContent` 转换为 Tana Paste 格式的纯文本，保留结构、样式和引用信息。

---

## Primary API

### `format(content: ExtractedContent): Promise<TanaPaste>`

**描述**: 将提取的内容格式化为 Tana Paste。

#### Input Contract

**Parameters**:
```typescript
content: ExtractedContent   // 从 Extractor 输出的内容
```

**Pre-conditions**:
1. `content` 必须是有效的 `ExtractedContent` 对象
2. `content.query` 非空
3. `content.answer` 至少 10 个字符
4. `content.citations` 数组中每个对象包含有效的 `title` 和 `url`
5. `content.media` 数组中每个对象的 `markdown` 符合语法

**Input Validation**:
```typescript
if (!content || !content.query || content.answer.length < 10) {
  throw new Error('Invalid extracted content');
}
```

#### Output Contract

**Return Type**: `Promise<TanaPaste>`

**Success Output**:
```typescript
{
  content: string;           // Tana Paste 格式的纯文本
  metadata: {
    nodeCount: number;       // >0
    citationCount: number;   // ≥0
    mediaCount: number;      // ≥0
    characterCount: number;  // ≥content.length
  };
  formattedAt: number;       // Unix 时间戳毫秒
}
```

**Post-conditions**:
1. `content` 以 `- ` 开头（第一个节点）
2. `content` 每行缩进为 2 的倍数（0, 2, 4, 6...空格）
3. `nodeCount` 必须 > 0
4. `citationCount` 应等于输入 `citations.length`（误差 ±1）
5. `mediaCount` 应等于输入 `media.length`（误差 ±1）
6. `characterCount` 应等于 `content.length`
7. `formattedAt` 为调用时间（误差 ±100ms）

**Tana Paste Format Spec**:
```
- **Query**: {query text}
  - **Answer**
    - {answer paragraph 1}
    - {answer paragraph 2}
  - **Citations**
    - [{title1}]({url1})
    - [{title2}]({url2})
  - **Media**
    - ![{alt}]({url})
    - ```{code}```
```

**Error Scenarios**:

| 错误类型 | 触发条件 | 错误消息 |
|---------|---------|---------|
| `InvalidContentError` | `content` 不符合前置条件 | `"Invalid extracted content"` |
| `FormattingFailedError` | 格式化过程中出错 | `"Failed to format content"` |
| `InvalidOutputError` | 输出不符合后置条件 | `"Generated Tana Paste is invalid"` |

---

## Secondary APIs

### `markdownToTana(markdown: string): string`

**描述**: 将 Markdown 文本转换为 Tana Paste 语法（内部工具函数）。

#### Input Contract
```typescript
markdown: string   // Markdown 格式文本
```

#### Output Contract
```typescript
return: string     // Tana Paste 格式文本（带缩进）
```

**Conversion Rules**:
| Markdown | Tana Paste |
|----------|------------|
| `# Title` | `- **Title**%%tana%%` |
| `## Subtitle` | `  - **Subtitle**%%tana%%` |
| `**bold**` | `**bold**` |
| `*italic*` | `*italic*` |
| `- item` | `  - item` |
| `[title](url)` | `[title](url)` |
| `![alt](url)` | `![alt](url)` |
| ` ```code``` ` | ` ```code``` ` |

---

## Test Contract

### Unit Tests

**File**: `tests/unit/formatter/`

**Required Tests**:
1. `format()` - 成功格式化（基本内容）
2. `format()` - 格式化包含引用的内容
3. `format()` - 格式化包含富媒体的内容
4. `format()` - 输入验证失败
5. `format()` - 输出格式验证
6. `markdownToTana()` - 各种 Markdown 元素转换

### Contract Tests

**File**: `tests/contract/formatter.contract.test.ts`

**Required Tests**:
1. 验证输入类型（ExtractedContent 结构）
2. 验证输出结构（TanaPaste 所有字段）
3. 验证输出格式（缩进、节点、引用格式）
4. 验证元数据准确性（nodeCount, citationCount, mediaCount）
5. 验证错误场景（所有 3 种错误类型）

### Integration Tests

**File**: `tests/integration/workflow.test.ts`

**Required Tests**:
1. Extractor → Formatter 管道测试
2. 格式化输出粘贴到 Tana 的模拟测试
3. 与 samples 快照对比（预期 Tana Paste 输出）

---

## Performance Contract

**Constraints**:
- `format()` 执行时间 ≤ 100ms（普通内容，<20KB）
- 内存占用 ≤ 5MB（单次格式化）

**Measurement**:
```typescript
const start = performance.now();
const result = await format(content);
const duration = performance.now() - start;
expect(duration).toBeLessThan(100);
```

---

## Format Examples

### Example 1: Basic Search Result

**Input**:
```typescript
{
  pageType: 'search',
  query: 'What is TypeScript?',
  answer: 'TypeScript is a **superset** of JavaScript.\n\nIt adds static typing.',
  citations: [
    { title: 'TypeScript Docs', url: 'https://www.typescriptlang.org/' }
  ],
  media: [],
  extractedAt: 1704326400000
}
```

**Output**:
```
- **Query**: What is TypeScript?
  - **Answer**
    - TypeScript is a **superset** of JavaScript.
    - It adds static typing.
  - **Citations**
    - [TypeScript Docs](https://www.typescriptlang.org/)
```

### Example 2: With Media

**Input**:
```typescript
{
  pageType: 'search',
  query: 'Show me Python code',
  answer: 'Here is an example:\n\nPrint hello world.',
  citations: [],
  media: [
    { type: 'code', markdown: '```python\nprint("Hello")\n```' }
  ],
  extractedAt: 1704326400000
}
```

**Output**:
```
- **Query**: Show me Python code
  - **Answer**
    - Here is an example:
    - Print hello world.
  - **Media**
    - ```python
      print("Hello")
      ```
```

---

## Dependencies

**External**:
- None

**Internal**:
- `src/types/common.ts` (PageType, Citation, MediaType)
- `src/modules/extractor/types.ts` (ExtractedContent)
- `src/modules/formatter/types.ts` (TanaPaste, PasteMetadata)

---

## Versioning

**Breaking Changes** (require MAJOR version bump):
- 修改 `format()` 函数签名
- 修改 `TanaPaste` 数据结构
- 修改 Tana Paste 格式规则（不向后兼容）

**Non-Breaking Changes** (MINOR version bump):
- 添加新的格式化选项（可选参数）
- 优化格式化逻辑（输出格式不变）
- 添加新的 Markdown → Tana 转换规则（向后兼容）

---

## Changelog

### v1.0.0 (2025-10-04)
- Initial contract definition
- Core API: `format()`
- Support for Markdown → Tana Paste conversion
- Support for citations and media content

---

**Status**: ✅ Contract defined. Ready for TDD implementation.

