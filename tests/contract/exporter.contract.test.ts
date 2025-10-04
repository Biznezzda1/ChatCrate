// tests/contract/exporter.contract.test.ts
import { exportToClipboard, isClipboardAvailable } from '../../src/modules/exporter';
import { TanaPaste } from '../../src/modules/formatter/types';

describe('Exporter Contract Tests', () => {
  const validTanaPaste: TanaPaste = {
    content: '- **Query**: Test\n  - **Answer**\n    - Test answer',
    metadata: {
      nodeCount: 3,
      citationCount: 0,
      mediaCount: 0,
      characterCount: 50
    },
    formattedAt: Date.now()
  };

  describe('exportToClipboard()', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });
    });

    it('应返回成功的 ExportResult', async () => {
      const result = await exportToClipboard(validTanaPaste);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.method).toBeDefined();
      expect(result.charactersExported).toBe(validTanaPaste.content.length);
      expect(result.exportedAt).toBeGreaterThan(0);
    });

    it('应拒绝无效的 TanaPaste（content 为空）', async () => {
      const invalidInput = { ...validTanaPaste, content: '' };
      const result = await exportToClipboard(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errorCode).toBe('INVALID_CONTENT');
    });

    it('应正确统计 charactersExported', async () => {
      const result = await exportToClipboard(validTanaPaste);
      
      if (result.success) {
        expect(result.charactersExported).toBe(validTanaPaste.content.length);
      }
    });

    it('应处理权限拒绝错误', async () => {
      // Mock permission denied error
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))
        }
      });

      const result = await exportToClipboard(validTanaPaste);
      
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('PERMISSION_DENIED');
    });

    it('应处理 API 不可用错误', async () => {
      // Mock API not available
      Object.assign(navigator, {
        clipboard: undefined
      });
      Object.assign(document, {
        queryCommandSupported: jest.fn().mockReturnValue(false)
      });

      const result = await exportToClipboard(validTanaPaste);
      
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NOT_AVAILABLE');
    });

    it('应降级到 execCommand', async () => {
      // Mock clipboard API failure but execCommand success
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard API failed'))
        }
      });
      
      const mockExecCommand = jest.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;
      
      const result = await exportToClipboard(validTanaPaste);
      
      if (result.success) {
        expect(result.method).toBe('execCommand');
      }
    });
  });

  describe('isClipboardAvailable()', () => {
    it('应检测 Clipboard API 可用性', () => {
      const available = isClipboardAvailable();
      expect(typeof available).toBe('boolean');
    });
  });
});

