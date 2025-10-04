// src/modules/exporter/index.ts
import { TanaPaste } from '../formatter/types';
import { ExportResult } from './types';
import { copyToClipboard, isClipboardAvailable } from './clipboard';

export async function exportToClipboard(tanaPaste: TanaPaste): Promise<ExportResult> {
  // 1. 输入验证
  if (!tanaPaste || !tanaPaste.content || tanaPaste.content.length === 0) {
    return {
      success: false,
      error: 'Invalid Tana Paste content',
      errorCode: 'INVALID_CONTENT',
      exportedAt: Date.now()
    };
  }
  
  // 2. 检查 API 可用性
  if (!isClipboardAvailable()) {
    return {
      success: false,
      error: 'Clipboard is not available in this browser.',
      errorCode: 'NOT_AVAILABLE',
      exportedAt: Date.now()
    };
  }
  
  // 3. 执行复制
  try {
    const result = await copyToClipboard(tanaPaste.content);
    
    return {
      success: true,
      method: result.method,
      charactersExported: tanaPaste.content.length,
      exportedAt: Date.now()
    };
  } catch (error: any) {
    // 4. 错误处理
    const errorMsg = error.message?.toLowerCase() || '';
    const errorName = error.name || '';
    
    if (errorName === 'NotAllowedError' || 
        errorName === 'SecurityError' ||
        errorMsg.includes('permission') || 
        errorMsg.includes('denied') ||
        errorMsg.includes('not allowed')) {
      return {
        success: false,
        error: 'Clipboard access denied. Please allow permissions.',
        errorCode: 'PERMISSION_DENIED',
        exportedAt: Date.now()
      };
    }
    
    return {
      success: false,
      error: 'Failed to copy content to clipboard.',
      errorCode: 'COPY_FAILED',
      exportedAt: Date.now()
    };
  }
}

export { isClipboardAvailable };
export * from './types';

