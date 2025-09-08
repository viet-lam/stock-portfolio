"use client";

import { ChevronUp, ChevronDown, Minus } from "lucide-react";

import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";
import { calcMA, calcVolMA, calcRSILast } from "../lib/calc";
import { getSignal } from "../lib/signal";

type Trade = {
  ticker: string;
  type: "Mua" | "Bán";
  qty: number;
  price: number;
};
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
      // 1️⃣ Gom tất cả giao dịch theo từng mã chứng khoán
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

      // 3️⃣ Cập nhật dropdown chọn mã cho biểu đồ
      const tickers = Object.keys(portfolio).filter(
        (t) => portfolio[t].shares !== 0 || portfolio[t].cost !== 0
      );

      const out: Row[] = [];

      // 4️⃣ Tính toán và hiển thị cho từng mã cổ phiếu
      for (const ticker of tickers) {
        try {
          // 1️⃣ Lấy số lượng cổ phiếu hiện có trong portfolio
          const shares = portfolio[ticker].shares;

          // 2️⃣ Tính giá vốn trung bình
          // Nếu chưa có cổ phiếu (shares=0) thì gán avgCost = 0
          const avgCost = shares > 0 ? portfolio[ticker].cost / shares : 0;

          // 3️⃣ Lấy dữ liệu lịch sử giá từ Yahoo Finance
          const hist = await getHistory(ticker, range || "3mo");
          if (!hist || hist.length === 0) continue;

          // 4️⃣ Giá & khối lượng hiện tại (phiên gần nhất)
          const last = hist[hist.length - 1];
          const currentPrice = last.close;
          const currentVol = last.volume;

          // 5️⃣ Tính MA20 (Moving Average 20 phiên) → phản ánh xu hướng trung hạn
          const ma20Arr = calcMA(hist, 20);
          const ma20 = ma20Arr[ma20Arr.length - 1] ?? 0; // lấy giá trị MA20 mới nhất

          // 4️⃣ Tính Vol20 (Volume trung bình 20 ngày)
          const vol20Arr = calcVolMA(hist, 20);
          const vol20 = vol20Arr[vol20Arr.length - 1] ?? 0;

          // 6️⃣ Tính RSI14 (Relative Strength Index 14 phiên) → đánh giá quá mua / quá bán
          const rsi14 = calcRSILast(hist, 14) ?? 0;

          // 7️⃣ Tính % lời/lỗ so với giá vốn
          const plPct =
            avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

          // Tính % chênh lệch so với MA20
          const pctVsMA20 = ma20 ? ((currentPrice - ma20) / ma20) * 100 : 0;

          // Tính % so với Vol20
          const pctVsVol20 = vol20 ? ((currentVol - vol20) / vol20) * 100 : 0;

          // 8️⃣ Xác định hành động theo rule chi tiết
          const action = getSignal(
            currentPrice,
            ma20,
            rsi14,
            avgCost,
            currentVol,
            vol20
          );

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

  // --- Formatter helpers (giữ chính xác kiểu hiển thị số) ---
  const formatNumber = (num: number | null | undefined, decimals = 2) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      // minimumFractionDigits: 2,
      // maximumFractionDigits: 2,
    }).format(num);
  };

  /**
   * formatPercent: trả về chuỗi có dấu + / - tương tự +12,34% hoặc -7,80%,
   * hoặc "0,00%" cho 0, hoặc "-" nếu null/undefined
   */
  const formatPercent = (num: number | null | undefined, decimals = 2) => {
    if (num === null || num === undefined) return "-";
    const abs = Math.abs(num);
    const fmt = new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(abs);
    if (num > 0) return `+${fmt}%`;
    if (num < 0) return `-${fmt}%`;
    return `${fmt}%`; // equals 0
  };

  // --- RSI format with icons (không đổi text/tooltip) ---
  const RSIFormat= ( value: number | null) => {
    if (value === null || value === undefined) {
      return (
        <span
          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium"
          aria-hidden
        >
          <Minus size={12} />-
        </span>
      );
    }

    let bg = "bg-gray-100 text-gray-800";
    let icon = <Minus size={12} />;
    if (value <= 35) {
      bg = "bg-green-100 text-green-700";
      icon = <ChevronUp size={12} />;
    }
    if (value >= 70) {
      bg = "bg-red-100 text-red-700";
      icon = <ChevronDown size={12} />;
    }

    return (
      <span
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}
        aria-hidden
      >
        {icon}
        {formatNumber(value)}
      </span>
    );
  };

  // --- Percent chip with icons (không đổi text/tooltip) ---
  const PercentChip = ({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined) {
      return (
        <span
          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium"
          aria-hidden
        >
          <Minus size={12} />-
        </span>
      );
    }

    let bg = "bg-gray-100 text-gray-800";
    let icon = <Minus size={12} />;
    if (value > 0) {
      bg = "bg-green-100 text-green-700";
      icon = <ChevronUp size={12} />;
    }
    if (value < 0) {
      bg = "bg-red-100 text-red-700";
      icon = <ChevronDown size={12} />;
    }

    return (
      <span
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}
        aria-hidden
      >
        {icon}
        {formatPercent(value)}
      </span>
    );
  };

  return (
    <>
      {/* <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="border p-2"
                title="Mã cổ phiếu, ví dụ MSB.VN, SSI.VN"
              >
                Mã CP
              </th>
              <th
                className="border p-2"
                title="Số lượng cổ phiếu hiện đang nắm (tổng mua – tổng bán)"
              >
                SL hiện tại
              </th>
              <th
                className="border p-2"
                title="Giá vốn trung bình = Tổng chi phí mua / SL hiện tại"
              >
                Giá vốn TB
              </th>
              <th
                className="border p-2"
                title="% Lãi/Lỗ = (Giá hiện tại - Giá vốn TB) / Giá vốn TB * 100%"
              >
                % Lãi/Lỗ
              </th>
              <th
                className="border p-2"
                title="Giá đóng cửa hiện tại của cổ phiếu (Close Price mới nhất)"
              >
                Giá hiện tại
              </th>
              <th
                className="border p-2"
                title="MA20 = Trung bình 20 phiên gần nhất (gồm giá đóng cửa) → phản ánh xu hướng ngắn/trung hạn"
              >
                MA20
              </th>
              <th
                className="border p-2"
                title="% so với MA20 = (Giá hiện tại - MA20)/MA20 * 100%"
              >
                % so với MA20
              </th>
              <th
                className="border p-2"
                title="RSI(14) = Chỉ số sức mạnh tương đối 14 phiên, đo quá mua / quá bán → 0-100"
              >
                RSI(14)
              </th>
              <th
                className="border p-2"
                title="Vol = Khối lượng giao dịch phiên gần nhất"
              >
                Vol
              </th>
              <th
                className="border p-2"
                title="Vol20 = Trung bình khối lượng 20 phiên"
              >
                Vol20
              </th>
              <th className="border p-2">% so với Vol20</th>
              <th
                className="border p-2"
                title="Gợi ý hành động dựa trên rule đầu tư:
            - Gom mạnh: Giá < MA20 -5% và RSI < 35
            - Mua DCA: Giá ~ MA20 -5 -> +10% và RSI 40-60
            - Bán bớt: Giá > MA20 +10% và RSI > 70
            - Cut-loss: Giá giảm > 15% so với Giá vốn TB"
              >
                Gợi ý
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.ticker}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTicker(r.ticker)}
              >
                <td title="Bấm để xem biểu đồ" className="border p-2">
                  {r.ticker}
                </td>
                <td title="Số lượng cổ phiếu hiện có" className="border p-2">
                  {r.shares}
                </td>
                <td
                  title="Giá vốn trung bình mỗi cổ phiếu"
                  className="border p-2"
                >
                  {r.avgCost ? r.avgCost.toFixed(2) : "-"}
                </td>
                <td
                  title="% Lợi nhuận / Lỗ"
                  className={`border p-2 ${
                    r.plPct !== null && r.plPct >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {r.plPct !== null ? r.plPct.toFixed(2) + "%" : "-"}
                </td>
                <td title="Giá hiện tại" className="border p-2">
                  {r.currentPrice?.toFixed(2) ?? "-"}
                </td>
                <td
                  title="MA20 - Giá trung bình 20 phiên"
                  className="border p-2"
                >
                  {r.ma20?.toFixed(2) ?? "-"}
                </td>
                <td
                  title="% chênh lệch so với MA20 = (Giá hiện tại - MA20)/MA20 * 100%"
                  className="border p-2"
                >
                  ${r.pctVsMA20 !== null ? r.pctVsMA20.toFixed(2) + "%" : "-"}
                </td>
                <td
                  title="RSI14 - Chỉ số sức mạnh tương đối 14 phiên"
                  className="border p-2"
                >
                  {r.rsi14?.toFixed(2) ?? "-"}
                </td>
                <td title="Khối lượng hiện tại" className="border p-2">
                  {r.currentVol?.toLocaleString() ?? "-"}
                </td>
                <td
                  title="Vol20 = Trung bình khối lượng 20 ngày"
                  className="border p-2"
                >
                  {r.vol20?.toLocaleString() ?? "-"}
                </td>
                <td
                  title="% so với Vol20 = (Vol hiện tại – Vol20) / Vol20"
                  className="border p-2"
                >
                  ${r.pctVsVol20 ? r.pctVsVol20.toFixed(2) + "%" : "-"}
                </td>
                <td
                  title="Gợi ý hành động: Mua / Bán / Gom mạnh / Cut-loss"
                  className="border p-2 font-bold"
                >
                  {r.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* Table cho desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="border p-2"
                title="Mã cổ phiếu, ví dụ MSB.VN, SSI.VN"
              >
                Mã CP
              </th>
              <th
                className="border p-2"
                title="Số lượng cổ phiếu hiện đang nắm (tổng mua – tổng bán)"
              >
                SL hiện tại
              </th>
              <th
                className="border p-2"
                title="Giá vốn trung bình = Tổng chi phí mua / SL hiện tại"
              >
                Giá vốn TB
              </th>
              <th
                className="border p-2"
                title="% Lãi/Lỗ = (Giá hiện tại - Giá vốn TB) / Giá vốn TB * 100%"
              >
                % Lãi/Lỗ
              </th>
              <th
                className="border p-2"
                title="Giá đóng cửa hiện tại của cổ phiếu (Close Price mới nhất)"
              >
                Giá hiện tại
              </th>
              <th
                className="border p-2"
                title="MA20 = Trung bình 20 phiên gần nhất (gồm giá đóng cửa)"
              >
                MA20
              </th>
              <th
                className="border p-2"
                title="% so với MA20 = (Giá hiện tại - MA20)/MA20 * 100%"
              >
                % so với MA20
              </th>
              <th
                className="border p-2"
                title="RSI(14) = Chỉ số sức mạnh tương đối 14 phiên, đo quá mua / quá bán → 0-100"
              >
                RSI(14)
              </th>
              <th
                className="border p-2"
                title="Vol = Khối lượng giao dịch phiên gần nhất"
              >
                Vol
              </th>
              <th
                className="border p-2"
                title="Vol20 = Trung bình khối lượng 20 phiên"
              >
                Vol20
              </th>
              <th
                className="border p-2"
                title="% so với Vol20 = (Vol hiện tại – Vol20) / Vol20"
              >
                % so với Vol20
              </th>
              <th
                className="border p-2"
                title={`Gợi ý hành động dựa trên rule đầu tư:
- Gom mạnh: Giá < MA20 -5% và RSI < 35
- Mua DCA: Giá ~ MA20 -5 -> +10% và RSI 40-60
- Bán bớt: Giá > MA20 +10% và RSI > 70
- Cut-loss: Giá giảm > 15% so với Giá vốn TB`}
              >
                Gợi ý
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.ticker}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTicker(r.ticker)}
              >
                <td title="Bấm để xem biểu đồ" className="border p-2">
                  {r.ticker}
                </td>
                <td title="Số lượng cổ phiếu hiện có" className="border p-2">
                  {formatNumber(r.shares, 0)}
                </td>
                <td
                  title="Giá vốn trung bình mỗi cổ phiếu"
                  className="border p-2"
                >
                  {formatCurrency(r.avgCost)}
                </td>
                <td
                  title="% Lợi nhuận / Lỗ"
                  className={`border p-2 ${
                    r.plPct !== null && r.plPct >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <PercentChip value={r.plPct} />
                </td>
                <td title="Giá hiện tại" className="border p-2">
                  {formatCurrency(r.currentPrice)}
                </td>
                <td
                  title="MA20 - Giá trung bình 20 phiên"
                  className="border p-2"
                >
                  {formatCurrency(r.ma20)}
                </td>
                <td
                  title="% chênh lệch so với MA20 = (Giá hiện tại - MA20)/MA20 * 100%"
                  className="border p-2"
                >
                  <PercentChip value={r.pctVsMA20} />
                </td>
                <td
                  title="RSI14 - Chỉ số sức mạnh tương đối 14 phiên"
                  className="border p-2"
                >
                  {RSIFormat(r.rsi14)}
                </td>
                <td title="Khối lượng hiện tại" className="border p-2">
                  {formatNumber(r.currentVol, 0)}
                </td>
                <td
                  title="Vol20 = Trung bình khối lượng 20 ngày"
                  className="border p-2"
                >
                  {formatNumber(r.vol20, 0)}
                </td>
                <td
                  title="% so với Vol20 = (Vol hiện tại – Vol20) / Vol20"
                  className="border p-2"
                >
                  <PercentChip value={r.pctVsVol20} />
                </td>
                <td
                  title="Gợi ý hành động: Mua / Bán / Gom mạnh / Cut-loss"
                  className="border p-2 font-bold whitespace-nowrap text-center"
                >
                  {r.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dạng thẻ cho mobile */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div
            key={r.ticker}
            className="border rounded-lg p-3 shadow-sm hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedTicker(r.ticker)}
          >
            <div
              className="flex justify-between"
              title="Mã cổ phiếu, ví dụ MSB.VN, SSI.VN"
            >
              <span className="font-bold">Mã CP:</span>
              <span>{r.ticker}</span>
            </div>
            <div
              className="flex justify-between"
              title="Số lượng cổ phiếu hiện có"
            >
              <span>SL hiện tại:</span>
              <span>{formatNumber(r.shares, 0)}</span>
            </div>
            <div
              className="flex justify-between"
              title="Giá vốn trung bình mỗi cổ phiếu"
            >
              <span>Giá vốn TB:</span>
              <span>{formatCurrency(r.avgCost)}</span>
            </div>
            <div className="flex justify-between font-bold" title="% Lợi nhuận / Lỗ">
              <span>% Lãi/Lỗ:</span>
              <span
                className={
                  r.plPct !== null && r.plPct >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                <PercentChip value={r.plPct} />
              </span>
            </div>
            <div
              className="flex justify-between"
              title="Giá đóng cửa hiện tại của cổ phiếu (Close Price mới nhất)"
            >
              <span>Giá hiện tại:</span>
              <span>{formatCurrency(r.currentPrice)}</span>
            </div>
            <div
              className="flex justify-between"
              title="MA20 = Trung bình 20 phiên gần nhất (gồm giá đóng cửa)"
            >
              <span>MA20:</span>
              <span>{formatCurrency(r.ma20)}</span>
            </div>
            <div
              className="flex justify-between font-bold"
              title="% so với MA20 = (Giá hiện tại - MA20)/MA20 * 100%"
            >
              <span>% vs MA20:</span>
              <span>
                <PercentChip value={r.pctVsMA20} />
              </span>
            </div>
            <div
              className="flex justify-between font-bold"
              title="RSI(14) = Chỉ số sức mạnh tương đối 14 phiên, đo quá mua / quá bán → 0-100"
            >
              <span>RSI(14):</span>
              <span>{RSIFormat(r.rsi14)}</span>
            </div>
            <div
              className="flex justify-between"
              title="Vol = Khối lượng giao dịch phiên gần nhất"
            >
              <span>Vol:</span>
              <span>{formatNumber(r.currentVol, 0)}</span>
            </div>
            <div
              className="flex justify-between"
              title="Vol20 = Trung bình khối lượng 20 phiên"
            >
              <span>Vol20:</span>
              <span>{formatNumber(r.vol20, 0)}</span>
            </div>
            <div
              className="flex justify-between"
              title="% so với Vol20 = (Vol hiện tại – Vol20) / Vol20"
            >
              <span>% vs Vol20:</span>
              <span>
                <PercentChip value={r.pctVsVol20} />
              </span>
            </div>
            <div
              className="flex justify-between font-bold whitespace-nowrap"
              title={`Gợi ý hành động dựa trên rule đầu tư:
- Gom mạnh: Giá < MA20 -5% và RSI < 35
- Mua DCA: Giá ~ MA20 -5 -> +10% và RSI 40-60
- Bán bớt: Giá > MA20 +10% và RSI > 70
- Cut-loss: Giá giảm > 15% so với Giá vốn TB`}
            >
              <span>Gợi ý:</span>
              <span>{r.action}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
