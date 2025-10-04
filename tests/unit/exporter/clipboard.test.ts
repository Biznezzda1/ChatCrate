// tests/unit/exporter/clipboard.test.ts
import { copyToClipboard, isClipboardAvailable } from '../../../src/modules/exporter/clipboard';

describe('Clipboard 操作', () => {
  describe('isClipboardAvailable()', () => {
    it('应检测 Clipboard API 可用性', () => {
      const available = isClipboardAvailable();
      expect(typeof available).toBe('boolean');
    });

    it('应在有 navigator.clipboard 时返回 true', () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn() }
      });
      
      expect(isClipboardAvailable()).toBe(true);
    });

    it('应在有 execCommand 时返回 true', () => {
      Object.assign(navigator, {
        clipboard: undefined
      });
      Object.assign(document, {
        queryCommandSupported: jest.fn().mockReturnValue(true)
      });
      
      expect(isClipboardAvailable()).toBe(true);
    });
  });

  describe('copyToClipboard()', () => {
    beforeEach(() => {
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });
    });

    it('应成功复制到剪贴板（Clipboard API）', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText }
      });

      const result = await copyToClipboard('test text');
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('clipboard-api');
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('应在 Clipboard API 失败时降级到 execCommand', async () => {
      // Mock Clipboard API 失败
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('API failed'))
        }
      });
      
      // Mock execCommand 成功
      const mockExecCommand = jest.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;
      
      const result = await copyToClipboard('test text');
      
      expect(result.method).toBe('execCommand');
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });

  it('应处理两种方法都失败的情况', async () => {
    // Mock Clipboard API 失败（非权限错误）
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('API failed'))
      }
    });
    
    // Mock execCommand 失败
    const mockExecCommand = jest.fn().mockReturnValue(false);
    document.execCommand = mockExecCommand;
    
    // 现在期望函数抛出错误，而不是返回 success: false
    await expect(copyToClipboard('test text')).rejects.toThrow();
  });

    it('应正确创建和清理 textarea 元素', async () => {
      // Mock Clipboard API 失败
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('API failed'))
        }
      });
      
      // Mock execCommand 成功
      document.execCommand = jest.fn().mockReturnValue(true);
      
      const initialChildCount = document.body.children.length;
      
      await copyToClipboard('test text');
      
      // 确认 textarea 已被清理
      expect(document.body.children.length).toBe(initialChildCount);
    });
  });
});

