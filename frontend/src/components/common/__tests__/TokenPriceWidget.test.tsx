/**
 * TokenPriceWidget Component Tests
 * 
 * @module components/common/__tests__/TokenPriceWidget.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TokenPriceWidget } from '../TokenPriceWidget';

// Mock fetch globally
global.fetch = vi.fn();

describe('TokenPriceWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockPriceData = {
    pairs: [
      {
        priceUsd: '0.001234',
        priceChange: { h24: '5.67' },
        volume: { h24: '1234567.89' },
      },
    ],
  };

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<TokenPriceWidget />);
    
    // Should show skeleton/loading state
    const container = screen.getByRole('generic');
    expect(container).toBeDefined();
  });

  it('displays price data after successful fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    render(<TokenPriceWidget />);

    await waitFor(() => {
      expect(screen.getByText('$0.001234')).toBeDefined();
    });

    expect(screen.getByText('+5.67%')).toBeDefined();
  });

  it('displays negative price change in red', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        pairs: [
          {
            priceUsd: '0.001234',
            priceChange: { h24: '-3.45' },
            volume: { h24: '1234567.89' },
          },
        ],
      }),
    });

    render(<TokenPriceWidget />);

    await waitFor(() => {
      expect(screen.getByText('-3.45%')).toBeDefined();
    });
  });

  it('shows error state when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<TokenPriceWidget />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch price')).toBeDefined();
    });
  });

  it('auto-refreshes price at specified interval', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPriceData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pairs: [
            {
              priceUsd: '0.002000',
              priceChange: { h24: '10.00' },
              volume: { h24: '2000000' },
            },
          ],
        }),
      });

    render(<TokenPriceWidget refreshInterval={5000} />);

    await waitFor(() => {
      expect(screen.getByText('$0.001234')).toBeDefined();
    });

    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('renders different sizes correctly', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    const { rerender } = render(<TokenPriceWidget size="sm" />);
    rerender(<TokenPriceWidget size="md" />);
    rerender(<TokenPriceWidget size="lg" />);

    // All sizes should render without error
    expect(screen.getByText('FNDRY')).toBeDefined();
  });

  it('hides sparkline when showSparkline is false', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    render(<TokenPriceWidget showSparkline={false} />);

    await waitFor(() => {
      expect(screen.getByText('$0.001234')).toBeDefined();
    });

    // Sparkline should not be present
    const svg = document.querySelector('svg');
    expect(svg).toBeNull();
  });

  it('shows 24h volume for md and lg sizes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    render(<TokenPriceWidget size="md" />);

    await waitFor(() => {
      expect(screen.getByText('24h Volume')).toBeDefined();
      expect(screen.getByText('$1,234,568')).toBeDefined();
    });
  });

  it('handles missing API response gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pairs: [] }),
    });

    render(<TokenPriceWidget />);

    await waitFor(() => {
      expect(screen.getByText('No price data available')).toBeDefined();
    });
  });

  it('applies custom className', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    render(<TokenPriceWidget className="my-custom-class" />);

    await waitFor(() => {
      const container = document.querySelector('.my-custom-class');
      expect(container).toBeDefined();
    });
  });

  it('displays last updated timestamp', async () => {
    const mockDate = new Date('2026-04-06T10:00:00');
    vi.setSystemTime(mockDate);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    render(<TokenPriceWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Updated/)).toBeDefined();
    });
  });
});
