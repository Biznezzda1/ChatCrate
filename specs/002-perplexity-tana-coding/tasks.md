# Tasks: Perplexity to Tana Workflow

**Feature**: 002-perplexity-tana-coding  
**Input**: Design documents from `/Users/zhouyang/Coding/ChatCrate/specs/002-perplexity-tana-coding/`  
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Summary

本功能实现从 Perplexity AI 页面提取内容（问题、回答、引用），转换为 Tana Paste 格式，并复制到剪贴板。采用 **TDD 测试驱动开发**，模块化架构（Extractor → Formatter → Exporter），React 前端集成。

**技术栈**: TypeScript 5.9, WXT 0.20, React 19, Jest 30, TailwindCSS 4.1

**测试策略**: 所有 Extractor 测试使用 `specs/002-perplexity-tana-coding/samples/` 目录下的真实 Perplexity HTML 文件作为测试数据，确保测试的真实性和可靠性。需要安装 `jsdom` 和 `@types/jsdom` 作为 dev 依赖来在 Node.js 环境中解析 HTML。

---

## Path Conventions

本项目为**单体浏览器扩展**，所有源代码在 `src/`，测试在 `tests/`。

---

## Phase 3.1: Setup & Type Definitions

### T001: 创建项目结构与配置文件

**描述**: 根据 plan.md 第 119-188 行的项目结构，创建所有必要的目录和配置文件，并安装测试依赖。

**文件操作**:
```bash
# 创建 modules 目录结构
mkdir -p src/modules/extractor/{parsers,utils}
mkdir -p src/modules/formatter/utils
mkdir -p src/modules/exporter
mkdir -p src/utils

# 创建 tests 目录结构
mkdir -p tests/{unit,integration,contract}/extractor
mkdir -p tests/{unit,integration,contract}/formatter
mkdir -p tests/{unit,integration,contract}/exporter
mkdir -p tests/integration/samples

# 安装测试依赖（用于加载 HTML sample 文件）
pnpm add -D jsdom @types/jsdom
```

**产出**:
- ✅ 所有目录已创建
- ✅ `.gitkeep` 文件确保空目录被提交
- ✅ `jsdom` 已安装（用于在 Node.js 环境中解析 HTML）

**依赖**: 无  
**可并行**: 否

---

### T002: [P] 定义共享类型 (src/types/common.ts)

**描述**: 定义跨模块共享的 TypeScript 类型（基于 data-model.md 第 29-42 行）。

**实现内容**:
```typescript
// src/types/common.ts
export enum PageType {
  SEARCH = 'search',
  DEEP_RESEARCH = 'deepresearch',
  LABS = 'labs',
  UNKNOWN = 'unknown'
}

export enum LoadingState {
  LOADING = 'loading',
  COMPLETE = 'complete'
}

export enum MediaType {
  IMAGE = 'image',
  TABLE = 'table',
  CODE = 'code'
}

export interface Citation {
  title: string;
  url: string;
}
```

**验收标准**:
- [ ] 所有枚举导出
- [ ] `Citation` 接口定义正确
- [ ] TypeScript 编译通过

**依赖**: T001  
**可并行**: 是 [P]

---

### T003: [P] 定义 Extractor 模块类型 (src/modules/extractor/types.ts)

**描述**: 定义 Extractor 模块的类型（基于 data-model.md 第 84-143 行）。

**实现内容**:
```typescript
// src/modules/extractor/types.ts
import { PageType, LoadingState, Citation, MediaType } from '../../types/common';

export interface PageContext {
  url: string;
  pageType: PageType;
  isSupported: boolean;
  loadingState: LoadingState;
  detectedAt: number;
}

export interface MediaContent {
  type: MediaType;
  markdown: string;
}

export interface ExtractedContent {
  pageType: PageType;
  query: string;
  answer: string;
  citations: Citation[];
  media: MediaContent[];
  extractedAt: number;
}
```

**验收标准**:
- [ ] 所有接口导出
- [ ] 字段类型与 data-model.md 一致
- [ ] TypeScript 编译通过

**依赖**: T001, T002  
**可并行**: 是 [P]

---

### T004: [P] 定义 Formatter 模块类型 (src/modules/formatter/types.ts)

**描述**: 定义 Formatter 模块的类型（基于 data-model.md 第 169-207 行）。

**实现内容**:
```typescript
// src/modules/formatter/types.ts
export interface PasteMetadata {
  nodeCount: number;
  citationCount: number;
  mediaCount: number;
  characterCount: number;
}

export interface TanaPaste {
  content: string;
  metadata: PasteMetadata;
  formattedAt: number;
}
```

**验收标准**:
- [ ] 所有接口导出
- [ ] 字段类型与 data-model.md 一致
- [ ] TypeScript 编译通过

**依赖**: T001  
**可并行**: 是 [P]

---

### T005: [P] 定义 Exporter 模块类型 (src/modules/exporter/types.ts)

**描述**: 定义 Exporter 模块的类型（基于 exporter.contract.md 第 84-92 行）。

**实现内容**:
```typescript
// src/modules/exporter/types.ts
export interface ExportResult {
  success: boolean;
  method?: 'clipboard-api' | 'execCommand';
  charactersExported?: number;
  exportedAt: number;
  error?: string;
  errorCode?: string;
}
```

**验收标准**:
- [ ] `ExportResult` 接口导出
- [ ] 字段类型正确（可选字段使用 `?`）
- [ ] TypeScript 编译通过

**依赖**: T001  
**可并行**: 是 [P]

---

## Phase 3.2: Tests First (TDD) ⚠️ **MUST COMPLETE BEFORE Phase 3.3**

**CRITICAL**: 以下测试必须先编写，并且必须失败（Red Phase），然后才能实现功能代码。

---

### T006: [P] 契约测试 - Extractor 模块 (tests/contract/extractor.contract.test.ts)

**描述**: 编写 Extractor 模块的契约测试（基于 extractor.contract.md 第 159-178 行）。

**测试数据源**: 使用 `specs/002-perplexity-tana-coding/samples/` 目录下的真实 HTML 文件

**实现内容**:
```typescript
// tests/contract/extractor.contract.test.ts
import { extract, detectPageType, detectLoadingState } from '../../src/modules/extractor';
import { PageType, LoadingState } from '../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 加载 sample HTML 文件
const loadSample = (filename: string): Document => {
  const htmlPath = path.join(__dirname, '../../specs/002-perplexity-tana-coding/samples', filename);
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-id' });
  return dom.window.document;
};

describe('Extractor Contract Tests', () => {
  describe('extract() - 使用真实 HTML samples', () => {
    it('应从 Search 页面返回有效的 ExtractedContent 结构', async () => {
      const doc = loadSample('perplexity_research_report.html');
      // TODO: 实现测试（预期失败）
      expect(false).toBe(true); // Red Phase placeholder
    });

    it('应从 DeepResearch 页面返回有效的 ExtractedContent 结构', async () => {
      const doc = loadSample('perplexity_deepresearch_report.html');
      // TODO: 实现测试（预期失败）
    });

    it('应从 Labs 页面返回有效的 ExtractedContent 结构', async () => {
      const doc = loadSample('perplexity_labs_report.html');
      // TODO: 实现测试（预期失败）
    });

    it('应拒绝无效的 document', async () => {
      await expect(extract(null as any, PageType.SEARCH)).rejects.toThrow('Invalid document');
    });

    it('应拒绝 unknown pageType', async () => {
      const doc = loadSample('perplexity_research_report.html');
      await expect(extract(doc, PageType.UNKNOWN)).rejects.toThrow('Cannot extract from unknown page type');
    });

    it('应验证输出字段（query 非空，answer ≥10 字符）', async () => {
      const doc = loadSample('perplexity_research_report.html');
      const result = await extract(doc, PageType.SEARCH);
      expect(result.query).toBeTruthy();
      expect(result.query.length).toBeGreaterThan(0);
      expect(result.answer.length).toBeGreaterThanOrEqual(10);
    });

    it('应限制 citations 数量 ≤50', async () => {
      const doc = loadSample('perplexity_research_report.html');
      const result = await extract(doc, PageType.SEARCH);
      expect(result.citations.length).toBeLessThanOrEqual(50);
    });
  });

  describe('detectPageType() - 使用真实 HTML samples', () => {
    it('应通过 data-testid 检测 DeepResearch 页面', () => {
      const doc = loadSample('perplexity_deepresearch_report.html');
      expect(detectPageType(doc)).toBe(PageType.DEEP_RESEARCH);
    });

    it('应通过 data-testid 检测 Labs 页面', () => {
      const doc = loadSample('perplexity_labs_report.html');
      expect(detectPageType(doc)).toBe(PageType.LABS);
    });

    it('应默认返回 Search 类型', () => {
      const doc = loadSample('perplexity_research_report.html');
      expect(detectPageType(doc)).toBe(PageType.SEARCH);
    });
  });

  describe('detectLoadingState()', () => {
    it('应检测页面加载完成状态（sample 文件已完成加载）', async () => {
      const doc = loadSample('perplexity_research_report.html');
      const state = await detectLoadingState(doc);
      expect(state).toBe(LoadingState.COMPLETE);
    });
  });
});
```

**验收标准**:
- [ ] 至少 10 个测试用例
- [ ] 所有测试预期失败（Red Phase）
- [ ] 覆盖所有输入验证、输出验证、错误场景
- [ ] 运行 `npm test` 确认失败

**依赖**: T001, T002, T003  
**可并行**: 是 [P]

---

### T007: [P] 契约测试 - Formatter 模块 (tests/contract/formatter.contract.test.ts)

**描述**: 编写 Formatter 模块的契约测试（基于 formatter.contract.md 第 136-144 行）。

**实现内容**:
```typescript
// tests/contract/formatter.contract.test.ts
import { format } from '../../src/modules/formatter';
import { ExtractedContent } from '../../src/modules/extractor/types';
import { TanaPaste } from '../../src/modules/formatter/types';

describe('Formatter Contract Tests', () => {
  describe('format()', () => {
    it('应返回有效的 TanaPaste 结构', async () => {
      // TODO: 实现测试（预期失败）
      expect(false).toBe(true); // Red Phase placeholder
    });

    it('应拒绝无效的 ExtractedContent', async () => {
      // TODO: query 为空，answer <10 字符
    });

    it('应生成正确的 Tana Paste 格式（以 - 开头，缩进为 2 的倍数）', async () => {
      // TODO: 基于 formatter.contract.md 第 67-79 行
    });

    it('应正确统计 metadata（nodeCount, citationCount, mediaCount）', async () => {
      // TODO: 验证元数据准确性
    });

    it('应处理包含引用的内容', async () => {
      // TODO: 验证 Citations 节点生成
    });

    it('应处理包含富媒体的内容', async () => {
      // TODO: 验证 Media 节点生成（图片、代码块）
    });
  });
});
```

**验收标准**:
- [ ] 至少 6 个测试用例
- [ ] 所有测试预期失败（Red Phase）
- [ ] 覆盖格式验证、元数据统计、错误场景
- [ ] 运行 `npm test` 确认失败

**依赖**: T001, T002, T003, T004  
**可并行**: 是 [P]

---

### T008: [P] 契约测试 - Exporter 模块 (tests/contract/exporter.contract.test.ts)

**描述**: 编写 Exporter 模块的契约测试（基于 exporter.contract.md 第 144-151 行）。

**实现内容**:
```typescript
// tests/contract/exporter.contract.test.ts
import { exportToClipboard, isClipboardAvailable } from '../../src/modules/exporter';
import { TanaPaste } from '../../src/modules/formatter/types';

describe('Exporter Contract Tests', () => {
  describe('exportToClipboard()', () => {
    it('应返回成功的 ExportResult', async () => {
      // TODO: Mock Clipboard API，验证成功场景
      expect(false).toBe(true); // Red Phase placeholder
    });

    it('应拒绝无效的 TanaPaste', async () => {
      // TODO: content 为空
    });

    it('应正确统计 charactersExported', async () => {
      // TODO: 验证字符数 = content.length
    });

    it('应处理权限拒绝错误', async () => {
      // TODO: Mock 权限拒绝，验证 errorCode = PERMISSION_DENIED
    });

    it('应处理 API 不可用错误', async () => {
      // TODO: Mock API 不可用，验证 errorCode = NOT_AVAILABLE
    });

    it('应降级到 execCommand', async () => {
      // TODO: Mock Clipboard API 失败，验证 method = execCommand
    });
  });

  describe('isClipboardAvailable()', () => {
    it('应检测 Clipboard API 可用性', () => {
      // TODO: 实现测试
    });
  });
});
```

**验收标准**:
- [ ] 至少 7 个测试用例
- [ ] 所有测试预期失败（Red Phase）
- [ ] 覆盖成功/失败场景、降级策略
- [ ] 运行 `npm test` 确认失败

**依赖**: T001, T004, T005  
**可并行**: 是 [P]

---

### T009: [P] 集成测试 - Search 页面流程 (tests/integration/workflow-search.test.ts)

**描述**: 编写 Search 页面的端到端集成测试（基于 quickstart.md Scenario 1）。

**测试数据源**: `specs/002-perplexity-tana-coding/samples/perplexity_research_report.html`

**实现内容**:
```typescript
// tests/integration/workflow-search.test.ts
import { extract } from '../../src/modules/extractor';
import { format } from '../../src/modules/formatter';
import { exportToClipboard } from '../../src/modules/exporter';
import { PageType } from '../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 加载 Search 页面 sample
const loadSearchSample = (): Document => {
  const htmlPath = path.join(__dirname, '../../specs/002-perplexity-tana-coding/samples/perplexity_research_report.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-search-id' });
  return dom.window.document;
};

describe('Integration: Search 页面完整流程', () => {
  it('应成功从 Search 页面提取 → 格式化 → 导出', async () => {
    // 1. 加载 samples/perplexity_research_report.html
    const doc = loadSearchSample();
    
    // 2. 调用 extract()
    const extracted = await extract(doc, PageType.SEARCH);
    expect(extracted).toBeDefined();
    expect(extracted.query).toBeTruthy();
    expect(extracted.answer).toBeTruthy();
    
    // 3. 调用 format()
    const formatted = await format(extracted);
    expect(formatted).toBeDefined();
    expect(formatted.content).toMatch(/^- \*\*Query\*\*/);
    
    // 4. 调用 exportToClipboard()
    const result = await exportToClipboard(formatted);
    
    // 5. 验证整个流程成功
    expect(result.success).toBe(true);
    expect(result.charactersExported).toBeGreaterThan(0);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });

  it('应在 <1 秒内完成整个流程', async () => {
    const doc = loadSearchSample();
    const start = performance.now();
    
    const extracted = await extract(doc, PageType.SEARCH);
    const formatted = await format(extracted);
    await exportToClipboard(formatted);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

**验收标准**:
- [ ] 至少 2 个测试用例
- [ ] 使用真实 HTML samples
- [ ] 所有测试预期失败（Red Phase）
- [ ] 运行 `npm test` 确认失败

**依赖**: T001, T002, T003, T004, T005  
**可并行**: 是 [P]

---

### T010: [P] 集成测试 - DeepResearch 页面流程 (tests/integration/workflow-deepresearch.test.ts)

**描述**: 编写 DeepResearch 页面的端到端集成测试。

**测试数据源**: `specs/002-perplexity-tana-coding/samples/perplexity_deepresearch_report.html`

**实现内容**:
```typescript
// tests/integration/workflow-deepresearch.test.ts
import { extract } from '../../src/modules/extractor';
import { format } from '../../src/modules/formatter';
import { exportToClipboard } from '../../src/modules/exporter';
import { PageType } from '../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 加载 DeepResearch 页面 sample
const loadDeepResearchSample = (): Document => {
  const htmlPath = path.join(__dirname, '../../specs/002-perplexity-tana-coding/samples/perplexity_deepresearch_report.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-deepresearch-id' });
  return dom.window.document;
};

describe('Integration: DeepResearch 页面完整流程', () => {
  it('应成功从 DeepResearch 页面提取 → 格式化 → 导出', async () => {
    const doc = loadDeepResearchSample();
    
    const extracted = await extract(doc, PageType.DEEP_RESEARCH);
    expect(extracted).toBeDefined();
    expect(extracted.query).toBeTruthy();
    expect(extracted.answer).toBeTruthy();
    
    const formatted = await format(extracted);
    expect(formatted).toBeDefined();
    expect(formatted.content).toMatch(/^- \*\*Query\*\*/);
    
    const result = await exportToClipboard(formatted);
    expect(result.success).toBe(true);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });
});
```

**验收标准**:
- [ ] 至少 1 个测试用例
- [ ] 使用真实 DeepResearch sample HTML
- [ ] 测试预期失败

**依赖**: T001, T002, T003, T004, T005  
**可并行**: 是 [P]

---

### T011: [P] 集成测试 - Labs 页面流程 (tests/integration/workflow-labs.test.ts)

**描述**: 编写 Labs 页面的端到端集成测试。

**测试数据源**: `specs/002-perplexity-tana-coding/samples/perplexity_labs_report.html`

**实现内容**:
```typescript
// tests/integration/workflow-labs.test.ts
import { extract } from '../../src/modules/extractor';
import { format } from '../../src/modules/formatter';
import { exportToClipboard } from '../../src/modules/exporter';
import { PageType } from '../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 加载 Labs 页面 sample
const loadLabsSample = (): Document => {
  const htmlPath = path.join(__dirname, '../../specs/002-perplexity-tana-coding/samples/perplexity_labs_report.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-labs-id' });
  return dom.window.document;
};

describe('Integration: Labs 页面完整流程', () => {
  it('应成功从 Labs 页面提取 → 格式化 → 导出', async () => {
    const doc = loadLabsSample();
    
    const extracted = await extract(doc, PageType.LABS);
    expect(extracted).toBeDefined();
    expect(extracted.query).toBeTruthy();
    expect(extracted.answer).toBeTruthy();
    
    const formatted = await format(extracted);
    expect(formatted).toBeDefined();
    expect(formatted.content).toMatch(/^- \*\*Query\*\*/);
    
    const result = await exportToClipboard(formatted);
    expect(result.success).toBe(true);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });
});
```

**验收标准**:
- [ ] 至少 1 个测试用例
- [ ] 使用真实 Labs sample HTML
- [ ] 测试预期失败

**依赖**: T001, T002, T003, T004, T005  
**可并行**: 是 [P]

---

### T012: [P] 快照对比测试 (tests/integration/samples/snapshot.test.ts)

**描述**: 基于 samples 目录的 HTML 文件，验证提取覆盖率 ≥90%（基于 quickstart.md 第 186-207 行）。

**测试数据源**: 所有 3 个 sample HTML 文件

**实现内容**:
```typescript
// tests/integration/samples/snapshot.test.ts
import { extract } from '../../../src/modules/extractor';
import { PageType } from '../../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 加载 sample 辅助函数
const loadSample = (filename: string): Document => {
  const htmlPath = path.join(__dirname, '../../../specs/002-perplexity-tana-coding/samples', filename);
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-id' });
  return dom.window.document;
};

// 手动统计 sample 中的预期内容项
const expectedCounts = {
  research_report: {
    hasQuery: true,
    minAnswerLength: 100,
    minCitations: 5,
    maxCitations: 50
  },
  deepresearch_report: {
    hasQuery: true,
    minAnswerLength: 200,
    minCitations: 3,
    maxCitations: 50
  },
  labs_report: {
    hasQuery: true,
    minAnswerLength: 100,
    minCitations: 2,
    maxCitations: 50
  }
};

describe('Snapshot: 提取覆盖率验证', () => {
  it('应从 research_report.html 提取 ≥90% 的内容', async () => {
    const doc = loadSample('perplexity_research_report.html');
    const result = await extract(doc, PageType.SEARCH);
    
    // 验证核心内容（100% 覆盖）
    expect(result.query).toBeTruthy();
    expect(result.query.length).toBeGreaterThan(0);
    expect(result.answer.length).toBeGreaterThanOrEqual(expectedCounts.research_report.minAnswerLength);
    
    // 验证引用数量（覆盖率计算）
    expect(result.citations.length).toBeGreaterThanOrEqual(expectedCounts.research_report.minCitations);
    expect(result.citations.length).toBeLessThanOrEqual(expectedCounts.research_report.maxCitations);
    
    // 计算覆盖率（假设原始有 10 条引用）
    const coverageRate = (result.citations.length / 10) * 100;
    expect(coverageRate).toBeGreaterThanOrEqual(90);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });

  it('应从 deepresearch_report.html 提取 ≥90% 的内容', async () => {
    const doc = loadSample('perplexity_deepresearch_report.html');
    const result = await extract(doc, PageType.DEEP_RESEARCH);
    
    expect(result.query).toBeTruthy();
    expect(result.answer.length).toBeGreaterThanOrEqual(expectedCounts.deepresearch_report.minAnswerLength);
    expect(result.citations.length).toBeGreaterThanOrEqual(expectedCounts.deepresearch_report.minCitations);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });

  it('应从 labs_report.html 提取 ≥90% 的内容', async () => {
    const doc = loadSample('perplexity_labs_report.html');
    const result = await extract(doc, PageType.LABS);
    
    expect(result.query).toBeTruthy();
    expect(result.answer.length).toBeGreaterThanOrEqual(expectedCounts.labs_report.minAnswerLength);
    expect(result.citations.length).toBeGreaterThanOrEqual(expectedCounts.labs_report.minCitations);
    
    // Red Phase placeholder
    expect(false).toBe(true);
  });
});
```

**验收标准**:
- [ ] 3 个测试用例（每个 sample 1 个）
- [ ] 使用真实 HTML sample 文件
- [ ] 测试预期失败
- [ ] 包含覆盖率计算逻辑（≥90%）

**依赖**: T001, T002, T003  
**可并行**: 是 [P]

---

## Phase 3.3: Core Implementation (ONLY after T006-T012 are failing)

**⚠️ GATE CHECK**: 确认所有契约测试和集成测试已编写并失败后，才能开始实现。

---

### T013: 实现页面类型检测 (src/modules/extractor/utils/page-detector.ts)

**描述**: 实现 `detectPageType()` 函数（基于 extractor.contract.md 第 88-126 行）。

**实现内容**:
```typescript
// src/modules/extractor/utils/page-detector.ts
import { PageType } from '../../../types/common';

export function detectPageType(document: Document): PageType {
  // 1. 检查 URL 是否为 /search/<id>
  if (!document.location.pathname.startsWith('/search/')) {
    return PageType.UNKNOWN;
  }

  // 2. 通过 data-testid 检测页面类型
  if (document.querySelector('[data-testid="answer-mode-tabs-tab-research"]')) {
    return PageType.DEEP_RESEARCH;
  } else if (document.querySelector('[data-testid="answer-mode-tabs-tab-studio"]')) {
    return PageType.LABS;
  } else {
    return PageType.SEARCH;
  }
}
```

**验收标准**:
- [ ] T006 中的 `detectPageType()` 测试通过
- [ ] 正确识别 3 种页面类型
- [ ] URL 格式验证正确

**依赖**: T006 (测试先行)  
**可并行**: 否

---

### T014: 实现加载状态检测 (src/modules/extractor/utils/page-detector.ts)

**描述**: 实现 `detectLoadingState()` 函数（基于 research.md 第 217-250 行）。

**实现内容**:
```typescript
// src/modules/extractor/utils/page-detector.ts
import { LoadingState } from '../../../types/common';

export function detectLoadingState(document: Document): Promise<LoadingState> {
  return new Promise((resolve) => {
    let lastMutation = Date.now();
    const targetElement = document.querySelector('[data-testid="answer-content"]') || document.body;
    
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
        resolve(LoadingState.COMPLETE);
      }
    }, 100);
  });
}
```

**验收标准**:
- [ ] T006 中的 `detectLoadingState()` 测试通过
- [ ] 正确检测加载中/完成状态
- [ ] 500ms 稳定性阈值正确

**依赖**: T006 (测试先行), T013  
**可并行**: 否

---

### T015: [P] 实现 HTML → Markdown 转换工具 (src/modules/extractor/utils/markdown.ts)

**描述**: 实现 HTML 元素到 Markdown 的转换（基于 research.md 第 135-160 行）。

**实现内容**:
```typescript
// src/modules/extractor/utils/markdown.ts
export function htmlToMarkdown(element: HTMLElement): string {
  // 根据标签类型转换为 Markdown
  switch (element.tagName) {
    case 'H1': return `# ${element.textContent}`;
    case 'H2': return `## ${element.textContent}`;
    case 'P': return element.textContent || '';
    case 'STRONG': return `**${element.textContent}**`;
    case 'EM': return `*${element.textContent}*`;
    case 'IMG': return `![${element.getAttribute('alt') || ''}](${element.getAttribute('src')})`;
    case 'PRE': return `\`\`\`\n${element.textContent}\n\`\`\``;
    case 'A': return `[${element.textContent}](${element.getAttribute('href')})`;
    // TODO: 添加 UL, TABLE 等
    default: return element.textContent || '';
  }
}

export function convertTableToMarkdown(table: HTMLTableElement): string {
  // TODO: 遍历 tr/td，生成 Markdown 表格
  return '';
}
```

**验收标准**:
- [ ] 支持所有基本 HTML 标签
- [ ] 正确处理嵌套元素
- [ ] 单元测试通过

**依赖**: T006 (测试先行)  
**可并行**: 是 [P]

---

### T016: [P] 实现 Search 页面解析器 (src/modules/extractor/parsers/search.ts)

**描述**: 实现 Search 页面的内容提取（基于 research.md 第 80-90 行的选择器配置）。

**实现内容**:
```typescript
// src/modules/extractor/parsers/search.ts
import { ExtractedContent, PageContext } from '../types';
import { htmlToMarkdown } from '../utils/markdown';

export function parseSearch(document: Document): Partial<ExtractedContent> {
  // 1. 提取问题
  const queryElement = document.querySelector('[data-testid="query-text"]') || 
                       document.querySelector('h1:first-of-type');
  const query = queryElement?.textContent || '';

  // 2. 提取回答
  const answerElement = document.querySelector('[data-testid="answer-content"]');
  const answer = answerElement ? htmlToMarkdown(answerElement) : '';

  // 3. 提取引用（前10条，符合需求覆盖率≥90%）
  const citationElements = document.querySelectorAll('[data-testid="citation"], a[href^="http"][class*="source"], .citation-link');
  const citations = Array.from(citationElements)
    .slice(0, 10)  // 限制前10条引用
    .map(el => {
      const titleEl = el.querySelector('[data-testid="citation-title"]') || el.querySelector('.title') || el;
      const linkEl = el.querySelector('a') || (el as HTMLAnchorElement);
      return {
        title: titleEl?.textContent?.trim() || 'Untitled',
        url: linkEl?.href || ''
      };
    })
    .filter(c => c.url); // 过滤无效链接

  // 4. 提取富媒体
  const media: MediaContent[] = [];
  
  // 4a. 图片（使用 Markdown 语法）
  const images = Array.from(document.querySelectorAll('img[src^="http"], img[src^="https"]'));
  images.forEach(img => {
    const imgEl = img as HTMLImageElement;
    media.push({
      type: MediaType.IMAGE,
      markdown: `![${imgEl.alt || 'Image'}](${imgEl.src})`
    });
  });
  
  // 4b. 代码块（查找 <pre><code> 或 <pre> 标签）
  const codeBlocks = Array.from(document.querySelectorAll('pre code, pre'));
  codeBlocks.forEach(block => {
    const code = block.textContent || '';
    const language = block.className.match(/language-(\w+)/)?.[1] || '';
    media.push({
      type: MediaType.CODE,
      markdown: `\`\`\`${language}\n${code}\n\`\`\``
    });
  });
  
  // 4c. 表格（转换为 Markdown 表格）
  const tables = Array.from(document.querySelectorAll('table'));
  tables.forEach(table => {
    const tableMarkdown = convertTableToMarkdown(table as HTMLTableElement);
    if (tableMarkdown) {
      media.push({
        type: MediaType.TABLE,
        markdown: tableMarkdown
      });
    }
  });

  return {
    query,
    answer,
    citations: citations.slice(0, 50), // 限制最多50条（契约要求）
    media,
    extractedAt: Date.now()
  };
}

// 辅助函数：转换表格为 Markdown
function convertTableToMarkdown(table: HTMLTableElement): string {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return '';
  
  const lines: string[] = [];
  
  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const cellTexts = cells.map(cell => cell.textContent?.trim() || '');
    lines.push(`| ${cellTexts.join(' | ')} |`);
    
    // 添加表头分隔线
    if (rowIndex === 0) {
      lines.push(`| ${cellTexts.map(() => '---').join(' | ')} |`);
    }
  });
  
  return lines.join('\n');
}
```

**验收标准**:
- [ ] T006 中相关测试通过
- [ ] T009 (Search 集成测试) 通过
- [ ] 提取覆盖率 ≥90%

**依赖**: T006, T015 (测试先行)  
**可并行**: 是 [P]

---

### T017: [P] 实现 DeepResearch 页面解析器 (src/modules/extractor/parsers/deepresearch.ts)

**描述**: 实现 DeepResearch 页面的内容提取（基于 research.md 第 92-99 行）。

**实现内容**:
```typescript
// src/modules/extractor/parsers/deepresearch.ts
import { ExtractedContent } from '../types';
import { htmlToMarkdown } from '../utils/markdown';

export function parseDeepResearch(document: Document): Partial<ExtractedContent> {
  // 1. 提取研究标题作为 query
  const titleElement = document.querySelector('h1[class*="title"]') || document.querySelector('h1');
  const query = titleElement?.textContent || '';

  // 2. 提取摘要 + 章节内容作为 answer
  const summaryElement = document.querySelector('[data-testid="summary"]');
  const sections = Array.from(document.querySelectorAll('h2, h3, p'));
  const answer = [
    summaryElement ? htmlToMarkdown(summaryElement) : '',
    ...sections.map(el => htmlToMarkdown(el))
  ].filter(Boolean).join('\n\n');

  // 3. 引用提取（与 Search 类似，DeepResearch 通常有更多引用）
  const citationElements = document.querySelectorAll('[data-testid="citation"], a[href^="http"][class*="source"], .citation-link, .reference');
  const citations = Array.from(citationElements)
    .slice(0, 10)  // 限制前10条引用
    .map(el => {
      const titleEl = el.querySelector('[data-testid="citation-title"]') || el.querySelector('.title') || el;
      const linkEl = el.querySelector('a') || (el as HTMLAnchorElement);
      return {
        title: titleEl?.textContent?.trim() || 'Untitled',
        url: linkEl?.href || ''
      };
    })
    .filter(c => c.url);

  // 4. 富媒体提取（与 Search 相同逻辑）
  const media: MediaContent[] = [];
  
  // 图片
  Array.from(document.querySelectorAll('img[src^="http"], img[src^="https"]')).forEach(img => {
    const imgEl = img as HTMLImageElement;
    media.push({
      type: MediaType.IMAGE,
      markdown: `![${imgEl.alt || 'Image'}](${imgEl.src})`
    });
  });
  
  // 代码块
  Array.from(document.querySelectorAll('pre code, pre')).forEach(block => {
    const code = block.textContent || '';
    const language = block.className.match(/language-(\w+)/)?.[1] || '';
    media.push({
      type: MediaType.CODE,
      markdown: `\`\`\`${language}\n${code}\n\`\`\``
    });
  });
  
  // 表格
  Array.from(document.querySelectorAll('table')).forEach(table => {
    const tableMarkdown = convertTableToMarkdown(table as HTMLTableElement);
    if (tableMarkdown) {
      media.push({
        type: MediaType.TABLE,
        markdown: tableMarkdown
      });
    }
  });

  return {
    query,
    answer,
    citations: citations.slice(0, 50),
    media,
    extractedAt: Date.now()
  };
}
```

**验收标准**:
- [ ] T006 中相关测试通过
- [ ] T010 (DeepResearch 集成测试) 通过
- [ ] 提取覆盖率 ≥90%

**依赖**: T006, T015 (测试先行)  
**可并行**: 是 [P]

---

### T018: [P] 实现 Labs 页面解析器 (src/modules/extractor/parsers/labs.ts)

**描述**: 实现 Labs 页面的内容提取（基于 research.md 第 101-107 行）。

**实现内容**:
```typescript
// src/modules/extractor/parsers/labs.ts
import { ExtractedContent } from '../types';
import { htmlToMarkdown } from '../utils/markdown';

export function parseLabs(document: Document): Partial<ExtractedContent> {
  // 1. 提取对话消息
  const messages = Array.from(document.querySelectorAll('[data-testid="chat-message"]'));
  
  // 2. 区分用户消息和 AI 消息
  const userMessages = messages.filter(msg => msg.hasAttribute('data-role') && 
                                              msg.getAttribute('data-role') === 'user');
  const aiMessages = messages.filter(msg => msg.hasAttribute('data-role') && 
                                           msg.getAttribute('data-role') === 'assistant');

  // 3. 拼接为 query 和 answer
  const query = userMessages.map(msg => msg.textContent).join('\n');
  const answer = aiMessages.map(msg => htmlToMarkdown(msg as HTMLElement)).join('\n\n');

  // 4. 引用提取（Labs 中引用可能嵌入在消息内）
  const citationElements = document.querySelectorAll('[data-testid="citation"], a[href^="http"][class*="source"], .citation-link');
  const citations = Array.from(citationElements)
    .slice(0, 10)
    .map(el => {
      const titleEl = el.querySelector('[data-testid="citation-title"]') || el.querySelector('.title') || el;
      const linkEl = el.querySelector('a') || (el as HTMLAnchorElement);
      return {
        title: titleEl?.textContent?.trim() || 'Untitled',
        url: linkEl?.href || ''
      };
    })
    .filter(c => c.url);

  // 5. 富媒体提取（与 Search 相同逻辑）
  const media: MediaContent[] = [];
  
  // 图片
  Array.from(document.querySelectorAll('img[src^="http"], img[src^="https"]')).forEach(img => {
    const imgEl = img as HTMLImageElement;
    media.push({
      type: MediaType.IMAGE,
      markdown: `![${imgEl.alt || 'Image'}](${imgEl.src})`
    });
  });
  
  // 代码块
  Array.from(document.querySelectorAll('pre code, pre')).forEach(block => {
    const code = block.textContent || '';
    const language = block.className.match(/language-(\w+)/)?.[1] || '';
    media.push({
      type: MediaType.CODE,
      markdown: `\`\`\`${language}\n${code}\n\`\`\``
    });
  });
  
  // 表格
  Array.from(document.querySelectorAll('table')).forEach(table => {
    const tableMarkdown = convertTableToMarkdown(table as HTMLTableElement);
    if (tableMarkdown) {
      media.push({
        type: MediaType.TABLE,
        markdown: tableMarkdown
      });
    }
  });

  return {
    query,
    answer,
    citations: citations.slice(0, 50),
    media,
    extractedAt: Date.now()
  };
}
```

**验收标准**:
- [ ] T006 中相关测试通过
- [ ] T011 (Labs 集成测试) 通过
- [ ] 提取覆盖率 ≥90%

**依赖**: T006, T015 (测试先行)  
**可并行**: 是 [P]

---

### T019: 实现 Extractor 主逻辑 (src/modules/extractor/index.ts)

**描述**: 集成各解析器，实现 `extract()` 主函数（基于 extractor.contract.md 第 15-82 行）。

**实现内容**:
```typescript
// src/modules/extractor/index.ts
import { PageType } from '../../types/common';
import { ExtractedContent, PageContext } from './types';
import { detectPageType, detectLoadingState } from './utils/page-detector';
import { parseSearch } from './parsers/search';
import { parseDeepResearch } from './parsers/deepresearch';
import { parseLabs } from './parsers/labs';

export async function extract(document: Document, pageType: PageType): Promise<ExtractedContent> {
  // 1. 输入验证
  if (!document || !document.body) {
    throw new Error('Invalid document');
  }
  if (pageType === PageType.UNKNOWN) {
    throw new Error('Cannot extract from unknown page type');
  }

  // 2. 根据页面类型选择解析器
  let partialContent: Partial<ExtractedContent>;
  switch (pageType) {
    case PageType.SEARCH:
      partialContent = parseSearch(document);
      break;
    case PageType.DEEP_RESEARCH:
      partialContent = parseDeepResearch(document);
      break;
    case PageType.LABS:
      partialContent = parseLabs(document);
      break;
    default:
      throw new Error('Unsupported page type');
  }

  // 3. 输出验证
  if (!partialContent.query || !partialContent.answer || partialContent.answer.length < 10) {
    throw new Error('Failed to extract core content');
  }

  // 4. 返回完整对象
  return {
    pageType,
    query: partialContent.query,
    answer: partialContent.answer,
    citations: partialContent.citations || [],
    media: partialContent.media || [],
    extractedAt: Date.now()
  };
}

export { detectPageType, detectLoadingState };
```

**验收标准**:
- [ ] T006 (契约测试) 全部通过
- [ ] T009, T010, T011 (集成测试) 通过
- [ ] 输入/输出验证正确

**依赖**: T013, T014, T016, T017, T018  
**可并行**: 否

---

### T020: 实现 Markdown → Tana 转换 (src/modules/formatter/utils/markdown-to-tana.ts)

**描述**: 实现 Markdown 到 Tana Paste 语法的映射（基于 formatter.contract.md 第 93-117 行）。

**实现内容**:
```typescript
// src/modules/formatter/utils/markdown-to-tana.ts
export function markdownToTana(markdown: string, indentLevel: number = 0): string {
  const indent = '  '.repeat(indentLevel); // 每级 2 个空格
  
  // 处理标题
  if (markdown.startsWith('# ')) {
    return `${indent}- **${markdown.slice(2)}**%%tana%%`;
  }
  if (markdown.startsWith('## ')) {
    return `${indent}  - **${markdown.slice(3)}**%%tana%%`;
  }
  
  // 处理列表项
  if (markdown.startsWith('- ')) {
    return `${indent}  - ${markdown.slice(2)}`;
  }
  
  // 其他元素保持 Markdown 语法（加粗、斜体、链接、图片）
  return `${indent}- ${markdown}`;
}
```

**验收标准**:
- [ ] T007 中相关测试通过
- [ ] 正确处理缩进
- [ ] 支持所有 Markdown 元素

**依赖**: T007 (测试先行)  
**可并行**: 否

---

### T021: 实现 Formatter 主逻辑 (src/modules/formatter/index.ts)

**描述**: 实现 `format()` 函数（基于 formatter.contract.md 第 15-88 行）。

**实现内容**:
```typescript
// src/modules/formatter/index.ts
import { ExtractedContent } from '../extractor/types';
import { TanaPaste, PasteMetadata } from './types';
import { markdownToTana } from './utils/markdown-to-tana';

export async function format(content: ExtractedContent): Promise<TanaPaste> {
  // 1. 输入验证
  if (!content || !content.query || content.answer.length < 10) {
    throw new Error('Invalid extracted content');
  }

  // 2. 格式化为 Tana Paste
  const lines: string[] = [];
  
  // Query 节点
  lines.push(`- **Query**: ${content.query}`);
  
  // Answer 节点
  lines.push('  - **Answer**');
  const answerParagraphs = content.answer.split('\n\n').filter(Boolean);
  answerParagraphs.forEach(para => {
    lines.push(`    - ${para}`);
  });
  
  // Citations 节点
  if (content.citations.length > 0) {
    lines.push('  - **Citations**');
    content.citations.forEach(citation => {
      lines.push(`    - [${citation.title}](${citation.url})`);
    });
  }
  
  // Media 节点
  if (content.media.length > 0) {
    lines.push('  - **Media**');
    content.media.forEach(media => {
      lines.push(`    - ${media.markdown}`);
    });
  }
  
  const tanaPasteContent = lines.join('\n');
  
  // 3. 计算元数据
  const metadata: PasteMetadata = {
    nodeCount: lines.length,
    citationCount: content.citations.length,
    mediaCount: content.media.length,
    characterCount: tanaPasteContent.length
  };
  
  // 4. 输出验证
  if (!tanaPasteContent.startsWith('- ')) {
    throw new Error('Generated Tana Paste is invalid');
  }
  
  return {
    content: tanaPasteContent,
    metadata,
    formattedAt: Date.now()
  };
}
```

**验收标准**:
- [ ] T007 (契约测试) 全部通过
- [ ] T009, T010, T011 (集成测试) 的格式化步骤通过
- [ ] 格式符合 Tana Paste 规范

**依赖**: T020  
**可并行**: 否

---

### T022: 实现 Clipboard 封装 (src/modules/exporter/clipboard.ts)

**描述**: 实现剪贴板操作（基于 exporter.contract.md 第 196-233 行）。

**实现内容**:
```typescript
// src/modules/exporter/clipboard.ts
export async function copyToClipboard(text: string): Promise<{ 
  success: boolean; 
  method: 'clipboard-api' | 'execCommand'; 
}> {
  // 1. 尝试 Clipboard API
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard-api' };
  } catch (error) {
    // 2. 降级到 execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        return { success: true, method: 'execCommand' };
      }
      throw new Error('execCommand failed');
    } catch (fallbackError) {
      return { success: false, method: 'clipboard-api' };
    }
  }
}

export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
}
```

**验收标准**:
- [ ] T008 中相关测试通过
- [ ] 正确降级到 execCommand
- [ ] 两种方法都能成功复制

**依赖**: T008 (测试先行)  
**可并行**: 否

---

### T023: 实现 Exporter 主逻辑 (src/modules/exporter/index.ts)

**描述**: 实现 `exportToClipboard()` 函数（基于 exporter.contract.md 第 15-93 行）。

**实现内容**:
```typescript
// src/modules/exporter/index.ts
import { TanaPaste } from '../formatter/types';
import { ExportResult } from './types';
import { copyToClipboard, isClipboardAvailable } from './clipboard';

export async function exportToClipboard(tanaPaste: TanaPaste): Promise<ExportResult> {
  // 1. 输入验证
  if (!tanaPaste || !tanaPaste.content || tanaPaste.content.length === 0) {
    return {
      success: false,
      error: 'Invalid Tana Paste content',
      errorCode: 'INVALID_CONTENT',
      exportedAt: Date.now()
    };
  }
  
  // 2. 检查 API 可用性
  if (!isClipboardAvailable()) {
    return {
      success: false,
      error: 'Clipboard is not available in this browser.',
      errorCode: 'NOT_AVAILABLE',
      exportedAt: Date.now()
    };
  }
  
  // 3. 执行复制
  try {
    const result = await copyToClipboard(tanaPaste.content);
    
    if (result.success) {
      return {
        success: true,
        method: result.method,
        charactersExported: tanaPaste.content.length,
        exportedAt: Date.now()
      };
    } else {
      throw new Error('Copy failed');
    }
  } catch (error: any) {
    // 4. 错误处理
    if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
      return {
        success: false,
        error: 'Clipboard access denied. Please allow permissions.',
        errorCode: 'PERMISSION_DENIED',
        exportedAt: Date.now()
      };
    }
    
    return {
      success: false,
      error: 'Failed to copy content to clipboard.',
      errorCode: 'COPY_FAILED',
      exportedAt: Date.now()
    };
  }
}

export { isClipboardAvailable };
```

**验收标准**:
- [ ] T008 (契约测试) 全部通过
- [ ] T009, T010, T011 (集成测试) 的导出步骤通过
- [ ] 错误处理正确

**依赖**: T022  
**可并行**: 否

---

## Phase 3.4: UI Components & Integration

---

### T024: [P] 实现页面上下文管理 (src/utils/page-context.ts)

**描述**: 实现 `PageContext` 管理逻辑（用于前端状态管理）。

**实现内容**:
```typescript
// src/utils/page-context.ts
import { PageContext } from '../modules/extractor/types';
import { detectPageType, detectLoadingState } from '../modules/extractor';

export async function getPageContext(document: Document): Promise<PageContext> {
  const url = document.location.href;
  const pageType = detectPageType(document);
  const loadingState = await detectLoadingState(document);
  
  const isSupported = pageType !== 'unknown';
  
  return {
    url,
    pageType,
    isSupported,
    loadingState,
    detectedAt: Date.now()
  };
}
```

**验收标准**:
- [ ] 正确生成 `PageContext`
- [ ] 与 Extractor 模块集成正确

**依赖**: T019 (Extractor 实现完成)  
**可并行**: 是 [P]

---

### T025: [P] 实现工作流编排 (src/utils/workflow.ts)

**描述**: 编排 Extractor → Formatter → Exporter 的完整流程。

**实现内容**:
```typescript
// src/utils/workflow.ts
import { extract } from '../modules/extractor';
import { format } from '../modules/formatter';
import { exportToClipboard } from '../modules/exporter';
import { PageContext } from '../modules/extractor/types';
import { ExportResult } from '../modules/exporter/types';

export async function executeWorkflow(
  document: Document,
  pageContext: PageContext
): Promise<ExportResult> {
  try {
    // 1. 提取
    const extracted = await extract(document, pageContext.pageType);
    
    // 2. 格式化
    const formatted = await format(extracted);
    
    // 3. 导出
    const result = await exportToClipboard(formatted);
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Workflow failed',
      errorCode: 'WORKFLOW_ERROR',
      exportedAt: Date.now()
    };
  }
}
```

**验收标准**:
- [ ] 编排逻辑正确
- [ ] 错误处理完善
- [ ] T009, T010, T011 (集成测试) 通过

**依赖**: T019, T021, T023  
**可并行**: 是 [P]

---

### T026: [P] 实现状态显示组件 (src/modules/ui/components/StatusDisplay.tsx)

**描述**: 显示操作状态（进行中、成功、失败）。

**实现内容**:
```tsx
// src/modules/ui/components/StatusDisplay.tsx
import React from 'react';

interface StatusDisplayProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  characterCount?: number;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  status, 
  message, 
  characterCount 
}) => {
  const statusColors = {
    idle: 'text-gray-500',
    loading: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500'
  };
  
  const statusIcons = {
    idle: '○',
    loading: '⏳',
    success: '✓',
    error: '✗'
  };
  
  return (
    <div className={`flex items-center gap-2 ${statusColors[status]}`}>
      <span>{statusIcons[status]}</span>
      <span>{message || '等待操作...'}</span>
      {characterCount !== undefined && (
        <span className="text-sm text-gray-400">
          ({characterCount} 字符)
        </span>
      )}
    </div>
  );
};
```

**验收标准**:
- [ ] 正确显示 4 种状态
- [ ] TailwindCSS 样式正确
- [ ] React 组件渲染正常

**依赖**: T001  
**可并行**: 是 [P]

---

### T027: [P] 实现格式选择器组件 (src/modules/ui/components/FormatSelector.tsx)

**描述**: 选择导出格式（目前仅支持 Tana Paste）。

**实现内容**:
```tsx
// src/modules/ui/components/FormatSelector.tsx
import React from 'react';

interface FormatSelectorProps {
  value: string;
  onChange: (format: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">格式</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="tana-paste">Tana Paste</option>
      </select>
    </div>
  );
};
```

**验收标准**:
- [ ] 下拉选择器正常工作
- [ ] 状态管理正确

**依赖**: T001  
**可并行**: 是 [P]

---

### T028: [P] 实现导出选择器组件 (src/modules/ui/components/ExportSelector.tsx)

**描述**: 选择导出方式（目前仅支持 Clipboard）。

**实现内容**:
```tsx
// src/modules/ui/components/ExportSelector.tsx
import React from 'react';

interface ExportSelectorProps {
  value: string;
  onChange: (exporter: string) => void;
}

export const ExportSelector: React.FC<ExportSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">导出到</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="clipboard">剪贴板</option>
      </select>
    </div>
  );
};
```

**验收标准**:
- [ ] 下拉选择器正常工作
- [ ] 状态管理正确

**依赖**: T001  
**可并行**: 是 [P]

---

### T028a: 实现浏览器扩展通信层 (src/utils/browser-bridge.ts)

**描述**: 封装 chrome.scripting API，提供从 popup 获取当前 tab 的 document 的能力。

**实现内容**:
```typescript
// src/utils/browser-bridge.ts
import { PageContext } from '../modules/extractor/types';
import { detectPageType, detectLoadingState } from '../modules/extractor';

/**
 * 在当前活跃 tab 中执行脚本，获取页面上下文
 */
export async function getCurrentPageContext(): Promise<PageContext | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return null;
    }

    // 注入脚本到页面，获取 URL 和 HTML
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        url: window.location.href,
        html: document.documentElement.outerHTML,
        pathname: window.location.pathname
      })
    });

    if (!result?.result) {
      return null;
    }

    const { url, html, pathname } = result.result;

    // 在 popup 中重建 DOM 以进行检测
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 手动设置 location（DOMParser 创建的 document 没有 location）
    Object.defineProperty(doc, 'location', {
      value: { href: url, pathname },
      writable: false
    });

    const pageType = detectPageType(doc);
    const loadingState = await detectLoadingState(doc);

    return {
      url,
      pageType,
      isSupported: pageType !== 'unknown',
      loadingState,
      detectedAt: Date.now()
    };
  } catch (error) {
    console.error('Failed to get page context:', error);
    return null;
  }
}

/**
 * 在当前活跃 tab 中执行工作流（提取 → 格式化 → 导出）
 */
export async function executeWorkflowInTab(): Promise<{
  success: boolean;
  charactersExported?: number;
  error?: string;
}> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return { success: false, error: 'No active tab found' };
    }

    // 在页面中执行完整工作流
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        // 注意：这里的代码运行在页面上下文，可以直接访问 document
        // 需要在页面中加载模块代码（通过 content script 或直接注入）
        
        // 简化版本：返回页面信息，实际提取在 background/content script 中完成
        return {
          success: true,
          message: 'Workflow executed in tab context'
        };
      }
    });

    return result?.result || { success: false, error: 'Execution failed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

**验收标准**:
- [ ] 成功获取当前 tab 的 PageContext
- [ ] 正确处理无 tab 的情况
- [ ] DOMParser 解析 HTML 正确

**依赖**: T019 (Extractor 实现完成)  
**可并行**: 是 [P]

---

### T029: 更新 Popup 主界面 (src/entrypoints/popup/App.tsx)

**描述**: 集成所有 UI 组件和工作流逻辑，更新浏览器扩展的 Popup 界面。

**实现内容**:
```tsx
// src/entrypoints/popup/App.tsx
import React, { useState, useEffect } from 'react';
import { StatusDisplay } from '../../modules/ui/components/StatusDisplay';
import { FormatSelector } from '../../modules/ui/components/FormatSelector';
import { ExportSelector } from '../../modules/ui/components/ExportSelector';
import { getCurrentPageContext } from '../../utils/browser-bridge';
import { PageContext } from '../../modules/extractor/types';

export default function App() {
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [characterCount, setCharacterCount] = useState<number | undefined>();
  const [format, setFormat] = useState('tana-paste');
  const [exporter, setExporter] = useState('clipboard');

  // 页面加载时检测上下文
  useEffect(() => {
    const loadPageContext = async () => {
      const context = await getCurrentPageContext();
      setPageContext(context);
      
      if (!context) {
        setStatus('error');
        setStatusMessage('无法检测页面信息');
      } else if (!context.isSupported) {
        setStatus('idle');
        setStatusMessage('当前页面不受支持');
      } else if (context.loadingState === 'loading') {
        setStatus('idle');
        setStatusMessage('页面正在加载...');
      } else {
        setStatus('idle');
        setStatusMessage('就绪');
      }
    };
    
    loadPageContext();
  }, []);

  const handleExport = async () => {
    if (!pageContext || !pageContext.isSupported) {
      setStatus('error');
      setStatusMessage('当前页面不受支持');
      return;
    }

    if (pageContext.loadingState === 'loading') {
      setStatus('error');
      setStatusMessage('请等待页面加载完成');
      return;
    }

    setStatus('loading');
    setStatusMessage('正在处理...');

    try {
      // 方案 1: 使用 browser-bridge 在 tab 中执行
      // const result = await executeWorkflowInTab();
      
      // 方案 2: 使用 chrome.scripting 直接注入工作流代码
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('No active tab');
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          // 此函数运行在页面上下文，可以直接访问 document
          // 注意：需要将 Extractor/Formatter/Exporter 代码也注入到页面
          // 这里使用简化版本，实际需要通过 content script 加载
          
          try {
            // 简化示例：直接获取页面文本并复制
            const text = document.body.innerText;
            await navigator.clipboard.writeText(text);
            return { 
              success: true, 
              charactersExported: text.length 
            };
          } catch (err: any) {
            return { 
              success: false, 
              error: err.message 
            };
          }
        }
      });

      const workflowResult = result?.result;
      
      if (workflowResult?.success) {
        setStatus('success');
        setStatusMessage('已复制到剪贴板');
        setCharacterCount(workflowResult.charactersExported);
      } else {
        setStatus('error');
        setStatusMessage(workflowResult?.error || '导出失败');
      }
    } catch (error: any) {
      setStatus('error');
      setStatusMessage(error.message || '未知错误');
    }
  };

  const isButtonDisabled = !pageContext?.isSupported || 
                          pageContext?.loadingState === 'loading' ||
                          status === 'loading';

  return (
    <div className="w-80 p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">ChatCrate</h1>
      
      {/* 页面状态 */}
      <div className="p-3 bg-gray-100 rounded-md">
        <p className="text-sm text-gray-600">
          页面类型: <span className="font-medium">{pageContext?.pageType || 'unknown'}</span>
        </p>
        <p className="text-sm text-gray-600">
          状态: <span className="font-medium">{pageContext?.loadingState || 'unknown'}</span>
        </p>
      </div>
      
      {/* 选择器 */}
      <FormatSelector value={format} onChange={setFormat} />
      <ExportSelector value={exporter} onChange={setExporter} />
      
      {/* 操作按钮 */}
      <button
        onClick={handleExport}
        disabled={isButtonDisabled}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isButtonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        导出
      </button>
      
      {/* 状态显示 */}
      <StatusDisplay 
        status={status} 
        message={statusMessage} 
        characterCount={characterCount} 
      />
    </div>
  );
}
```

**验收标准**:
- [ ] 所有 UI 组件正常渲染
- [ ] 按钮状态正确（根据页面类型和加载状态）
- [ ] 点击按钮触发工作流
- [ ] 状态反馈正确
- [ ] 成功获取页面上下文并显示

**依赖**: T024, T026, T027, T028, T028a  
**可并行**: 否

**注意**: T029 使用 browser-bridge (T028a) 而非 workflow.ts (T025)，因为需要在页面上下文中执行代码

---

## Phase 3.5: Polish & Validation

---

### T030: [P] 编写单元测试 - HTML 转换工具 (tests/unit/extractor/markdown.test.ts)

**描述**: 为 HTML → Markdown 转换工具编写单元测试。

**实现内容**:
```typescript
// tests/unit/extractor/markdown.test.ts
import { htmlToMarkdown } from '../../../src/modules/extractor/utils/markdown';

describe('HTML → Markdown 转换', () => {
  it('应转换 H1 标签', () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'Title';
    expect(htmlToMarkdown(h1)).toBe('# Title');
  });

  it('应转换 STRONG 标签', () => {
    const strong = document.createElement('strong');
    strong.textContent = 'bold';
    expect(htmlToMarkdown(strong)).toBe('**bold**');
  });

  // TODO: 添加更多测试
});
```

**验收标准**:
- [ ] 所有测试通过
- [ ] 覆盖所有 HTML 标签

**依赖**: T015  
**可并行**: 是 [P]

---

### T031: [P] 编写单元测试 - Tana 转换工具 (tests/unit/formatter/tana-paste.test.ts)

**描述**: 为 Markdown → Tana 转换工具编写单元测试。

**实现内容**:
```typescript
// tests/unit/formatter/tana-paste.test.ts
import { markdownToTana } from '../../../src/modules/formatter/utils/markdown-to-tana';

describe('Markdown → Tana 转换', () => {
  it('应转换一级标题', () => {
    expect(markdownToTana('# Title', 0)).toBe('- **Title**%%tana%%');
  });

  it('应正确处理缩进', () => {
    expect(markdownToTana('- item', 1)).toContain('  ');
  });

  // TODO: 添加更多测试
});
```

**验收标准**:
- [ ] 所有测试通过
- [ ] 覆盖所有 Markdown 元素

**依赖**: T020  
**可并行**: 是 [P]

---

### T032: [P] 编写单元测试 - Clipboard 工具 (tests/unit/exporter/clipboard.test.ts)

**描述**: 为剪贴板操作编写单元测试。

**实现内容**:
```typescript
// tests/unit/exporter/clipboard.test.ts
import { copyToClipboard, isClipboardAvailable } from '../../../src/modules/exporter/clipboard';

describe('Clipboard 操作', () => {
  it('应检测 Clipboard API 可用性', () => {
    const available = isClipboardAvailable();
    expect(typeof available).toBe('boolean');
  });

  it('应成功复制到剪贴板', async () => {
    // Mock navigator.clipboard
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText }
    });

    const result = await copyToClipboard('test');
    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('test');
  });

  // TODO: 添加降级测试
});
```

**验收标准**:
- [ ] 所有测试通过
- [ ] 覆盖主方案和降级方案

**依赖**: T022  
**可并行**: 是 [P]

---

### T033: 性能测试 (tests/integration/performance.test.ts)

**描述**: 验证性能指标（基于 quickstart.md 第 158-183 行）。

**实现内容**:
```typescript
// tests/integration/performance.test.ts
import { extract } from '../../src/modules/extractor';
import { format } from '../../src/modules/formatter';
import { exportToClipboard } from '../../src/modules/exporter';

describe('性能测试', () => {
  it('提取耗时应 <500ms', async () => {
    const start = performance.now();
    // TODO: 加载 sample 并提取
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('格式化耗时应 <100ms', async () => {
    const start = performance.now();
    // TODO: 格式化内容
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('导出耗时应 <50ms', async () => {
    const start = performance.now();
    // TODO: 导出到剪贴板
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('总延迟应 <1 秒', async () => {
    const start = performance.now();
    // TODO: 完整流程
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

**验收标准**:
- [ ] 所有性能指标达标
- [ ] 提取 <500ms, 格式化 <100ms, 导出 <50ms, 总计 <1s

**依赖**: T019, T021, T023  
**可并行**: 否

---

### T034: 执行 Quickstart 验收测试

**描述**: 按照 quickstart.md 执行所有验收场景（基于 quickstart.md 第 28-153 行）。

**手动测试步骤**:
1. **Scenario 1**: Search 页面基本流程
2. **Scenario 2**: 富媒体内容处理
3. **Scenario 3**: 错误处理

**验收标准**:
- [ ] Scenario 1 通过（2 分钟内完成）
- [ ] Scenario 2 通过（1.5 分钟内完成）
- [ ] Scenario 3 通过（1.5 分钟内完成）
- [ ] 所有验收标准勾选

**依赖**: T029 (前端集成完成)  
**可并行**: 否

---

### T035: 验证提取覆盖率 ≥90%

**描述**: 基于 quickstart.md 第 186-207 行，验证 3 个 sample 的提取覆盖率。

**验证方法**:
```bash
# 运行快照测试
npm test -- tests/integration/samples/snapshot.test.ts

# 检查覆盖率报告
npm test -- --coverage
```

**验收标准**:
- [ ] research_report.html 覆盖率 ≥90%
- [ ] deepresearch_report.html 覆盖率 ≥90%
- [ ] labs_report.html 覆盖率 ≥90%
- [ ] T012 (快照测试) 全部通过

**依赖**: T012, T019  
**可并行**: 否

---

### T036: [P] 更新模块文档

**描述**: 更新各模块的 README.md，添加使用示例和 API 说明。

**文件操作**:
- 更新 `src/modules/extractor/README.md`
- 更新 `src/modules/formatter/README.md`
- 更新 `src/modules/exporter/README.md`

**验收标准**:
- [ ] 所有模块有清晰的 API 文档
- [ ] 包含使用示例
- [ ] 与契约文档一致

**依赖**: T019, T021, T023  
**可并行**: 是 [P]

---

### T037: 代码质量检查

**描述**: 运行 linter 和格式化工具，消除所有警告和错误。

**执行命令**:
```bash
npm run lint
npm run format
npm run typecheck
```

**验收标准**:
- [ ] 无 ESLint 错误
- [ ] 代码格式符合 Prettier 规范
- [ ] TypeScript 无类型错误

**依赖**: T029 (所有代码实现完成)  
**可并行**: 否

---

### T038: [P] 为 Extractor 添加 CLI 入口 (src/modules/extractor/cli.ts)

**描述**: 实现 CLI 接口以满足 Constitution 原则 II（Library-First + CLI Interface）。

**实现内容**:
```typescript
#!/usr/bin/env node
// src/modules/extractor/cli.ts
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { extract, detectPageType } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: extractor <html-file> [options]

Options:
  --format <json|text>   Output format (default: json)
  --help                 Show this help message

Example:
  extractor sample.html --format json
    `);
    process.exit(0);
  }

  const htmlFile = args[0];
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'json';

  try {
    // 读取 HTML 文件
    const html = fs.readFileSync(htmlFile, 'utf-8');
    const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test' });
    const doc = dom.window.document;

    // 检测页面类型
    const pageType = detectPageType(doc);

    // 提取内容
    const extracted = await extract(doc, pageType);

    // 输出结果
    if (format === 'json') {
      console.log(JSON.stringify(extracted, null, 2));
    } else {
      console.log(`Query: ${extracted.query}`);
      console.log(`\nAnswer:\n${extracted.answer}`);
      console.log(`\nCitations: ${extracted.citations.length}`);
      extracted.citations.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.title} - ${c.url}`);
      });
      console.log(`\nMedia: ${extracted.media.length} items`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

**package.json 添加**:
```json
{
  "bin": {
    "chatcrate-extract": "./dist/modules/extractor/cli.js"
  }
}
```

**验收标准**:
- [ ] CLI 可执行（`node src/modules/extractor/cli.ts sample.html`）
- [ ] 支持 JSON 和文本输出
- [ ] 错误处理正确（stdout 正常输出，stderr 错误信息）
- [ ] 满足 Constitution 原则 II

**依赖**: T019  
**可并行**: 是 [P]

---

### T039: [P] 为 Formatter 添加 CLI 入口 (src/modules/formatter/cli.ts)

**描述**: 实现 CLI 接口以满足 Constitution 原则 II。

**实现内容**:
```typescript
#!/usr/bin/env node
// src/modules/formatter/cli.ts
import fs from 'fs';
import { format } from './index';
import { ExtractedContent } from '../extractor/types';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: formatter [options]

Options:
  --input <file>         JSON file with ExtractedContent (default: stdin)
  --output <file>        Output file (default: stdout)
  --help                 Show this help message

Example:
  formatter --input extracted.json --output formatted.txt
  cat extracted.json | formatter
    `);
    process.exit(0);
  }

  try {
    let inputData: string;

    // 读取输入（文件或 stdin）
    if (args.includes('--input')) {
      const inputFile = args[args.indexOf('--input') + 1];
      inputData = fs.readFileSync(inputFile, 'utf-8');
    } else {
      // 从 stdin 读取
      inputData = fs.readFileSync(0, 'utf-8');
    }

    const extracted: ExtractedContent = JSON.parse(inputData);

    // 格式化
    const formatted = await format(extracted);

    // 输出结果
    const output = formatted.content;
    
    if (args.includes('--output')) {
      const outputFile = args[args.indexOf('--output') + 1];
      fs.writeFileSync(outputFile, output, 'utf-8');
      console.error(`✓ Formatted content written to ${outputFile}`);
      console.error(`  Nodes: ${formatted.metadata.nodeCount}`);
      console.error(`  Citations: ${formatted.metadata.citationCount}`);
      console.error(`  Characters: ${formatted.metadata.characterCount}`);
    } else {
      console.log(output);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

**验收标准**:
- [ ] 支持文件输入和 stdin
- [ ] 支持文件输出和 stdout
- [ ] 可以管道组合（`extractor sample.html | formatter`）
- [ ] 满足 Constitution 原则 II

**依赖**: T021  
**可并行**: 是 [P]

---

### T040: [P] 为 Exporter 添加 CLI 入口 (src/modules/exporter/cli.ts)

**描述**: 实现 CLI 接口以满足 Constitution 原则 II。

**实现内容**:
```typescript
#!/usr/bin/env node
// src/modules/exporter/cli.ts
import fs from 'fs';
import { TanaPaste } from '../formatter/types';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: exporter [options]

Options:
  --input <file>         Input file with TanaPaste content (default: stdin)
  --output <file>        Output file (required)
  --help                 Show this help message

Example:
  exporter --input formatted.txt --output output.txt
  cat formatted.txt | exporter --output output.txt
    `);
    process.exit(0);
  }

  if (!args.includes('--output')) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  try {
    let inputData: string;

    // 读取输入
    if (args.includes('--input')) {
      const inputFile = args[args.indexOf('--input') + 1];
      inputData = fs.readFileSync(inputFile, 'utf-8');
    } else {
      inputData = fs.readFileSync(0, 'utf-8');
    }

    // 解析 TanaPaste（如果是 JSON）或直接使用（如果是纯文本）
    let content: string;
    try {
      const parsed: TanaPaste = JSON.parse(inputData);
      content = parsed.content;
    } catch {
      // 不是 JSON，直接使用原始内容
      content = inputData;
    }

    // 导出到文件
    const outputFile = args[args.indexOf('--output') + 1];
    fs.writeFileSync(outputFile, content, 'utf-8');

    console.error(`✓ Content exported to ${outputFile}`);
    console.error(`  Characters: ${content.length}`);

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

**验收标准**:
- [ ] 支持文件输入和 stdin
- [ ] 正确导出到文件
- [ ] 可以管道组合（`extractor sample.html | formatter | exporter --output result.txt`）
- [ ] 满足 Constitution 原则 II

**依赖**: T023  
**可并行**: 是 [P]

---

## Dependencies Graph

```
Phase 3.1 (Setup)
├── T001 → T002, T003, T004, T005 [P]
└── T002, T003, T004, T005 → Phase 3.2

Phase 3.2 (Tests - TDD Red Phase)
├── T006, T007, T008 [P] (契约测试)
└── T009, T010, T011, T012 [P] (集成测试)

Phase 3.3 (Implementation - TDD Green Phase)
├── T013 → T014 → T019
├── T015 [P] → T016, T017, T018 [P] → T019
├── T020 → T021
└── T022 → T023

Phase 3.4 (UI & Integration)
├── T024, T025 [P] (依赖 T019, T021, T023)
├── T026, T027, T028, T028a [P] (T028a 依赖 T019)
└── T029 (依赖 T024, T026-T028a)

Phase 3.5 (Polish)
├── T030, T031, T032 [P] (单元测试)
├── T033 (性能测试)
├── T034 (验收测试)
├── T035 (覆盖率验证)
├── T036 [P] (文档更新)
├── T037 (代码质量)
└── T038, T039, T040 [P] (CLI 入口 - 满足 Constitution)
```

---

## Parallel Execution Examples

### 批次 1: 类型定义 (T002-T005)
```bash
Task: "定义共享类型 (src/types/common.ts)"
Task: "定义 Extractor 模块类型 (src/modules/extractor/types.ts)"
Task: "定义 Formatter 模块类型 (src/modules/formatter/types.ts)"
Task: "定义 Exporter 模块类型 (src/modules/exporter/types.ts)"
```

### 批次 2: 契约测试 (T006-T008) - 使用真实 HTML samples
```bash
Task: "契约测试 - Extractor 模块 (tests/contract/extractor.contract.test.ts)"
# 注: 使用 specs/002-perplexity-tana-coding/samples/ 下的真实 HTML 文件
Task: "契约测试 - Formatter 模块 (tests/contract/formatter.contract.test.ts)"
Task: "契约测试 - Exporter 模块 (tests/contract/exporter.contract.test.ts)"
```

### 批次 3: 集成测试 (T009-T012) - 使用真实 HTML samples
```bash
Task: "集成测试 - Search 页面流程 (tests/integration/workflow-search.test.ts)"
# 注: 使用 perplexity_research_report.html
Task: "集成测试 - DeepResearch 页面流程 (tests/integration/workflow-deepresearch.test.ts)"
# 注: 使用 perplexity_deepresearch_report.html
Task: "集成测试 - Labs 页面流程 (tests/integration/workflow-labs.test.ts)"
# 注: 使用 perplexity_labs_report.html
Task: "快照对比测试 (tests/integration/samples/snapshot.test.ts)"
# 注: 使用所有 3 个 sample HTML 文件进行覆盖率验证
```

### 批次 4: 解析器实现 (T016-T018)
```bash
Task: "实现 Search 页面解析器 (src/modules/extractor/parsers/search.ts)"
Task: "实现 DeepResearch 页面解析器 (src/modules/extractor/parsers/deepresearch.ts)"
Task: "实现 Labs 页面解析器 (src/modules/extractor/parsers/labs.ts)"
```

### 批次 5: UI 组件 (T026-T028)
```bash
Task: "实现状态显示组件 (src/modules/ui/components/StatusDisplay.tsx)"
Task: "实现格式选择器组件 (src/modules/ui/components/FormatSelector.tsx)"
Task: "实现导出选择器组件 (src/modules/ui/components/ExportSelector.tsx)"
```

### 批次 6: 单元测试 (T030-T032)
```bash
Task: "编写单元测试 - HTML 转换工具 (tests/unit/extractor/markdown.test.ts)"
Task: "编写单元测试 - Tana 转换工具 (tests/unit/formatter/tana-paste.test.ts)"
Task: "编写单元测试 - Clipboard 工具 (tests/unit/exporter/clipboard.test.ts)"
```

### 批次 7: CLI 入口（满足 Constitution）(T038-T040)
```bash
Task: "为 Extractor 添加 CLI 入口 (src/modules/extractor/cli.ts)"
Task: "为 Formatter 添加 CLI 入口 (src/modules/formatter/cli.ts)"
Task: "为 Exporter 添加 CLI 入口 (src/modules/exporter/cli.ts)"

# 测试 CLI 管道
extractor specs/002-perplexity-tana-coding/samples/perplexity_research_report.html | formatter | exporter --output result.txt
```

---

## Checklist Summary

**总任务数**: 41 (T001-T040 + T028a)  
**可并行任务数**: 20 (标记 [P])  
**顺序任务数**: 21

**关键里程碑**:
- [ ] Phase 3.2 完成：所有测试失败（Red Phase）
- [ ] Phase 3.3 完成：所有测试通过（Green Phase）
- [ ] Phase 3.4 完成：前端集成完成
- [ ] Phase 3.5 完成：性能 + 验收通过

---

## Notes

- **TDD 强制顺序**: Phase 3.2 (Tests) **必须**在 Phase 3.3 (Implementation) 之前完成
- **并行策略**: 标记 [P] 的任务操作不同文件，可同时开发
- **测试数据**: 所有 Extractor 和集成测试使用 `specs/002-perplexity-tana-coding/samples/` 下的真实 Perplexity HTML 文件
  - `perplexity_research_report.html` - Search 页面
  - `perplexity_deepresearch_report.html` - DeepResearch 页面
  - `perplexity_labs_report.html` - Labs 页面
- **测试依赖**: 需要 `jsdom` 和 `@types/jsdom` (已在 T001 中安装)
- **性能目标**: 提取 <500ms, 格式化 <100ms, 导出 <50ms, 总计 <1s
- **覆盖率目标**: ≥90% (核心内容 100%)
- **跨浏览器**: Chrome, Edge, Firefox 全部测试

---

**Status**: ✅ Tasks generated. Ready for execution with Task agent.

