// tests/unit/formatter/tana-paste.test.ts
import { markdownToTana } from '../../../src/modules/formatter/utils/markdown-to-tana';

describe('Markdown → Tana 转换', () => {
  it('应转换一级标题', () => {
    const result = markdownToTana('# Title', 0);
    expect(result).toBe('- **Title**%%tana%%');
  });

  it('应转换二级标题', () => {
    const result = markdownToTana('## Subtitle', 0);
    expect(result).toBe('  - **Subtitle**%%tana%%');
  });

  it('应转换三级标题', () => {
    const result = markdownToTana('### Section', 0);
    expect(result).toBe('    - **Section**%%tana%%');
  });

  it('应正确处理缩进（level 0）', () => {
    const result = markdownToTana('- item', 0);
    expect(result).toBe('  - item');
    expect(result.startsWith('  ')).toBe(true);
  });

  it('应正确处理缩进（level 1）', () => {
    const result = markdownToTana('- item', 1);
    expect(result).toBe('    - item');
    expect(result.startsWith('    ')).toBe(true);
  });

  it('应正确处理缩进（level 2）', () => {
    const result = markdownToTana('- item', 2);
    expect(result).toBe('      - item');
    expect(result.startsWith('      ')).toBe(true);
  });

  it('应保留加粗语法', () => {
    const result = markdownToTana('**bold text**', 0);
    expect(result).toContain('**bold text**');
  });

  it('应保留链接语法', () => {
    const result = markdownToTana('[link](https://example.com)', 0);
    expect(result).toContain('[link](https://example.com)');
  });

  it('应保留图片语法', () => {
    const result = markdownToTana('![alt](https://example.com/img.png)', 0);
    expect(result).toContain('![alt](https://example.com/img.png)');
  });

  it('应保留代码块语法', () => {
    const result = markdownToTana('```javascript\ncode\n```', 0);
    expect(result).toContain('```');
  });

  it('应处理普通文本', () => {
    const result = markdownToTana('Normal text', 0);
    expect(result).toBe('- Normal text');
  });
});

