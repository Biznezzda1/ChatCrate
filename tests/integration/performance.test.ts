// tests/integration/performance.test.ts
import { extract } from '../../src/modules/extractor';
import { format } from '../../src/modules/formatter';
import { exportToClipboard } from '../../src/modules/exporter';
import { PageType } from '../../src/types/common';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const loadSample = (): Document => {
  const htmlPath = path.join(__dirname, '../../specs/002-perplexity-tana-coding/samples/perplexity_deepresearch_report.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://www.perplexity.ai/search/test-id' });
  return dom.window.document;
};

describe('性能测试', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('提取耗时应 <500ms', async () => {
    const doc = loadSample();
    const start = performance.now();
    
    await extract(doc, PageType.DEEP_RESEARCH);
    
    const duration = performance.now() - start;
    console.log(`提取耗时: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('格式化耗时应 <100ms', async () => {
    const doc = loadSample();
    const extracted = await extract(doc, PageType.DEEP_RESEARCH);
    
    const start = performance.now();
    await format(extracted);
    
    const duration = performance.now() - start;
    console.log(`格式化耗时: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  it('导出耗时应 <50ms', async () => {
    const doc = loadSample();
    const extracted = await extract(doc, PageType.DEEP_RESEARCH);
    const formatted = await format(extracted);
    
    const start = performance.now();
    await exportToClipboard(formatted);
    
    const duration = performance.now() - start;
    console.log(`导出耗时: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it('总延迟应 <1 秒', async () => {
    const doc = loadSample();
    const start = performance.now();
    
    const extracted = await extract(doc, PageType.DEEP_RESEARCH);
    const formatted = await format(extracted);
    await exportToClipboard(formatted);
    
    const duration = performance.now() - start;
    console.log(`总耗时: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000);
  });
});

