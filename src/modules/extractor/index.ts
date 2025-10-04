// src/modules/extractor/index.ts
import { PageType } from '../../types/common';
import { ExtractedContent } from './types';
import { detectPageType, detectLoadingState } from './utils/page-detector';
import { parseSearch } from './parsers/search';
import { parseDeepResearch } from './parsers/deepresearch';
import { parseLabs } from './parsers/labs';

export async function extract(document: Document, pageType: PageType): Promise<ExtractedContent> {
  // 1. 输入验证
  if (!document || !document.body) {
    throw new Error('Invalid document');
  }
  if (pageType === PageType.UNKNOWN) {
    throw new Error('Cannot extract from unknown page type');
  }

  // 2. 根据页面类型选择解析器
  let partialContent: Partial<ExtractedContent>;
  switch (pageType) {
    case PageType.SEARCH:
      partialContent = parseSearch(document);
      break;
    case PageType.DEEP_RESEARCH:
      partialContent = parseDeepResearch(document);
      break;
    case PageType.LABS:
      partialContent = parseLabs(document);
      break;
    default:
      throw new Error('Unsupported page type');
  }

  // 3. 输出验证
  if (!partialContent.query || !partialContent.answer || partialContent.answer.length < 10) {
    throw new Error('Failed to extract core content');
  }

  // 4. 返回完整对象
  return {
    pageType,
    query: partialContent.query,
    answer: partialContent.answer,
    citations: partialContent.citations || [],
    media: partialContent.media || [],
    extractedAt: Date.now()
  };
}

export { detectPageType, detectLoadingState };
export * from './types';

