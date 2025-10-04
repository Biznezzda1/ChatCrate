// src/modules/extractor/types.ts
import { PageType, LoadingState, Citation, MediaType } from '../../types/common';

export interface PageContext {
  url: string;
  pageType: PageType;
  isSupported: boolean;
  loadingState: LoadingState;
  detectedAt: number;
}

export interface MediaContent {
  type: MediaType;
  markdown: string;
}

export interface ExtractedContent {
  pageType: PageType;
  query: string;
  answer: string;
  citations: Citation[];
  media: MediaContent[];
  extractedAt: number;
}

