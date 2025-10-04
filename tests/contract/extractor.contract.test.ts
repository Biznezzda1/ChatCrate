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
      const result = await extract(doc, PageType.SEARCH);
      
      expect(result).toBeDefined();
      expect(result.pageType).toBe(PageType.SEARCH);
      expect(result.query).toBeTruthy();
      expect(result.answer).toBeTruthy();
      expect(result.citations).toBeInstanceOf(Array);
      expect(result.media).toBeInstanceOf(Array);
      expect(result.extractedAt).toBeGreaterThan(0);
    });

    it('应从 DeepResearch 页面返回有效的 ExtractedContent 结构', async () => {
      const doc = loadSample('perplexity_deepresearch_report.html');
      const result = await extract(doc, PageType.DEEP_RESEARCH);
      
      expect(result).toBeDefined();
      expect(result.pageType).toBe(PageType.DEEP_RESEARCH);
      expect(result.query).toBeTruthy();
      expect(result.answer).toBeTruthy();
    });

    it('应从 Labs 页面返回有效的 ExtractedContent 结构', async () => {
      const doc = loadSample('perplexity_labs_report.html');
      const result = await extract(doc, PageType.LABS);
      
      expect(result).toBeDefined();
      expect(result.pageType).toBe(PageType.LABS);
      expect(result.query).toBeTruthy();
      expect(result.answer).toBeTruthy();
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

