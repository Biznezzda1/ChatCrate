# Extractor Module

从 Perplexity 页面提取结构化内容（问题、回答、引用、富媒体）。

## 功能

- **页面类型检测**: 自动识别 Search/DeepResearch/Labs 页面
- **HTML 解析**: 提取问题、回答、引用和富媒体内容
- **Markdown 转换**: 将 HTML 转换为 Markdown 格式
- **加载状态检测**: 检测页面是否完全加载

## 使用方法

### 作为库使用

```typescript
import { extract, detectPageType } from './modules/extractor';
import { PageType } from './types/common';

// 检测页面类型
const pageType = detectPageType(document);

// 提取内容
const extracted = await extract(document, PageType.SEARCH);

console.log(extracted.query);      // 问题
console.log(extracted.answer);     // 回答
console.log(extracted.citations);  // 引用列表
console.log(extracted.media);      // 富媒体
```

### CLI 使用

```bash
# 提取内容并输出 JSON
npx chatcrate-extract sample.html --format json

# 提取内容并输出文本
npx chatcrate-extract sample.html --format text

# 管道组合使用
npx chatcrate-extract sample.html | chatcrate-format | chatcrate-export --output result.txt
```

## API

### `extract(document: Document, pageType: PageType): Promise<ExtractedContent>`

从文档中提取内容。

**参数:**
- `document`: DOM Document 对象
- `pageType`: 页面类型（SEARCH/DEEP_RESEARCH/LABS）

**返回:** Promise<ExtractedContent>

### `detectPageType(document: Document): PageType`

检测页面类型。

**参数:**
- `document`: DOM Document 对象

**返回:** PageType

### `detectLoadingState(document: Document): Promise<LoadingState>`

检测页面加载状态。

**参数:**
- `document`: DOM Document 对象

**返回:** Promise<LoadingState>

## 数据结构

```typescript
interface ExtractedContent {
  pageType: PageType;
  query: string;
  answer: string;
  citations: Citation[];
  media: MediaContent[];
  extractedAt: number;
}
```

## 测试

```bash
# 运行单元测试
pnpm test tests/unit/extractor

# 运行契约测试
pnpm test tests/contract/extractor.contract.test.ts
```
