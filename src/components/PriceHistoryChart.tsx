import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Clock, TrendingDown, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { PriceHistoryRecord } from '../types/index.ts';
import { api } from '../services/api.ts';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

interface PriceHistoryChartProps {
  productId: string;
  currentLowestPrice?: number;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  productId,
  currentLowestPrice = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [records, setRecords] = useState<PriceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await api.getPriceHistory(productId, range);
        if (isMounted) {
          setRecords(res.records || []);
        }
      } catch (err) {
        console.warn('Failed to load price history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId, range]);

  // Compute metrics
  const prices = records.map((r) => r.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : currentLowestPrice;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : currentLowestPrice;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : currentLowestPrice;
  const currentPrice = prices.length > 0 ? prices[prices.length - 1] : currentLowestPrice;
  const priceChange = highestPrice > 0 ? ((currentPrice - highestPrice) / highestPrice) * 100 : 0;

  // Group records by store for multi-line comparison or lowest line
  useEffect(() => {
    if (!canvasRef.current || records.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Extract unique dates formatted
    const dateLabels = Array.from(
      new Set(
        records.map((r) =>
          new Date(r.recordedAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          })
        )
      )
    );

    // Group by store
    const storeMap: Record<string, number[]> = {};
    const storeColors: Record<string, string> = {
      'Amazon India': '#FF9900',
      Flipkart: '#2874F0',
      'Croma Retail': '#00E9BF',
      'Reliance Digital': '#E42529',
    };

    records.forEach((rec) => {
      if (!storeMap[rec.storeName]) {
        storeMap[rec.storeName] = [];
      }
      storeMap[rec.storeName].push(rec.price);
    });

    const datasets = Object.keys(storeMap).map((storeName) => {
      const color = storeColors[storeName] || '#FFD43B';
      const storeRecords = records.filter((r) => r.storeName === storeName);
      const dataPoints = storeRecords.map((r) => r.price);

      return {
        label: storeName,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}15`,
        borderWidth: 2.5,
        tension: 0.3,
        fill: Object.keys(storeMap).length === 1,
        pointBackgroundColor: color,
        pointBorderColor: '#0B0D12',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    // If only one dataset or aggregate, also plot overall lowest trend
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dateLabels.slice(-Math.max(datasets[0]?.data.length || 0, 1)),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#A0A8B8',
              font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
              boxWidth: 12,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: '#141821',
            titleColor: '#FFFFFF',
            bodyColor: '#FFD43B',
            borderColor: '#283042',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y ?? 0;
                return ` ${label}: ₹${Number(val).toLocaleString('en-IN')}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748B', font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#A0A8B8',
              font: { size: 10 },
              callback: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [records]);

  return (
    <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6 shadow-xl">
      {/* Header with Title and Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Historical Price Movement</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
              <ShieldCheck className="w-3 h-3" /> Verified Records
            </span>
          </div>
          <p className="text-xs text-[#A0A8B8] mt-0.5">
            Compare past price fluctuations across Amazon, Flipkart, Croma, and Reliance Digital.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-[#0B0D12] p-1 rounded-xl border border-[#283042] self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                range === r
                  ? 'bg-[#FFD43B] text-black shadow-sm'
                  : 'text-[#A0A8B8] hover:text-white'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#0B0D12] border border-[#1C2230] p-3 rounded-xl">
          <span className="text-[11px] text-[#A0A8B8] block">Lowest Recorded</span>
          <span className="text-base font-black text-[#22C55E]">
            ₹{lowestPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#22C55E] block mt-0.5">Best time to buy</span>
        </div>

        <div className="bg-[#0B0D12] border border-[#1C2230] p-3 rounded-xl">
          <span className="text-[11px] text-[#A0A8B8] block">Highest Recorded</span>
          <span className="text-base font-black text-[#EF4444]">
            ₹{highestPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#A0A8B8] block mt-0.5">Peak launch price</span>
        </div>

        <div className="bg-[#0B0D12] border border-[#1C2230] p-3 rounded-xl">
          <span className="text-[11px] text-[#A0A8B8] block">30-Day Average</span>
          <span className="text-base font-black text-[#4F8CFF]">
            ₹{avgPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#A0A8B8] block mt-0.5">Fair market baseline</span>
        </div>

        <div className="bg-[#0B0D12] border border-[#1C2230] p-3 rounded-xl">
          <span className="text-[11px] text-[#A0A8B8] block">Current Verified</span>
          <span className="text-base font-black text-[#FFD43B]">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#22C55E] block mt-0.5 font-medium">
            {priceChange <= 0 ? `${Math.abs(Math.round(priceChange))}% below peak` : 'At peak'}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-64 sm:h-72 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D12]/50 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2 text-sm text-[#FFD43B]">
              <Clock className="w-4 h-4 animate-spin" /> Fetching verified database records...
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#0B0D12] rounded-xl border border-dashed border-[#283042]">
            <Clock className="w-8 h-8 text-[#A0A8B8] mb-2" />
            <p className="text-sm font-semibold text-white">Insufficient Historical Records</p>
            <p className="text-xs text-[#A0A8B8] max-w-sm mt-1">
              Periodic tracking engine has just started logging this product. Check back after scheduled syncs.
            </p>
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-[#64748B] pt-3 border-t border-[#1C2230]">
        <span>Data verified through automated store crawlers and official store feeds.</span>
        <span>Deterministic SQL storage</span>
      </div>
    </div>
  );
};
