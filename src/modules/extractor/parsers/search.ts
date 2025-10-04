// src/modules/extractor/parsers/search.ts
import { ExtractedContent, MediaContent } from '../types';
import { htmlToMarkdown, convertTableToMarkdown } from '../utils/markdown';
import { PageType, MediaType } from '../../../types/common';

export function parseSearch(document: Document): Partial<ExtractedContent> {
  // 1. 提取问题
  let query = '';
  
  // 尝试多种方式获取查询
  const queryElement = document.querySelector('[data-testid="query-text"]') || 
                       document.querySelector('h1:first-of-type');
  query = queryElement?.textContent?.trim() || '';
  
  // 如果第一个 h1 为空，尝试下一个 h1
  if (!query || query.length === 0) {
    const allH1 = document.querySelectorAll('h1');
    for (const h1 of Array.from(allH1)) {
      const text = h1.textContent?.trim();
      if (text && text.length > 3 && text.length < 200) {
        query = text;
        break;
      }
    }
  }
  
  // 最后尝试 document.title
  if (!query || query.length === 0) {
    query = document.title || '';
  }

  // 2. 提取回答
  let answer = '';
  const answerElement = document.querySelector('[data-testid="answer-content"]') ||
                       document.querySelector('main article') ||
                       document.querySelector('article') ||
                       document.querySelector('main');
  
  if (answerElement) {
    answer = htmlToMarkdown(answerElement as HTMLElement);
  }
  
  // 如果仍然没有答案，提取所有 p 标签
  if (!answer || answer.trim().length < 10) {
    const paragraphs = document.querySelectorAll('p');
    const texts = Array.from(paragraphs)
      .map(p => p.textContent?.trim())
      .filter(t => t && t.length > 20)
      .join('\n\n');
    answer = texts || '';
  }

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
    pageType: PageType.SEARCH,
    query,
    answer,
    citations: citations.slice(0, 50), // 限制最多50条（契约要求）
    media,
    extractedAt: Date.now()
  };
}

