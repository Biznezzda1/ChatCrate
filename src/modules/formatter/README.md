# Formatter Module

将提取的内容格式化为 Tana Paste 格式。

## 功能

- **Markdown → Tana**: 将 Markdown 转换为 Tana Paste 语法
- **结构化输出**: 生成层级化的 Tana 节点
- **元数据统计**: 计算节点数、引用数、字符数

## 使用方法

### 作为库使用

```typescript
import { format } from './modules/formatter';
import { extract } from './modules/extractor';

// 先提取内容
const extracted = await extract(document, pageType);

// 格式化为 Tana Paste
const formatted = await format(extracted);

console.log(formatted.content);    // Tana Paste 文本
console.log(formatted.metadata);   // 元数据统计
```

### CLI 使用

```bash
# 从文件格式化
npx chatcrate-format --input extracted.json --output formatted.txt

# 从 stdin 格式化
cat extracted.json | npx chatcrate-format

# 管道组合
npx chatcrate-extract sample.html | npx chatcrate-format
```

## API

### `format(content: ExtractedContent): Promise<TanaPaste>`

将提取的内容格式化为 Tana Paste。

**参数:**
- `content`: 提取的内容对象

**返回:** Promise<TanaPaste>

## Tana Paste 格式示例

```
- **Query**: 什么是 TypeScript？
  - **Answer**
    - TypeScript 是 JavaScript 的超集
    - 添加了静态类型系统
  - **Citations**
    - [TypeScript 官网](https://www.typescriptlang.org)
  - **Media**
    - ![图片](https://example.com/img.png)
```

## 数据结构

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

## 测试

```bash
# 运行契约测试
pnpm test tests/contract/formatter.contract.test.ts

# 运行单元测试
pnpm test tests/unit/formatter
```
