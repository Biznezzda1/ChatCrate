# Quickstart: Perplexity to Tana Workflow

**Feature**: 002-perplexity-tana-coding  
**Date**: 2025-10-04  
**Purpose**: 用户验收测试指南

## Overview

本文档提供一个5分钟的快速测试流程，验证 Perplexity → Tana 工作流功能是否正确实现。

---

## Prerequisites

### 必需环境
- ✅ Chrome/Edge/Firefox 浏览器（最新版本）
- ✅ Tana 账号（用于验证粘贴结果）
- ✅ ChatCrate 浏览器扩展已安装（开发模式）

### 测试数据
- ✅ 3 个 Perplexity 样本页面（`specs/002-perplexity-tana-coding/samples/`）
  - `perplexity_research_report.html`
  - `perplexity_deepresearch_report.html`
  - `perplexity_labs_report.html`

---

## Quick Test Scenarios

### Scenario 1: Search 页面基本流程 (2 分钟)

**目标**: 验证从 Perplexity Search 页面提取并复制到 Tana 的完整流程。

**步骤**:

1. **打开样本页面**
   ```bash
   # 在浏览器中打开
   file:///path/to/ChatCrate/specs/002-perplexity-tana-coding/samples/perplexity_research_report.html
   ```
   或直接访问真实 Perplexity Search 页面：
   ```
   https://www.perplexity.ai/search/[any-query]
   ```

2. **打开浏览器扩展**
   - 点击浏览器工具栏的 ChatCrate 图标
   - 验证 popup 界面显示

3. **检查页面状态**
   - ✅ **预期**: 页面类型显示为 "Search"
   - ✅ **预期**: 页面状态显示为 "完成加载"（绿色指示）
   - ✅ **预期**: 操作按钮可用（非灰色）

4. **选择格式和导出方式**
   - Formatter 下拉：选择 "Tana Paste"
   - Exporter 下拉：选择 "Clipboard"

5. **执行导出**
   - 点击 "导出" 按钮
   - ✅ **预期**: 状态区域显示 "进行中..."（蓝色）
   - ✅ **预期**: 1 秒内状态变为 "成功"（绿色 ✓）
   - ✅ **预期**: 显示已复制字符数（如 "已复制 1024 个字符"）

6. **验证剪贴板内容**
   - 打开文本编辑器，粘贴 (Ctrl+V / Cmd+V)
   - ✅ **预期**: 内容以 `- **Query**:` 开头
   - ✅ **预期**: 包含 `- **Answer**` 节点
   - ✅ **预期**: 包含 `- **Citations**` 节点（如有引用）
   - ✅ **预期**: 缩进正确（每级 2 个空格）

7. **验证 Tana 导入**
   - 打开 Tana 应用
   - 创建或打开一个笔记
   - 粘贴内容 (Ctrl+V / Cmd+V)
   - ✅ **预期**: 内容以层级结构呈现
   - ✅ **预期**: 问题、回答、引用分别显示为独立节点
   - ✅ **预期**: 引用链接可点击
   - ✅ **预期**: 样式保留（加粗、斜体）

**验收标准**:
- [ ] 所有步骤通过
- [ ] 延迟 <1 秒
- [ ] Tana 中内容结构正确

---

### Scenario 2: 富媒体内容处理 (1.5 分钟)

**目标**: 验证图片、表格、代码块的正确提取和格式化。

**步骤**:

1. **准备包含富媒体的 Perplexity 页面**
   - 访问包含代码示例的查询（如 "Python hello world code"）
   - 或访问包含图片的查询（如 "Solar system diagram"）

2. **执行导出**（重复 Scenario 1 的步骤 2-5）

3. **验证剪贴板内容**
   - 检查图片语法：✅ 包含 `![alt](url)`
   - 检查代码块：✅ 包含 ` ```language\ncode\n``` `
   - 检查表格：✅ 包含 `| col1 | col2 |` 格式

4. **验证 Tana 显示**
   - 粘贴到 Tana
   - ✅ **预期**: 图片显示（或链接可点击）
   - ✅ **预期**: 代码块以代码格式显示
   - ✅ **预期**: 表格以表格结构显示

**验收标准**:
- [ ] 图片、代码块、表格均正确转换
- [ ] Tana 中富媒体正常显示

---

### Scenario 3: 错误处理 (1.5 分钟)

**目标**: 验证非法页面和错误场景的正确处理。

**步骤**:

1. **测试非 Perplexity 页面**
   - 打开任意其他网站（如 Google.com）
   - 打开 ChatCrate 扩展
   - ✅ **预期**: 操作按钮禁用（灰色）
   - ✅ **预期**: 提示信息：`"当前页面不受支持"`

2. **测试 Perplexity 非 chat 页面**
   - 打开 Perplexity 首页（https://www.perplexity.ai/）
   - 打开 ChatCrate 扩展
   - ✅ **预期**: 操作按钮禁用
   - ✅ **预期**: 提示信息：`"当前页面类型不受支持"`

3. **测试页面加载中状态**
   - 打开一个 Perplexity 查询
   - 在 AI 回答流式输出时（未完成）打开扩展
   - ✅ **预期**: 操作按钮禁用
   - ✅ **预期**: 提示信息：`"正在加载..."`
   - 等待加载完成
   - ✅ **预期**: 按钮自动变为可用

4. **测试剪贴板权限拒绝**（可选，需手动设置浏览器权限）
   - 在浏览器设置中拒绝剪贴板权限
   - 执行导出操作
   - ✅ **预期**: 状态显示失败（红色 ✗）
   - ✅ **预期**: 错误信息：`"请允许剪贴板权限"`

**验收标准**:
- [ ] 所有错误场景正确识别并提示
- [ ] 按钮状态正确反映页面状态

---

## Performance Validation

### 性能指标测试

**方法**: 使用浏览器开发者工具 Console 测试

```javascript
// 1. 打开 DevTools Console
// 2. 运行以下代码

console.time('extract');
// 执行提取操作（在扩展代码中）
console.timeEnd('extract');

console.time('format');
// 执行格式化操作
console.timeEnd('format');

console.time('export');
// 执行导出操作
console.timeEnd('export');
```

**验收标准**:
- [ ] 提取耗时 < 500ms
- [ ] 格式化耗时 < 100ms
- [ ] 导出耗时 < 50ms
- [ ] 总体延迟 < 1 秒（用户感知）

---

## Coverage Validation

### 提取覆盖率测试

**方法**: 对比样本文件和导出结果

```bash
# 1. 手动统计样本文件中的内容项
# - 问题数: 1
# - 回答段落数: X
# - 引用数: Y
# - 富媒体数: Z

# 2. 导出后统计 Tana Paste 中的内容项
# 3. 计算覆盖率
覆盖率 = (导出项数 / 样本项数) * 100%
```

**验收标准**:
- [ ] 覆盖率 ≥ 90%（对于前 10 条引用）
- [ ] 核心内容（问题+回答）100% 提取

---

## Regression Tests

### 跨浏览器测试

**测试矩阵**:

| 浏览器 | Scenario 1 | Scenario 2 | Scenario 3 | 性能 |
|--------|-----------|-----------|-----------|------|
| Chrome | ⬜ | ⬜ | ⬜ | ⬜ |
| Edge | ⬜ | ⬜ | ⬜ | ⬜ |
| Firefox | ⬜ | ⬜ | ⬜ | ⬜ |

**执行**: 在每个浏览器中重复 Scenario 1-3。

---

## Troubleshooting

### 常见问题

**问题 1**: 扩展图标不显示
- **原因**: 扩展未加载或权限不足
- **解决**: 在 `chrome://extensions` 中重新加载扩展

**问题 2**: 操作按钮始终禁用
- **原因**: 页面检测逻辑错误
- **调试**: 打开 DevTools → Console，查看错误日志

**问题 3**: 复制到剪贴板失败
- **原因**: 浏览器权限或 API 不可用
- **解决**: 检查浏览器权限设置，查看降级方案是否生效

**问题 4**: Tana 中粘贴后格式错乱
- **原因**: Tana Paste 格式不符合规范
- **调试**: 在文本编辑器中查看原始格式，验证缩进和语法

---

## Acceptance Checklist

### 功能验收

- [ ] **FR-001 to FR-003b**: 页面检测与验证（Scenario 3）
- [ ] **FR-004 to FR-008a**: 内容提取（Scenario 1, 2）
- [ ] **FR-009 to FR-012**: 格式转换（Scenario 1, 2）
- [ ] **FR-013 to FR-016**: 导出与复制（Scenario 1, 3）
- [ ] **FR-017 to FR-019b**: 用户界面（所有 Scenarios）
- [ ] **FR-020 to FR-022**: 验证与反馈（Scenario 1, 2）

### 性能验收

- [ ] 提取耗时 < 500ms
- [ ] 格式化耗时 < 100ms
- [ ] 导出耗时 < 50ms
- [ ] 总延迟 < 1 秒

### 质量验收

- [ ] 提取覆盖率 ≥ 90%
- [ ] 所有错误场景正确处理
- [ ] 跨浏览器兼容性（Chrome, Edge, Firefox）

---

## Sign-Off

**Tester**: _______________  
**Date**: _______________  
**Result**: ⬜ Pass  ⬜ Fail  ⬜ Needs Rework

**Notes**:
```
[测试过程中的观察和问题]
```

---

**Status**: ✅ Quickstart defined. Ready for implementation and testing.

