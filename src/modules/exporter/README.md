# Exporter Module

将格式化的内容导出到剪贴板或文件。

## 功能

- **剪贴板导出**: 使用 Clipboard API 复制内容
- **降级支持**: 自动降级到 execCommand
- **错误处理**: 完善的权限和错误处理
- **跨浏览器**: 支持 Chrome/Edge/Firefox

## 使用方法

### 作为库使用

```typescript
import { exportToClipboard, isClipboardAvailable } from './modules/exporter';

// 检查剪贴板可用性
if (isClipboardAvailable()) {
  // 导出到剪贴板
  const result = await exportToClipboard(tanaPaste);
  
  if (result.success) {
    console.log(`成功复制 ${result.charactersExported} 个字符`);
    console.log(`使用方法: ${result.method}`);
  } else {
    console.error(`失败: ${result.error}`);
  }
}
```

### CLI 使用

```bash
# 导出到文件
npx chatcrate-export --input formatted.txt --output output.txt

# 从 stdin 导出
cat formatted.txt | npx chatcrate-export --output output.txt

# 完整管道
npx chatcrate-extract sample.html | npx chatcrate-format | npx chatcrate-export --output result.txt
```

## API

### `exportToClipboard(tanaPaste: TanaPaste): Promise<ExportResult>`

导出内容到剪贴板。

**参数:**
- `tanaPaste`: 格式化的 Tana Paste 对象

**返回:** Promise<ExportResult>

### `isClipboardAvailable(): boolean`

检查剪贴板 API 是否可用。

**返回:** boolean

## 错误处理

模块自动处理以下错误场景：

- **INVALID_CONTENT**: 内容为空或无效
- **NOT_AVAILABLE**: 剪贴板 API 不可用
- **PERMISSION_DENIED**: 用户拒绝权限
- **COPY_FAILED**: 复制操作失败

## 数据结构

```typescript
interface ExportResult {
  success: boolean;
  method?: 'clipboard-api' | 'execCommand';
  charactersExported?: number;
  exportedAt: number;
  error?: string;
  errorCode?: string;
}
```

## 降级策略

1. 首先尝试 `navigator.clipboard.writeText()` (Clipboard API)
2. 如果失败，降级到 `document.execCommand('copy')` (execCommand)
3. 两种方法都失败时返回错误信息

## 浏览器兼容性

- ✅ Chrome 63+
- ✅ Edge 79+
- ✅ Firefox 53+
- ✅ Safari 13.1+

## 测试

```bash
# 运行契约测试
pnpm test tests/contract/exporter.contract.test.ts

# 运行单元测试
pnpm test tests/unit/exporter
```
