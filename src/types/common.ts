// src/types/common.ts
// 跨模块共享的 TypeScript 类型定义

export enum PageType {
  SEARCH = 'search',
  DEEP_RESEARCH = 'deepresearch',
  LABS = 'labs',
  UNKNOWN = 'unknown',
}

export enum LoadingState {
  LOADING = 'loading',
  COMPLETE = 'complete',
}

export enum MediaType {
  IMAGE = 'image',
  TABLE = 'table',
  CODE = 'code',
}

export interface Citation {
  title: string;
  url: string;
}
