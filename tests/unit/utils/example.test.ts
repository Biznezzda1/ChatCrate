import { greet } from '@/utils/example';

describe('Example Utility', () => {
  test('greet function returns greeting message', () => {
    const result = greet('World');
    expect(result).toBe('Hello, World!');
  });

  test('greet function handles empty string', () => {
    const result = greet('');
    expect(result).toBe('Hello, !');
  });
});

