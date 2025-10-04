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
  if (markdown.startsWith('### ')) {
    return `${indent}    - **${markdown.slice(4)}**%%tana%%`;
  }
  
  // 处理列表项
  if (markdown.startsWith('- ')) {
    return `${indent}  - ${markdown.slice(2)}`;
  }
  
  // 处理加粗
  if (markdown.includes('**')) {
    // 保持 Markdown 加粗语法
    return `${indent}- ${markdown}`;
  }
  
  // 处理链接
  if (markdown.includes('[') && markdown.includes('](')) {
    // 保持 Markdown 链接语法
    return `${indent}- ${markdown}`;
  }
  
  // 处理图片
  if (markdown.startsWith('![')) {
    // 保持 Markdown 图片语法
    return `${indent}- ${markdown}`;
  }
  
  // 处理代码块
  if (markdown.startsWith('```')) {
    // 保持 Markdown 代码块语法
    return `${indent}- ${markdown}`;
  }
  
  // 其他元素保持 Markdown 语法
  return `${indent}- ${markdown}`;
}

