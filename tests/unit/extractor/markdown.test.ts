// tests/unit/extractor/markdown.test.ts
import { htmlToMarkdown, convertTableToMarkdown } from '../../../src/modules/extractor/utils/markdown';
import { JSDOM } from 'jsdom';

const createElementFromHTML = (html: string): HTMLElement => {
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  return dom.window.document.body.firstElementChild as HTMLElement;
};

describe('HTML → Markdown 转换', () => {
  it('应转换 H1 标签', () => {
    const h1 = createElementFromHTML('<h1>Title</h1>');
    expect(htmlToMarkdown(h1)).toBe('# Title');
  });

  it('应转换 H2 标签', () => {
    const h2 = createElementFromHTML('<h2>Subtitle</h2>');
    expect(htmlToMarkdown(h2)).toBe('## Subtitle');
  });

  it('应转换 H3 标签', () => {
    const h3 = createElementFromHTML('<h3>Section</h3>');
    expect(htmlToMarkdown(h3)).toBe('### Section');
  });

  it('应转换 STRONG 标签', () => {
    const strong = createElementFromHTML('<strong>bold</strong>');
    expect(htmlToMarkdown(strong)).toBe('**bold**');
  });

  it('应转换 B 标签', () => {
    const b = createElementFromHTML('<b>bold text</b>');
    expect(htmlToMarkdown(b)).toBe('**bold text**');
  });

  it('应转换 EM 标签', () => {
    const em = createElementFromHTML('<em>italic</em>');
    expect(htmlToMarkdown(em)).toBe('*italic*');
  });

  it('应转换 I 标签', () => {
    const i = createElementFromHTML('<i>italic text</i>');
    expect(htmlToMarkdown(i)).toBe('*italic text*');
  });

  it('应转换 IMG 标签', () => {
    const img = createElementFromHTML('<img src="https://example.com/img.png" alt="test image" />');
    expect(htmlToMarkdown(img)).toBe('![test image](https://example.com/img.png)');
  });

  it('应转换 A 标签', () => {
    const a = createElementFromHTML('<a href="https://example.com">link text</a>');
    expect(htmlToMarkdown(a)).toBe('[link text](https://example.com)');
  });

  it('应转换 PRE 标签', () => {
    const pre = createElementFromHTML('<pre>code block</pre>');
    expect(htmlToMarkdown(pre)).toContain('```');
    expect(htmlToMarkdown(pre)).toContain('code block');
  });

  it('应转换 CODE 标签', () => {
    const code = createElementFromHTML('<code>inline code</code>');
    expect(htmlToMarkdown(code)).toContain('```');
  });

  it('应转换 UL 列表', () => {
    const ul = createElementFromHTML('<ul><li>Item 1</li><li>Item 2</li></ul>');
    const result = htmlToMarkdown(ul);
    expect(result).toContain('- Item 1');
    expect(result).toContain('- Item 2');
  });

  it('应转换 OL 列表', () => {
    const ol = createElementFromHTML('<ol><li>First</li><li>Second</li></ol>');
    const result = htmlToMarkdown(ol);
    expect(result).toContain('- First');
    expect(result).toContain('- Second');
  });
});

describe('convertTableToMarkdown', () => {
  it('应转换简单表格', () => {
    const dom = new JSDOM(`
      <table>
        <tr><th>Header 1</th><th>Header 2</th></tr>
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      </table>
    `);
    const table = dom.window.document.querySelector('table') as HTMLTableElement;
    const result = convertTableToMarkdown(table);
    
    expect(result).toContain('| Header 1 | Header 2 |');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('| Cell 1 | Cell 2 |');
  });

  it('应处理空表格', () => {
    const dom = new JSDOM('<table></table>');
    const table = dom.window.document.querySelector('table') as HTMLTableElement;
    const result = convertTableToMarkdown(table);
    
    expect(result).toBe('');
  });
});

