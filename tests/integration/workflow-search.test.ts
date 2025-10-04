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
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

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
    expect(formatted.content).toMatch(/^- /);
    
    // 4. 调用 exportToClipboard()
    const result = await exportToClipboard(formatted);
    
    // 5. 验证整个流程成功
    expect(result.success).toBe(true);
    expect(result.charactersExported).toBeGreaterThan(0);
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

