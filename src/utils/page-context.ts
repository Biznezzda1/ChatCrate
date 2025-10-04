// src/utils/page-context.ts
import { PageContext } from '../modules/extractor/types';
import { detectPageType, detectLoadingState } from '../modules/extractor';
import { PageType } from '../types/common';

export async function getPageContext(document: Document): Promise<PageContext> {
  const url = document.location.href;
  const pageType = detectPageType(document);
  const loadingState = await detectLoadingState(document);
  
  const isSupported = pageType !== PageType.UNKNOWN;
  
  return {
    url,
    pageType,
    isSupported,
    loadingState,
    detectedAt: Date.now()
  };
}

