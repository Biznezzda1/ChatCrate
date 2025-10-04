// src/utils/workflow.ts
import { extract } from '../modules/extractor';
import { format } from '../modules/formatter';
import { exportToClipboard } from '../modules/exporter';
import { PageContext } from '../modules/extractor/types';
import { ExportResult } from '../modules/exporter/types';

export async function executeWorkflow(
  document: Document,
  pageContext: PageContext
): Promise<ExportResult> {
  try {
    // 1. 提取
    const extracted = await extract(document, pageContext.pageType);

    // 2. 格式化
    const formatted = await format(extracted);

    // 3. 导出
    const result = await exportToClipboard(formatted);

    return result;
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Workflow failed',
      errorCode: 'WORKFLOW_ERROR',
      exportedAt: Date.now(),
    };
  }
}
