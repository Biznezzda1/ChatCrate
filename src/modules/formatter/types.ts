// src/modules/formatter/types.ts
export interface PasteMetadata {
  nodeCount: number;
  citationCount: number;
  mediaCount: number;
  characterCount: number;
}

export interface TanaPaste {
  content: string;
  metadata: PasteMetadata;
  formattedAt: number;
}

