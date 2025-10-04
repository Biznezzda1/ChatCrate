// src/modules/extractor/utils/markdown.ts
export function htmlToMarkdown(element: HTMLElement): string {
  if (!element) return '';
  
  // 处理不同的 HTML 标签
  const tagName = element.tagName?.toUpperCase();
  
  switch (tagName) {
    case 'H1':
      return `# ${element.textContent || ''}`;
    case 'H2':
      return `## ${element.textContent || ''}`;
    case 'H3':
      return `### ${element.textContent || ''}`;
    case 'H4':
      return `#### ${element.textContent || ''}`;
    case 'STRONG':
    case 'B':
      return `**${element.textContent || ''}**`;
    case 'EM':
    case 'I':
      return `*${element.textContent || ''}*`;
    case 'IMG': {
      const alt = element.getAttribute('alt') || '';
      const src = element.getAttribute('src') || '';
      return `![${alt}](${src})`;
    }
    case 'PRE':
    case 'CODE':
      return `\`\`\`\n${element.textContent || ''}\n\`\`\``;
    case 'A': {
      const href = element.getAttribute('href') || '';
      const text = element.textContent || '';
      return `[${text}](${href})`;
    }
    case 'UL':
    case 'OL': {
      const items = Array.from(element.querySelectorAll('li'));
      return items.map(item => `- ${item.textContent || ''}`).join('\n');
    }
    case 'LI':
      return `- ${element.textContent || ''}`;
    case 'P':
    case 'DIV':
    case 'SPAN':
      // 递归处理子元素
      return processChildren(element);
    default:
      return element.textContent || '';
  }
}

function processChildren(element: HTMLElement): string {
  const parts: string[] = [];
  
  element.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const html = htmlToMarkdown(node as HTMLElement);
      if (html) parts.push(html);
    }
  });
  
  return parts.join(' ');
}

export function convertTableToMarkdown(table: HTMLTableElement): string {
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

