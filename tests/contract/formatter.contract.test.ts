// tests/contract/formatter.contract.test.ts
import { format } from '../../src/modules/formatter';
import { ExtractedContent } from '../../src/modules/extractor/types';
import { TanaPaste } from '../../src/modules/formatter/types';
import { PageType, MediaType } from '../../src/types/common';

describe('Formatter Contract Tests', () => {
  describe('format()', () => {
    const validInput: ExtractedContent = {
      pageType: PageType.SEARCH,
      query: 'Test query',
      answer: 'This is a test answer with more than 10 characters.',
      citations: [
        { title: 'Citation 1', url: 'https://example.com/1' },
        { title: 'Citation 2', url: 'https://example.com/2' }
      ],
      media: [
        { type: MediaType.IMAGE, markdown: '![test](https://example.com/img.png)' }
      ],
      extractedAt: Date.now()
    };

    it('应返回有效的 TanaPaste 结构', async () => {
      const result = await format(validInput);
      
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.nodeCount).toBeGreaterThan(0);
      expect(result.metadata.citationCount).toBe(2);
      expect(result.metadata.mediaCount).toBe(1);
      expect(result.metadata.characterCount).toBeGreaterThan(0);
      expect(result.formattedAt).toBeGreaterThan(0);
    });

    it('应拒绝无效的 ExtractedContent（query 为空）', async () => {
      const invalidInput = { ...validInput, query: '' };
      await expect(format(invalidInput)).rejects.toThrow();
    });

    it('应拒绝无效的 ExtractedContent（answer <10 字符）', async () => {
      const invalidInput = { ...validInput, answer: 'short' };
      await expect(format(invalidInput)).rejects.toThrow();
    });

    it('应生成正确的 Tana Paste 格式（以 - 开头，缩进为 2 的倍数）', async () => {
      const result = await format(validInput);
      
      expect(result.content).toMatch(/^- /); // 以 - 开头
      const lines = result.content.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const indentMatch = line.match(/^( *)-/);
          if (indentMatch) {
            const indent = indentMatch[1].length;
            expect(indent % 2).toBe(0); // 缩进为 2 的倍数
          }
        }
      });
    });

    it('应正确统计 metadata（nodeCount, citationCount, mediaCount）', async () => {
      const result = await format(validInput);
      
      expect(result.metadata.citationCount).toBe(validInput.citations.length);
      expect(result.metadata.mediaCount).toBe(validInput.media.length);
      expect(result.metadata.nodeCount).toBeGreaterThan(0);
      expect(result.metadata.characterCount).toBe(result.content.length);
    });

    it('应处理包含引用的内容', async () => {
      const result = await format(validInput);
      
      expect(result.content).toContain('Citations');
      expect(result.content).toContain(validInput.citations[0].title);
      expect(result.content).toContain(validInput.citations[0].url);
    });

    it('应处理包含富媒体的内容', async () => {
      const result = await format(validInput);
      
      expect(result.content).toContain('Media');
      expect(result.content).toContain(validInput.media[0].markdown);
    });
  });
});

