// src/entrypoints/content.ts
// Content script 运行在 Perplexity 页面中，可以访问 DOM

// 立即执行
console.log('[ChatCrate Content] ===== Content script loaded =====');
console.log('[ChatCrate Content] URL:', window.location.href);
console.log('[ChatCrate Content] Setting up message listener...');

// 等待元素出现的辅助函数
const waitForElement = (
  selector: string,
  timeout = 3000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`[ChatCrate Content] Element found immediately: ${selector}`);
      resolve(element);
      return;
    }

    console.log(`[ChatCrate Content] Waiting for element: ${selector}`);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(
          `[ChatCrate Content] Element found after mutation: ${selector}`
        );
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      console.log(`[ChatCrate Content] Timeout waiting for: ${selector}`);
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ChatCrate Content] Received message:', message);

  if (message.action === 'getPageContext') {
    (async () => {
      try {
        const url = window.location.href;
        const pathname = window.location.pathname;
        const hostname = window.location.hostname;

        console.log('[ChatCrate Content] URL:', url);
        console.log('[ChatCrate Content] Pathname:', pathname);
        console.log('[ChatCrate Content] Hostname:', hostname);

        // 检查是否在 Perplexity 域名
        if (!hostname.includes('perplexity.ai')) {
          console.log('[ChatCrate Content] Not on Perplexity domain');
          sendResponse({
            url,
            pathname,
            pageType: 'unknown',
            loadingState: 'complete',
            isSupported: false,
          });
          return;
        }

        // 检测页面类型
        let pageType: 'search' | 'deepresearch' | 'labs' | 'unknown' =
          'unknown';

        // 1. 检查 URL 是否为 /search/<id>
        console.log(
          '[ChatCrate Content] Checking if pathname starts with /search/'
        );
        if (pathname.startsWith('/search/')) {
          console.log('[ChatCrate Content] Yes, this is a search page');

          // 2. 等待页面加载，查找所有可能的标识元素
          console.log('[ChatCrate Content] Waiting for page to load...');

          // 等待任意一个标识元素出现
          await Promise.race([
            waitForElement('[data-testid="answer-mode-tabs-tab-research"]'),
            waitForElement('[data-testid="answer-mode-tabs-tab-studio"]'),
            waitForElement('[data-testid="answer-content"]'),
            new Promise((resolve) => setTimeout(resolve, 2000)), // 最多等待 2 秒
          ]);

          // 检测所有可能的元素
          const researchTab = document.querySelector(
            '[data-testid="answer-mode-tabs-tab-research"]'
          );
          const labsTab = document.querySelector(
            '[data-testid="answer-mode-tabs-tab-studio"]'
          );

          // 调试：列出所有带 data-testid 的按钮
          const allButtons = document.querySelectorAll(
            'button[data-testid*="tab"]'
          );
          console.log(
            '[ChatCrate Content] All tab buttons found:',
            allButtons.length
          );
          allButtons.forEach((btn, idx) => {
            console.log(
              `[ChatCrate Content] Button ${idx}:`,
              btn.getAttribute('data-testid')
            );
          });

          console.log('[ChatCrate Content] Research tab found:', !!researchTab);
          console.log('[ChatCrate Content] Labs tab found:', !!labsTab);

          if (researchTab) {
            pageType = 'deepresearch';
          } else if (labsTab) {
            pageType = 'labs';
          } else {
            pageType = 'search';
          }

          console.log('[ChatCrate Content] Detected page type:', pageType);
        } else {
          console.log('[ChatCrate Content] Not a /search/ URL');
        }

        // 检测加载状态（简化版：检查是否有主要内容）
        const hasContent =
          document.querySelector('[data-testid="answer-content"]') ||
          document.querySelector('h1') ||
          document.body.textContent!.length > 100;

        const loadingState: 'loading' | 'complete' = hasContent
          ? 'complete'
          : 'loading';

        console.log('[ChatCrate Content] Has content:', hasContent);
        console.log('[ChatCrate Content] Loading state:', loadingState);

        sendResponse({
          url,
          pathname,
          pageType,
          loadingState,
          isSupported: pageType !== 'unknown',
        });
      } catch (error) {
        console.error('[ChatCrate Content] Error:', error);
        sendResponse({ error: (error as Error).message });
      }
    })();

    return true; // 保持消息通道开放（异步响应）
  }

  if (message.action === 'extractAndCopy') {
    console.log('[ChatCrate Content] Extract and copy requested');

    (async () => {
      try {
        // TODO: 实现完整的提取逻辑
        // 暂时使用简化版本：获取页面主要文本内容
        const text = document.body.innerText;

        // 使用 navigator.clipboard API 复制
        try {
          await navigator.clipboard.writeText(text);
          console.log('[ChatCrate Content] Copied to clipboard successfully');
          sendResponse({
            success: true,
            charactersExported: text.length,
          });
        } catch (clipboardError) {
          console.error(
            '[ChatCrate Content] Clipboard API failed:',
            clipboardError
          );

          // 备选方案：使用 execCommand
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();

          const success = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (success) {
            console.log('[ChatCrate Content] Copied using execCommand');
            sendResponse({
              success: true,
              charactersExported: text.length,
            });
          } else {
            sendResponse({
              success: false,
              error: 'Failed to copy to clipboard',
            });
          }
        }
      } catch (error) {
        console.error('[ChatCrate Content] Error:', error);
        sendResponse({
          success: false,
          error: (error as Error).message,
        });
      }
    })();

    return true; // 保持消息通道开放
  }

  if (message.action === 'ping') {
    console.log('[ChatCrate Content] Ping received');
    sendResponse({ status: 'ok', message: 'Content script is alive' });
    return true;
  }

  console.log('[ChatCrate Content] Unknown action:', message.action);
  return false;
});

console.log(
  '[ChatCrate Content] ===== Message listener set up successfully ====='
);

export {};
