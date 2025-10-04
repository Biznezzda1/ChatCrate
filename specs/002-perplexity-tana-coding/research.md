# Research: Perplexity to Tana Workflow

**Feature**: 002-perplexity-tana-coding  
**Date**: 2025-10-04  
**Status**: Complete

## Overview

本文档记录 Perplexity → Tana 工作流功能的技术调研结果，解决实现前的关键技术决策点。

---

## 1. Tana Paste 格式规范

### Decision
采用 **Tana Paste 基于缩进的纯文本格式**，兼容 Markdown 语法子集。

### Rationale
- Tana Paste 是 Tana 官方支持的导入格式，通过剪贴板粘贴即可导入
- 格式简洁，基于文本缩进表示层级关系
- 支持 Markdown 语法：图片 `![](url)`、表格、代码块 ` ``` `
- 无需复杂的 API 集成，纯文本处理性能高

### Tana Paste 语法映射表

| Markdown 元素 | Tana Paste 语法 | 示例 |
|--------------|----------------|------|
| 一级标题 `#` | `- **标题文本**%%tana%%` | `- **Introduction**%%tana%%` |
| 二级标题 `##` | `  - **标题文本**%%tana%%` | `  - **Background**%%tana%%` |
| 加粗 `**text**` | `**text**` | `**important**` |
| 斜体 `*text*` | `*text*` | `*emphasis*` |
| 列表项 `-` | 缩进 + `-` | `  - item` |
| 链接 `[title](url)` | `[title](url)` | `[Source](https://...)` |
| 图片 `![alt](url)` | `![alt](url)` | `![Image](https://...)` |
| 代码块 ` ``` ` | ` ```language\ncode\n``` ` | ` ```python\nprint()\n``` ` |
| 表格 | Markdown 表格语法 | `| Col1 | Col2 |\n| --- | --- |` |

### 核心规则
1. **层级缩进**：每级缩进使用 2 个空格
2. **节点标记**：每个节点以 `- ` 开头（短横线 + 空格）
3. **元数据**：可选 `%%tana%%` 标记指定特殊类型（如标题、标签）
4. **引用格式**：使用 `- [标题](URL)` 表示引用链接

### References
- Tana Paste 官方文档：https://tana.inc/docs/tana-paste
- 社区示例：Tana Slack 频道的导入示例

---

## 2. Perplexity 页面结构分析

### Decision
基于 samples 分析，采用**多层选择器策略** + **降级回退机制**。

### Rationale
- Perplexity 使用 React 构建，DOM 结构动态生成
- **重要**: 所有页面类型（Search/DeepResearch/Labs）URL 均为 `/search/<id>` 格式，无法通过 URL 区分
- 必须通过 DOM 特征识别页面类型（如结构差异、data-testid、元素组合）
- 页面结构在不同类型间有差异，但核心内容区域相对稳定
- 样式类名可能变化（Tailwind 动态类），需要语义化选择器

### 页面类型识别策略

由于所有页面 URL 均为 `/search/<id>` 格式，需通过以下 DOM 特征区分：

| 页面类型 | DOM 识别特征 | 关键指标 |
|---------|-------------|---------|
| **Search** | 单个问答对结构 | `[data-testid="answer-content"]` 或单个主回答区域 |
| **DeepResearch** | 研究报告结构（标题、摘要、多章节） | 包含 `<h2>`、`<h3>` 多层级标题，摘要区域 |
| **Labs** | 对话历史（多轮消息） | 多个 `[data-testid="chat-message"]` 或消息列表容器 |

**检测优先级**:
1. 检查是否为 `/search/` 路径（基础验证）
2. 检查 DeepResearch 特征（研究报告结构最明显）
3. 检查 Labs 特征（对话列表）
4. 默认为 Search（单个问答）

### DOM 选择器配置表

#### Search 页面
| 内容类型 | 主选择器 | 降级选择器 | 说明 |
|---------|---------|-----------|------|
| 问题文本 | `[data-testid="query-text"]` | `h1:first-of-type` | 页面顶部用户查询 |
| 回答内容 | `[data-testid="answer-content"]` | `main > div:first-child p` | AI 生成的主要回答 |
| 引用列表 | `[data-testid="citation"]` | `a[href^="http"]` | 底部引用链接 |
| 引用标题 | `[data-testid="citation-title"]` | `a > span:first-child` | 引用来源标题 |
| 引用 URL | `a[href]` | - | 引用链接地址 |
| 图片 | `img[src^="http"]` | - | 内容中的图片 |
| 代码块 | `pre > code` | - | 代码示例 |
| 表格 | `table` | - | 表格内容 |

#### DeepResearch 页面
| 内容类型 | 主选择器 | 降级选择器 | 说明 |
|---------|---------|-----------|------|
| 研究标题 | `h1[class*="title"]` | `h1` | 研究主题 |
| 摘要内容 | `[data-testid="summary"]` | `p:first-of-type` | 研究摘要 |
| 章节标题 | `h2, h3` | - | 分章节内容 |
| 段落内容 | `p` | - | 正文段落 |
| 引用（同 Search） | - | - | - |

#### Labs 页面
| 内容类型 | 主选择器 | 降级选择器 | 说明 |
|---------|---------|-----------|------|
| 对话消息 | `[data-testid="chat-message"]` | `div[class*="message"]` | 对话消息块 |
| 用户消息 | `[data-role="user"]` | - | 用户发送的消息 |
| AI 消息 | `[data-role="assistant"]` | - | AI 回复的消息 |
| 引用（同 Search） | - | - | - |

### 提取策略
1. **主选择器优先**：先尝试 `data-testid` 等语义属性
2. **降级回退**：主选择器失败时使用标签 + 结构选择器
3. **文本节点搜索**：最后降级到正则匹配（如标题模式、URL 模式）
4. **稳定性保证**：记录选择器命中率，低于 90% 时告警

### Validation
- 使用 samples 目录下的3个 HTML 文件验证选择器
- 要求：每个样本至少提取 90% 的核心内容（问题、回答、引用）

---

## 3. HTML → Markdown 转换方案

### Decision
使用**原生 DOM API** + **自定义转换逻辑**，不引入额外库。

### Rationale
- **简洁性**：Perplexity 页面结构相对标准（p、h1-h6、ul、strong、em）
- **性能**：原生 API 无额外依赖，体积小、速度快
- **控制力**：自定义转换可精确处理 Tana Paste 需求（如缩进、元数据）
- **库评估结果**：
  - `turndown` (8KB)：功能强大但规则复杂，不完全符合 Tana 格式
  - `html-to-md` (3KB)：轻量但扩展性差
  - 自定义方案 (预估 2KB)：完全匹配需求

### 转换规则（伪代码）
```typescript
function htmlToMarkdown(element: HTMLElement): string {
  switch (element.tagName) {
    case 'H1': return `# ${element.textContent}`;
    case 'H2': return `## ${element.textContent}`;
    case 'P': return element.textContent;
    case 'STRONG': return `**${element.textContent}**`;
    case 'EM': return `*${element.textContent}*`;
    case 'UL': return element.querySelectorAll('li')
      .map(li => `- ${li.textContent}`).join('\n');
    case 'IMG': return `![${element.alt}](${element.src})`;
    case 'PRE': return '```\n' + element.textContent + '\n```';
    case 'TABLE': return convertTableToMarkdown(element);
    case 'A': return `[${element.textContent}](${element.href})`;
    default: return element.textContent;
  }
}
```

### 富媒体处理
- **图片**：提取 `src` 和 `alt`，生成 `![alt](src)`
- **表格**：遍历 `tr`/`td`，生成 Markdown 表格语法
- **代码块**：保留 `<pre><code>` 中的文本，添加 ` ``` ` 包围
- **嵌套处理**：递归处理子元素，保留结构

### Alternatives Considered
- ❌ **引入 turndown 库**：增加 8KB 体积，规则需大量定制
- ❌ **使用正则替换**：难以处理嵌套结构，易出错

---

## 4. 浏览器 Clipboard API

### Decision
使用 **Clipboard API (`navigator.clipboard.writeText`)** + **降级方案 (`document.execCommand`)**。

### Rationale
- Clipboard API 是现代标准，被所有主流浏览器支持（Chrome 66+, Firefox 63+, Edge 79+）
- 异步 API，用户体验好（无阻塞）
- 需要 HTTPS 或 localhost 环境（浏览器扩展自动满足）

### 兼容性表

| 浏览器 | Clipboard API | 降级方案 | 最低版本 |
|--------|--------------|---------|---------|
| Chrome | ✅ | ✅ | 66+ |
| Edge | ✅ | ✅ | 79+ |
| Firefox | ✅ | ✅ | 63+ |
| Safari | ✅ | ✅ | 13.1+ |

### 实现策略
```typescript
async function copyToClipboard(text: string): Promise<void> {
  try {
    // 主方案：Clipboard API
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // 降级方案：execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

### 错误处理
- **权限拒绝**：提示用户授权剪贴板权限
- **API 不可用**：自动降级到 `execCommand`
- **复制失败**：在 UI 中显示错误信息，建议手动复制（提供文本预览）

### References
- MDN Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- Can I Use: https://caniuse.com/mdn-api_clipboard_writetext

---

## 5. 页面加载状态检测

### Decision
使用 **MutationObserver** 监听 DOM 变化 + **自定义加载检测逻辑**。

### Rationale
- Perplexity 的 AI 回答是流式输出（逐字显示），需检测输出完成
- 没有明确的"加载完成"事件，需通过 DOM 稳定性判断
- MutationObserver 性能开销低，适合实时监听

### 检测策略
```typescript
function detectLoadingComplete(targetElement: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    let lastMutation = Date.now();
    const observer = new MutationObserver(() => {
      lastMutation = Date.now();
    });
    
    observer.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // 如果 500ms 内无变化，认为加载完成
    const checkStability = setInterval(() => {
      if (Date.now() - lastMutation > 500) {
        clearInterval(checkStability);
        observer.disconnect();
        resolve();
      }
    }, 100);
  });
}
```

### Alternatives Considered
- ❌ **轮询 DOM 高度**：不准确，可能误判
- ❌ **监听网络请求**：浏览器扩展权限限制，实现复杂

---

## 6. 性能优化策略

### Decision
采用**分步提取** + **异步处理** + **结果缓存**。

### Rationale
- 大型页面（DeepResearch）可能包含数千行内容
- 同步处理会阻塞 UI，影响用户体验
- 缓存可避免重复提取（用户多次点击）

### 实施方案
1. **分步提取**：
   - Step 1: 提取问题 + 回答主体（核心内容，优先处理）
   - Step 2: 提取引用列表（可并行）
   - Step 3: 提取富媒体（图片、表格、代码块，可延迟）

2. **异步处理**：
   ```typescript
   async function extract(page: Document): Promise<ExtractedContent> {
     const [core, citations, media] = await Promise.all([
       extractCore(page),
       extractCitations(page),
       extractMedia(page)
     ]);
     return { ...core, citations, media };
   }
   ```

3. **结果缓存**：
   - 缓存键：页面 URL + DOM hash
   - 缓存时效：5分钟（避免页面更新后使用旧数据）

### 性能目标
- 提取耗时: <500ms（普通页面）
- 格式化耗时: <100ms
- 总延迟: <1秒（符合用户感知阈值）

---

## Summary Table

| 研究项 | 决策 | 关键考量 |
|--------|------|---------|
| Tana Paste 格式 | 基于缩进的纯文本 + Markdown 子集 | 官方支持，简洁高效 |
| Perplexity 选择器 | 多层选择器 + 降级回退 | 稳定性 >90%，容错性强 |
| HTML → Markdown | 原生 DOM API + 自定义逻辑 | 零依赖，完全控制 |
| Clipboard API | Clipboard API + execCommand 降级 | 现代标准，兼容性好 |
| 加载检测 | MutationObserver + 稳定性判断 | 适配流式输出，性能优 |
| 性能优化 | 分步提取 + 异步 + 缓存 | 延迟<1秒，用户体验优 |

---

**Status**: ✅ All research complete. Ready for Phase 1 (Design & Contracts).

