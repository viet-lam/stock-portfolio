"use client";

import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";
import { calcMA, calcVolMA, calcRSILast } from "../lib/calc";
import { getSignal } from "../lib/signal";

type Trade = { ticker: string; type: "Mua" | "Bán"; qty: number; price: number };
type Row = {
  ticker: string;
  shares: number;
  avgCost: number;
  plPct: number | null;
  currentPrice: number | null;
  ma20: number | null;
  pctVsMA20: number | null;
  rsi14: number | null;
  currentVol: number | null;
  vol20: number | null;
  pctVsVol20: number | null;
  action: string;
};

export default function PortfolioTable({
  trades,
  setSelectedTicker,
  range = "3mo",
}: {
  trades: Trade[];
  setSelectedTicker: (t: string) => void;
  range?: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let mounted = true;

    async function renderPortfolio() {
      const portfolio: Record<string, { shares: number; cost: number }> = {};
      for (const t of trades) {
        const tk = t.ticker;
        if (!portfolio[tk]) portfolio[tk] = { shares: 0, cost: 0 };
        if (t.type === "Mua") {
          portfolio[tk].shares += t.qty;
          portfolio[tk].cost += t.price * t.qty;
        } else {
          portfolio[tk].shares -= t.qty;
          portfolio[tk].cost -= t.price * t.qty;
        }
      }

      const tickers = Object.keys(portfolio).filter(
        (t) => portfolio[t].shares !== 0 || portfolio[t].cost !== 0
      );

      const out: Row[] = [];

      for (const ticker of tickers) {
        try {
          const shares = portfolio[ticker].shares;
          const avgCost = shares > 0 ? portfolio[ticker].cost / shares : 0;

          // ✅ dùng getHistory như bạn đã viết
          const hist = await getHistory(ticker, range);
          if (!hist || hist.length === 0) continue;

          const last = hist[hist.length - 1];
          const currentPrice = last.close;
          const currentVol = last.volume;

          const ma20Arr = calcMA(hist, 20);
          const ma20 = ma20Arr[ma20Arr.length - 1] ?? null;

          const vol20Arr = calcVolMA(hist, 20);
          const vol20 = vol20Arr[vol20Arr.length - 1] ?? null;

          const rsi14 = calcRSILast(hist, 14);

          const plPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : null;
          const pctVsMA20 = ma20 ? ((currentPrice - ma20) / ma20) * 100 : null;
          const pctVsVol20 = vol20 ? ((currentVol - vol20) / vol20) * 100 : null;

          const action = getSignal(currentPrice, ma20, rsi14, avgCost, currentVol, vol20);

          out.push({
            ticker,
            shares,
            avgCost,
            plPct,
            currentPrice,
            ma20,
            pctVsMA20,
            rsi14,
            currentVol,
            vol20,
            pctVsVol20,
            action,
          });
        } catch (err) {
          console.error("renderPortfolio error for", ticker, err);
        }
      }

      if (!mounted) return;
      setRows(out);
    }

    renderPortfolio();
    return () => {
      mounted = false;
    };
  }, [trades, range]);

  return (
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2">Mã CP</th>
          <th className="border px-2">SL hiện tại</th>
          <th className="border px-2">Giá vốn TB</th>
          <th className="border px-2">% Lãi/Lỗ</th>
          <th className="border px-2">Giá hiện tại</th>
          <th className="border px-2">MA20</th>
          <th className="border px-2">% so với MA20</th>
          <th className="border px-2">RSI(14)</th>
          <th className="border px-2">Vol</th>
          <th className="border px-2">Vol20</th>
          <th className="border px-2">% so với Vol20</th>
          <th className="border px-2">Gợi ý</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.ticker}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedTicker(r.ticker)}
          >
            <td className="border px-2">{r.ticker}</td>
            <td className="border px-2">{r.shares}</td>
            <td className="border px-2">{r.avgCost ? r.avgCost.toFixed(2) : "-"}</td>
            <td className={`border px-2 ${r.plPct !== null && r.plPct >= 0 ? "text-green-600" : "text-red-600"}`}>
              {r.plPct !== null ? r.plPct.toFixed(2) + "%" : "-"}
            </td>
            <td className="border px-2">{r.currentPrice?.toFixed(2) ?? "-"}</td>
            <td className="border px-2">{r.ma20?.toFixed(2) ?? "-"}</td>
            <td className="border px-2">{r.pctVsMA20?.toFixed(2) ?? "-"}</td>
            <td className="border px-2">{r.rsi14?.toFixed(2) ?? "-"}</td>
            <td className="border px-2">{r.currentVol?.toLocaleString() ?? "-"}</td>
            <td className="border px-2">{r.vol20?.toLocaleString() ?? "-"}</td>
            <td className="border px-2">{r.pctVsVol20?.toFixed(2) ?? "-"}</td>
            <td className="border px-2 font-bold">{r.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
