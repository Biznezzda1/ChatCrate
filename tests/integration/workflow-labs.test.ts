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
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('应成功从 Labs 页面提取 → 格式化 → 导出', async () => {
    const doc = loadLabsSample();
    
    const extracted = await extract(doc, PageType.LABS);
    expect(extracted).toBeDefined();
    expect(extracted.query).toBeTruthy();
    expect(extracted.answer).toBeTruthy();
    
    const formatted = await format(extracted);
    expect(formatted).toBeDefined();
    expect(formatted.content).toMatch(/^- /);
    
    const result = await exportToClipboard(formatted);
    expect(result.success).toBe(true);
  });
});

