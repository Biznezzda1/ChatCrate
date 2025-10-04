# Contract: Extractor Module

**Module**: `src/modules/extractor`  
**Version**: 1.0.0  
**Last Updated**: 2025-10-04

## Purpose

从 Perplexity 页面 HTML 中提取结构化内容，转换为 Markdown 格式的中间数据结构 (`ExtractedContent`)。

---

## Primary API

### `extract(document: Document, pageType: PageType): Promise<ExtractedContent>`

**描述**: 根据页面类型提取内容。

#### Input Contract

**Parameters**:
```typescript
document: Document      // 浏览器 DOM Document 对象
pageType: PageType      // 页面类型枚举（search/deepresearch/labs）
```

**Pre-conditions**:
1. `document` 必须是有效的 DOM Document 对象
2. `document.body` 必须存在且非空
3. `pageType` 必须是 `PageType` 枚举中的有效值（不能是 `unknown`）
4. 页面必须已完全加载（`document.readyState === 'complete'`）

**Input Validation**:
```typescript
if (!document || !document.body) {
  throw new Error('Invalid document');
}
if (pageType === PageType.UNKNOWN) {
  throw new Error('Cannot extract from unknown page type');
}
```

#### Output Contract

**Return Type**: `Promise<ExtractedContent>`

**Success Output**:
```typescript
{
  pageType: PageType;       // 必须与输入 pageType 一致
  query: string;            // 非空，长度 ≥ 1
  answer: string;           // 非空，长度 ≥ 10
  citations: Citation[];    // 数组，可为空，长度 ≤ 50
  media: MediaContent[];    // 数组，可为空
  extractedAt: number;      // Unix 时间戳毫秒，>0
}
```

**Post-conditions**:
1. `query` 不为空字符串
2. `answer` 至少包含 10 个字符
3. `citations` 数组中每个对象都包含有效的 `title` 和 `url`
4. `citations` 数组长度 ≤ 50
5. `media` 数组中每个对象的 `markdown` 字段符合对应类型的 Markdown 语法
6. `extractedAt` 为调用时间（误差 ±100ms）

**Error Scenarios**:

| 错误类型 | 触发条件 | 错误消息 | HTTP 状态码（如适用） |
|---------|---------|---------|---------------------|
| `InvalidDocumentError` | `document` 无效或为空 | `"Invalid document"` | - |
| `UnsupportedPageTypeError` | `pageType` 为 `unknown` | `"Cannot extract from unknown page type"` | - |
| `ExtractionFailedError` | 提取核心内容失败（无问题或回答） | `"Failed to extract core content"` | - |
| `InvalidContentError` | 提取内容不符合验证规则（如 `answer` <10 字符） | `"Extracted content is invalid"` | - |

**Error Response Format**:
```typescript
class ExtractionError extends Error {
  code: string;           // 错误代码（如 'INVALID_DOCUMENT'）
  details?: any;          // 可选的详细信息
}
```

---

## Secondary APIs

### `detectPageType(document: Document): PageType`

**描述**: 检测当前页面类型。

#### Input Contract
```typescript
document: Document      // 浏览器 DOM Document 对象
```

#### Output Contract
```typescript
return: PageType        // search | deepresearch | labs | unknown
```

**Logic**:
1. 验证 URL 是否为 Perplexity 域名（`perplexity.ai`）且路径为 `/search/<id>` 格式
2. 通过页面顶部 Tab 按钮的 `data-testid` 属性区分页面类型：
   - DeepResearch: 存在 `[data-testid="answer-mode-tabs-tab-research"]`
   - Labs: 存在 `[data-testid="answer-mode-tabs-tab-studio"]`
   - Search: 以上两者都不存在（标准搜索页面）
3. 默认返回 `unknown`（如果无法识别或非 `/search/` 路径）

**示例检测逻辑**:
```typescript
// 1. 检查基本 URL 格式
if (!document.location.pathname.startsWith('/search/')) {
  return PageType.UNKNOWN;
}

// 2. 通过页面 Tab 的 data-testid 属性区分类型
if (document.querySelector('[data-testid="answer-mode-tabs-tab-research"]')) {
  return PageType.DEEP_RESEARCH;
} else if (document.querySelector('[data-testid="answer-mode-tabs-tab-studio"]')) {
  return PageType.LABS;
} else {
  // 标准搜索页面没有特殊的 tab
  return PageType.SEARCH;
}
```

---

### `detectLoadingState(document: Document): Promise<LoadingState>`

**描述**: 检测页面加载状态（是否完成流式输出）。

#### Input Contract
```typescript
document: Document      // 浏览器 DOM Document 对象
```

#### Output Contract
```typescript
return: Promise<LoadingState>  // loading | complete
```

**Logic**:
1. 使用 `MutationObserver` 监听 DOM 变化
2. 如果 500ms 内无变化，返回 `complete`
3. 否则返回 `loading`

---

## Internal Parsers

### `parseSearch(document: Document): Partial<ExtractedContent>`
### `parseDeepResearch(document: Document): Partial<ExtractedContent>`
### `parseLabs(document: Document): Partial<ExtractedContent>`

**描述**: 各页面类型的专用解析器（内部使用，不导出）。

#### Contract
- **Input**: `Document` 对象
- **Output**: `Partial<ExtractedContent>`（可能缺少某些字段）
- **Error Handling**: 解析失败时抛出 `ExtractionFailedError`

---

## Test Contract

### Unit Tests

**File**: `tests/unit/extractor/`

**Required Tests**:
1. `extract()` - 成功提取（每种 pageType）
2. `extract()` - 输入验证失败
3. `extract()` - 提取核心内容失败
4. `extract()` - 输出格式验证
5. `detectPageType()` - 各种 DOM 特征模式（区分 Search/DeepResearch/Labs）
6. `detectLoadingState()` - 加载中 vs 完成

### Contract Tests

**File**: `tests/contract/extractor.contract.test.ts`

**Required Tests**:
1. 验证输入类型（document, pageType）
2. 验证输出结构（所有必填字段）
3. 验证输出值（query 非空，answer ≥10 字符，citations ≤50）
4. 验证错误场景（所有 4 种错误类型）
5. 验证时间戳（extractedAt）

### Integration Tests

**File**: `tests/integration/samples/`

**Required Tests**:
1. 使用 `samples/perplexity_research_report.html` 测试 Search 提取
2. 使用 `samples/perplexity_deepresearch_report.html` 测试 DeepResearch 提取
3. 使用 `samples/perplexity_labs_report.html` 测试 Labs 提取
4. 验证提取覆盖率 ≥90%（对比快照）

---

## Performance Contract

**Constraints**:
- `extract()` 执行时间 ≤ 500ms（普通页面，<5000 DOM 节点）
- 内存占用 ≤ 10MB（单次提取）

**Measurement**:
```typescript
const start = performance.now();
const result = await extract(document, pageType);
const duration = performance.now() - start;
expect(duration).toBeLessThan(500);
```

---

## Dependencies

**External**:
- None（仅使用原生 DOM API）

**Internal**:
- `src/types/common.ts` (PageType, Citation, MediaType)
- `src/modules/extractor/types.ts` (ExtractedContent)

---

## Versioning

**Breaking Changes** (require MAJOR version bump):
- 修改 `extract()` 函数签名
- 修改 `ExtractedContent` 数据结构（删除或重命名字段）
- 修改错误类型或错误码

**Non-Breaking Changes** (MINOR version bump):
- 添加新的可选参数
- 添加新的辅助函数
- 优化提取逻辑（不改变输出结构）

---

## Changelog

### v1.0.0 (2025-10-04)
- Initial contract definition
- Core API: `extract()`, `detectPageType()`, `detectLoadingState()`
- Support for Search/DeepResearch/Labs page types

---

**Status**: ✅ Contract defined. Ready for TDD implementation.

