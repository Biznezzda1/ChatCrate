// src/modules/formatter/index.ts
import { ExtractedContent } from '../extractor/types';
import { TanaPaste, PasteMetadata } from './types';
import { markdownToTana } from './utils/markdown-to-tana';

export async function format(content: ExtractedContent): Promise<TanaPaste> {
  // 1. 输入验证
  if (!content || !content.query || content.answer.length < 10) {
    throw new Error('Invalid extracted content');
  }

  // 2. 格式化为 Tana Paste
  const lines: string[] = [];
  
  // Query 节点
  lines.push(`- **Query**: ${content.query}`);
  
  // Answer 节点
  lines.push('  - **Answer**');
  const answerParagraphs = content.answer.split('\n\n').filter(Boolean);
  answerParagraphs.forEach(para => {
    lines.push(`    - ${para}`);
  });
  
  // Citations 节点
  if (content.citations.length > 0) {
    lines.push('  - **Citations**');
    content.citations.forEach(citation => {
      lines.push(`    - [${citation.title}](${citation.url})`);
    });
  }
  
  // Media 节点
  if (content.media.length > 0) {
    lines.push('  - **Media**');
    content.media.forEach(media => {
      lines.push(`    - ${media.markdown}`);
    });
  }
  
  const tanaPasteContent = lines.join('\n');
  
  // 3. 计算元数据
  const metadata: PasteMetadata = {
    nodeCount: lines.length,
    citationCount: content.citations.length,
    mediaCount: content.media.length,
    characterCount: tanaPasteContent.length
  };
  
  // 4. 输出验证
  if (!tanaPasteContent.startsWith('- ')) {
    throw new Error('Generated Tana Paste is invalid');
  }
  
  return {
    content: tanaPasteContent,
    metadata,
    formattedAt: Date.now()
  };
}

export * from './types';

