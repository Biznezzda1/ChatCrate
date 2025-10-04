import { render, screen } from '@testing-library/react';
import HelloWorld from '@/components/HelloWorld';

describe('HelloWorld Component', () => {
  test('renders Hello World text', () => {
    render(<HelloWorld />);
    const textElement = screen.getByText(/hello world/i);
    expect(textElement).toBeInTheDocument();
  });

  test('renders custom message when provided', () => {
    const customMessage = 'Custom Hello World';
    render(<HelloWorld message={customMessage} />);
    const textElement = screen.getByText(customMessage);
    expect(textElement).toBeInTheDocument();
  });

  test('component renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    render(<HelloWorld />);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

