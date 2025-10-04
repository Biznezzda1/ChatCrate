# Contract: Exporter Module

**Module**: `src/modules/exporter`  
**Version**: 1.0.0  
**Last Updated**: 2025-10-04

## Purpose

将格式化后的 Tana Paste 文本导出到用户剪贴板，并提供导出结果反馈。

---

## Primary API

### `exportToClipboard(tanaPaste: TanaPaste): Promise<ExportResult>`

**描述**: 将 Tana Paste 内容复制到系统剪贴板。

#### Input Contract

**Parameters**:
```typescript
tanaPaste: TanaPaste   // 格式化后的 Tana Paste 对象
```

**Pre-conditions**:
1. `tanaPaste` 必须是有效的 `TanaPaste` 对象
2. `tanaPaste.content` 非空字符串
3. `tanaPaste.content.length` > 0
4. 浏览器支持 Clipboard API 或 execCommand

**Input Validation**:
```typescript
if (!tanaPaste || !tanaPaste.content || tanaPaste.content.length === 0) {
  throw new Error('Invalid Tana Paste content');
}
```

#### Output Contract

**Return Type**: `Promise<ExportResult>`

**Success Output**:
```typescript
{
  success: true;
  method: 'clipboard-api' | 'execCommand';  // 使用的复制方法
  charactersExported: number;                // 复制的字符数
  exportedAt: number;                        // Unix 时间戳毫秒
}
```

**Failure Output**:
```typescript
{
  success: false;
  error: string;                             // 错误消息
  errorCode: string;                         // 错误代码
  exportedAt: number;                        // 尝试时间
}
```

**Post-conditions (Success)**:
1. 系统剪贴板包含 `tanaPaste.content` 的完整文本
2. `charactersExported` 等于 `tanaPaste.content.length`
3. `exportedAt` 为调用时间（误差 ±100ms）

**Post-conditions (Failure)**:
1. 系统剪贴板内容不变（不污染用户剪贴板）
2. `error` 包含用户友好的错误描述
3. `errorCode` 用于程序化错误处理

**Error Scenarios**:

| 错误类型 | 触发条件 | 错误码 | 错误消息 |
|---------|---------|--------|---------|
| `InvalidContentError` | `tanaPaste` 无效或为空 | `INVALID_CONTENT` | `"Invalid Tana Paste content"` |
| `PermissionDeniedError` | 用户拒绝剪贴板权限 | `PERMISSION_DENIED` | `"Clipboard access denied. Please allow permissions."` |
| `ClipboardNotAvailableError` | Clipboard API 和 execCommand 都不可用 | `NOT_AVAILABLE` | `"Clipboard is not available in this browser."` |
| `CopyFailedError` | 复制操作失败（未知原因） | `COPY_FAILED` | `"Failed to copy content to clipboard."` |

**Error Response Format**:
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

---

## Secondary APIs

### `isClipboardAvailable(): boolean`

**描述**: 检测剪贴板功能是否可用。

#### Output Contract
```typescript
return: boolean   // true = 可用（Clipboard API 或 execCommand），false = 不可用
```

**Logic**:
```typescript
return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
```

---

### `getClipboardText(): Promise<string | null>`

**描述**: 读取当前剪贴板内容（用于测试验证，非主流程）。

#### Output Contract
```typescript
return: Promise<string | null>   // 剪贴板文本，无法读取时返回 null
```

**Note**: 此方法需要剪贴板读取权限，可能失败。

---

## Test Contract

### Unit Tests

**File**: `tests/unit/exporter/`

**Required Tests**:
1. `exportToClipboard()` - 成功复制（Clipboard API）
2. `exportToClipboard()` - 成功复制（execCommand 降级）
3. `exportToClipboard()` - 输入验证失败
4. `exportToClipboard()` - 权限拒绝错误
5. `exportToClipboard()` - API 不可用错误
6. `isClipboardAvailable()` - 检测可用性
7. `getClipboardText()` - 读取剪贴板（验证复制）

### Contract Tests

**File**: `tests/contract/exporter.contract.test.ts`

**Required Tests**:
1. 验证输入类型（TanaPaste 结构）
2. 验证输出结构（ExportResult 所有字段）
3. 验证成功场景（剪贴板内容正确）
4. 验证失败场景（所有 4 种错误类型）
5. 验证字符数统计（charactersExported）

### Integration Tests

**File**: `tests/integration/workflow.test.ts`

**Required Tests**:
1. Extractor → Formatter → Exporter 端到端管道
2. 模拟剪贴板权限拒绝场景
3. 模拟 API 不可用场景（降级测试）

---

## Performance Contract

**Constraints**:
- `exportToClipboard()` 执行时间 ≤ 50ms（普通内容，<50KB）
- 内存占用 ≤ 2MB（单次导出）

**Measurement**:
```typescript
const start = performance.now();
const result = await exportToClipboard(tanaPaste);
const duration = performance.now() - start;
expect(duration).toBeLessThan(50);
```

---

## Browser Compatibility

| 浏览器 | Clipboard API | execCommand 降级 | 支持状态 |
|--------|--------------|-----------------|---------|
| Chrome 66+ | ✅ | ✅ | Full |
| Edge 79+ | ✅ | ✅ | Full |
| Firefox 63+ | ✅ | ✅ | Full |
| Safari 13.1+ | ✅ | ✅ | Full |

**Fallback Strategy**:
1. 尝试 `navigator.clipboard.writeText()`
2. 如果失败，尝试 `document.execCommand('copy')`
3. 如果仍失败，返回错误

---

## Implementation Strategy

### Clipboard API (主方案)
```typescript
try {
  await navigator.clipboard.writeText(tanaPaste.content);
  return {
    success: true,
    method: 'clipboard-api',
    charactersExported: tanaPaste.content.length,
    exportedAt: Date.now()
  };
} catch (error) {
  // 降级到 execCommand
}
```

### execCommand (降级方案)
```typescript
const textarea = document.createElement('textarea');
textarea.value = tanaPaste.content;
textarea.style.position = 'fixed';
textarea.style.opacity = '0';
document.body.appendChild(textarea);
textarea.select();

const success = document.execCommand('copy');
document.body.removeChild(textarea);

if (success) {
  return {
    success: true,
    method: 'execCommand',
    charactersExported: tanaPaste.content.length,
    exportedAt: Date.now()
  };
}
```

---

## Dependencies

**External**:
- Browser Clipboard API (`navigator.clipboard`)
- Browser execCommand API (`document.execCommand`)

**Internal**:
- `src/modules/formatter/types.ts` (TanaPaste)
- `src/modules/exporter/types.ts` (ExportResult)

---

## Versioning

**Breaking Changes** (require MAJOR version bump):
- 修改 `exportToClipboard()` 函数签名
- 修改 `ExportResult` 数据结构（删除或重命名字段）
- 修改错误码（errorCode）

**Non-Breaking Changes** (MINOR version bump):
- 添加新的导出方法（如文件下载）
- 优化降级策略
- 添加新的可选参数

---

## Changelog

### v1.0.0 (2025-10-04)
- Initial contract definition
- Core API: `exportToClipboard()`
- Support for Clipboard API with execCommand fallback
- Comprehensive error handling

---

**Status**: ✅ Contract defined. Ready for TDD implementation.

