// src/entrypoints/popup/App.tsx
import React, { useState, useEffect } from 'react';
import { StatusDisplay } from '../../modules/ui/components/StatusDisplay';
import { FormatSelector } from '../../modules/ui/components/FormatSelector';
import { ExportSelector } from '../../modules/ui/components/ExportSelector';
import { getCurrentPageContext } from '../../utils/browser-bridge';
import { PageContext } from '../../modules/extractor/types';

export default function App() {
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [characterCount, setCharacterCount] = useState<number | undefined>();
  const [format, setFormat] = useState('tana-paste');
  const [exporter, setExporter] = useState('clipboard');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // 页面加载时检测上下文
  useEffect(() => {
    const loadPageContext = async () => {
      console.log('[Popup] Starting to load page context...');
      setDebugInfo('正在检测页面...');
      
      try {
        const context = await getCurrentPageContext();
        console.log('[Popup] Got context:', context);
        setPageContext(context);
        
        if (!context) {
          console.error('[Popup] Context is null');
          setStatus('error');
          setStatusMessage('无法检测页面信息');
          setDebugInfo('错误: getCurrentPageContext 返回 null');
        } else if (!context.isSupported) {
          console.log('[Popup] Page not supported');
          setStatus('idle');
          setStatusMessage('当前页面不受支持');
          setDebugInfo(`页面类型: ${context.pageType}, URL: ${context.url.substring(0, 50)}...`);
        } else if (context.loadingState === 'loading') {
          setStatus('idle');
          setStatusMessage('页面正在加载...');
          setDebugInfo(`检测到 ${context.pageType} 页面，等待加载完成`);
        } else {
          setStatus('idle');
          setStatusMessage('就绪');
          setDebugInfo(`✓ 检测成功: ${context.pageType} 页面`);
        }
      } catch (error: any) {
        console.error('[Popup] Error loading page context:', error);
        setStatus('error');
        setStatusMessage('检测页面时出错');
        setDebugInfo(`错误: ${error.message}`);
      }
    };
    
    loadPageContext();
  }, []);

  const handleExport = async () => {
    if (!pageContext || !pageContext.isSupported) {
      setStatus('error');
      setStatusMessage('当前页面不受支持');
      return;
    }

    if (pageContext.loadingState === 'loading') {
      setStatus('error');
      setStatusMessage('请等待页面加载完成');
      return;
    }

    setStatus('loading');
    setStatusMessage('正在处理...');
    setDebugInfo('正在提取内容并复制到剪贴板...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('No active tab');
      }

      // 通过消息机制让 content script 执行复制
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'extractAndCopy' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Popup] Error:', chrome.runtime.lastError.message);
            setStatus('error');
            setStatusMessage('无法与页面通信');
            setDebugInfo(`错误: ${chrome.runtime.lastError.message}`);
            return;
          }
          
          console.log('[Popup] Copy response:', response);
          
          if (response?.success) {
            setStatus('success');
            setStatusMessage('✓ 已复制到剪贴板');
            setCharacterCount(response.charactersExported);
            setDebugInfo(`成功复制 ${response.charactersExported} 个字符`);
          } else {
            setStatus('error');
            setStatusMessage(response?.error || '复制失败');
            setDebugInfo(`错误: ${response?.error || '未知错误'}`);
          }
        }
      );
    } catch (error: any) {
      setStatus('error');
      setStatusMessage(error.message || '未知错误');
      setDebugInfo(`异常: ${error.message}`);
    }
  };

  const isButtonDisabled = !pageContext?.isSupported || 
                          pageContext?.loadingState === 'loading' ||
                          status === 'loading';

  return (
    <div className="w-[420px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight mb-1">ChatCrate</h1>
          <p className="text-blue-50 text-sm font-medium">Perplexity → Tana</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      </div>
      
      <div className="px-6 py-4 space-y-4">
        {/* Page Status Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📄</span>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">页面信息</span>
            </div>
            {pageContext?.isSupported ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                ✓ 已支持
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">
                ✗ 未支持
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">页面类型</span>
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {pageContext?.pageType || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">加载状态</span>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${
                pageContext?.loadingState === 'complete' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <span className="text-base">
                  {pageContext?.loadingState === 'complete' ? '✓' : '⏳'}
                </span>
                {pageContext?.loadingState === 'complete' ? '完成' : '加载中'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Configuration Options */}
        <div className="space-y-3">
          <FormatSelector value={format} onChange={setFormat} />
          <ExportSelector value={exporter} onChange={setExporter} />
        </div>
        
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isButtonDisabled}
          className={`w-full py-3 px-5 rounded-xl font-bold text-base transition-all duration-300 transform shadow-md ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>处理中...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>导出到 Tana</span>
            </span>
          )}
        </button>
        
        {/* Status Display */}
        {(statusMessage || status !== 'idle') && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <StatusDisplay 
              status={status} 
              message={statusMessage} 
              characterCount={characterCount} 
            />
          </div>
        )}
        
        {/* Debug Info */}
        {debugInfo && (
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">🔍</span>
              <div className="flex-1 font-mono">
                <p className="font-bold mb-1">调试信息</p>
                <p className="text-xs leading-relaxed break-words">{debugInfo}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-300">
              <p className="text-xs text-slate-600">
                💡 提示: 右键点击扩展图标 → "检查弹出窗口" 查看控制台日志
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
