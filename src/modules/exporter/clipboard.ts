// src/modules/exporter/clipboard.ts
export async function copyToClipboard(text: string): Promise<{ 
  success: boolean; 
  method: 'clipboard-api' | 'execCommand'; 
}> {
  // 1. 尝试 Clipboard API
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard-api' };
  } catch (clipboardError) {
    // 2. 降级到 execCommand（仅在非权限错误时）
    const error = clipboardError as any;
    const isPermissionError = error.name === 'NotAllowedError' || 
                              error.name === 'SecurityError' ||
                              error.message?.toLowerCase().includes('permission') ||
                              error.message?.toLowerCase().includes('denied');
    
    // 如果是权限错误，直接抛出，不尝试 execCommand
    if (isPermissionError) {
      throw clipboardError;
    }
    
    // 3. 对于其他错误，尝试 execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        return { success: true, method: 'execCommand' };
      }
      throw new Error('execCommand failed');
    } catch (fallbackError) {
      // 抛出原始的 clipboard 错误，保留错误信息
      throw clipboardError;
    }
  }
}

export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
}

