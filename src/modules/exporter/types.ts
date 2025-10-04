// src/modules/exporter/types.ts
export interface ExportResult {
  success: boolean;
  method?: 'clipboard-api' | 'execCommand';
  charactersExported?: number;
  exportedAt: number;
  error?: string;
  errorCode?: string;
}

