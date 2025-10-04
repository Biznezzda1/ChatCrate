# ChatCrate 调试指南

## 两个不同的控制台

### Popup 控制台 (Service Worker)
**如何打开**: 右键点击扩展图标 → "检查弹出窗口"

**会看到的日志**:
```
[Popup] Starting to load page context...
[ChatCrate Bridge] Getting current page context...
[ChatCrate Bridge] Sending message to content script...
```

### 网页控制台 (Content Script)
**如何打开**: 在 Perplexity 页面按 F12

**应该看到的日志**:
```
[ChatCrate Content] ===== Content script loaded =====
[ChatCrate Content] URL: https://www.perplexity.ai/search/...
[ChatCrate Content] Setting up message listener...
[ChatCrate Content] ===== Message listener set up successfully =====
```

## 如果网页控制台没有 content script 日志

说明 content script 没有注入，可能原因：
1. 页面在扩展安装/刷新之前就打开了 → **刷新页面**
2. 权限没有授予 → 检查 chrome://extensions/ 中的权限
3. Content script 编译错误 → 检查是否有红色错误标记

## 测试步骤

1. 在 `chrome://extensions/` 刷新 ChatCrate
2. **关闭所有 Perplexity 标签页**
3. 打开新的 Perplexity 搜索页面
4. 立即在该页面按 F12 查看控制台
5. 应该看到 `[ChatCrate Content]` 开头的日志

如果看不到，content script 就没有加载成功。

