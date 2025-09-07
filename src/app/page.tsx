"use client";

import { useEffect, useState } from "react";

import TradeForm from "./components/TradeForm";
import PortfolioTable from "./components/PortfolioTable";
import StockChart from "./components/StockChart";
import ExportImport from "./components/ExportImport";
import InvestmentNote from "./components/InvestmentNote";

export default function Home() {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [range, setRange] = useState("3mo");

  // Load từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("trades");
    if (stored) setTrades(JSON.parse(stored));
  }, []);

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("trades", JSON.stringify(trades));
  }, [trades]);

  return (
    <main className="p-6 max-w-5xl mx-auto font-sans">
      <h2 className="text-center text-2xl mb-4">
        📊 Quản lý danh mục chứng khoán (VN)
      </h2>

      <p className="text-gray-500 text-sm text-center mb-4">
        Nhập mã HOSE như <b>FPT</b> (tự thêm .VN). Nếu HNX, nhập đầy đủ như{" "}
        <b>SHB.HN</b>.
      </p>

      <TradeForm trades={trades} setTrades={setTrades} />

      {/* Export / Import */}
      <ExportImport trades={trades} setTrades={setTrades} />

      <div className="flex gap-2 items-center mt-4">
        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
          Biểu đồ
        </span>
        <select
          value={selectedTicker || ""}
          onChange={(e) => setSelectedTicker(e.target.value)}
        >
          <option value="">--Chọn mã--</option>
          {Array.from(new Set(trades.map((t) => t.ticker))).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="3mo">3 tháng</option>
          <option value="6mo">6 tháng</option>
          <option value="1y">1 năm</option>
          <option value="2y">2 năm</option>
        </select>
      </div>

      <PortfolioTable
        trades={trades}
        setSelectedTicker={setSelectedTicker}
        range={range}
      />

      {selectedTicker && <StockChart ticker={selectedTicker} range={range} />}

      <InvestmentNote />
    </main>
  );
}
