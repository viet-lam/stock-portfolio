/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <main className="p-6 max-w-6xl mx-auto font-sans">
      {/* Tiêu đề */}
      <h2 className="text-center text-3xl font-bold mb-3 text-gray-800 flex items-center justify-center gap-2">
        📊 Quản lý danh mục chứng khoán
      </h2>

      {/* Mô tả hướng dẫn */}
      <p className="text-gray-600 text-sm text-center max-w-2xl mx-auto leading-relaxed">
        Nhập mã <span className="font-semibold text-indigo-600">HOSE</span> như{" "}
        <b>FPT</b> (hệ thống sẽ tự thêm <b>.VN</b>). Nếu là{" "}
        <span className="font-semibold text-indigo-600">HNX</span>, hãy nhập đầy
        đủ mã như <b>SHB.HN</b>.
      </p>

      {/* Thêm cổ */}
      <TradeForm trades={trades} setTrades={setTrades} />

      {/* Export / Import */}
      <ExportImport trades={trades} setTrades={setTrades} />

      {/* Bảng */}
      <div className="mt-4 p-3 bg-white shadow rounded-lg">
        <PortfolioTable
          trades={trades}
          setSelectedTicker={setSelectedTicker}
          range={range}
        />
      </div>

      {/* Chart */}
      <div className="flex flex-wrap items-center gap-3 mt-4 p-3 bg-white shadow rounded-lg">
        {/* Badge */}
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
          Biểu đồ
        </span>

        {/* Select ticker */}
        <select
          value={selectedTicker || ""}
          onChange={(e) => setSelectedTicker(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-400 transition w-full sm:w-auto"
        >
          <option value="">--Chọn mã--</option>
          {Array.from(new Set(trades.map((t) => t.ticker))).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Select range */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-400 transition w-full sm:w-auto"
        >
          <option value="3mo">3 tháng</option>
          <option value="6mo">6 tháng</option>
          <option value="1y">1 năm</option>
          <option value="2y">2 năm</option>
        </select>
      </div>

      {selectedTicker && <StockChart ticker={selectedTicker} range={range} />}

      <InvestmentNote />
    </main>
  );
}
