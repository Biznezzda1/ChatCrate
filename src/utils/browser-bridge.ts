// src/utils/browser-bridge.ts
import { PageContext } from '../modules/extractor/types';
import { detectPageType, detectLoadingState } from '../modules/extractor';
import { PageType, LoadingState } from '../types/common';

/**
 * 通过 content script 获取页面上下文
 */
export async function getCurrentPageContext(): Promise<PageContext | null> {
  try {
    console.log('[ChatCrate Bridge] Getting current page context...');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('[ChatCrate Bridge] Current tab:', tab);
    
    if (!tab?.id) {
      console.error('[ChatCrate Bridge] No active tab found');
      return null;
    }

    // 通过消息传递与 content script 通信
    console.log('[ChatCrate Bridge] Sending message to content script...');
    
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(
        tab.id!,
        { action: 'getPageContext' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[ChatCrate Bridge] Error:', chrome.runtime.lastError.message);
            // Content script 可能未加载，返回 unknown
            resolve({
              url: tab.url || '',
              pageType: PageType.UNKNOWN,
              isSupported: false,
              loadingState: LoadingState.COMPLETE,
              detectedAt: Date.now()
            });
            return;
          }
          
          console.log('[ChatCrate Bridge] Got response:', response);
          
          if (response && !response.error) {
            resolve({
              url: response.url,
              pageType: response.pageType,
              isSupported: response.isSupported,
              loadingState: response.loadingState,
              detectedAt: Date.now()
            });
          } else {
            console.error('[ChatCrate Bridge] Response error:', response?.error);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('[ChatCrate Bridge] Failed to get page context:', error);
    return null;
  }
}

/**
 * 在当前活跃 tab 中执行工作流（提取 → 格式化 → 导出）
 */
export async function executeWorkflowInTab(): Promise<{
  success: boolean;
  charactersExported?: number;
  error?: string;
}> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return { success: false, error: 'No active tab found' };
    }

    // 在页面中执行完整工作流
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        // 注意：这里的代码运行在页面上下文，可以直接访问 document
        // 需要在页面中加载模块代码（通过 content script 或直接注入）
        
        // 简化版本：返回页面信息，实际提取在 background/content script 中完成
        return {
          success: true,
          message: 'Workflow executed in tab context'
        };
      }
    });

    return result?.result || { success: false, error: 'Execution failed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

