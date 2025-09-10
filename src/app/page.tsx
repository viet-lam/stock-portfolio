/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import TradeForm from "./components/TradeForm";
import PortfolioTable from "./components/PortfolioTable";
import ExportImport from "./components/ExportImport";
import InvestmentNote from "./components/InvestmentNote";
import ChartSection from "./components/ChartSection";

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
        📊 Stock Portfolio
      </h2>

      {/* Mô tả hướng dẫn */}
      <p className="text-gray-600 text-sm text-center max-w-2xl mx-auto leading-relaxed">
        Nhập mã <span className="font-semibold text-indigo-600">HOSE</span> như{" "}
        <b>FPT</b> (hệ thống sẽ tự thêm <b>.VN</b>). Nếu là{" "}
        <span className="font-semibold text-indigo-600">HNX</span>, hãy nhập đầy
        đủ mã như <b>SHB.HN</b>.
      </p>

      {/* Bảng */}
      <div className="p-3 bg-white shadow rounded-lg">
        <PortfolioTable
          trades={trades}
          setSelectedTicker={setSelectedTicker}
          range={range}
        />
      </div>

      {/* Chart Section */}
      <ChartSection
        trades={trades}
        selectedTicker={selectedTicker}
        setSelectedTicker={setSelectedTicker}
        range={range}
        setRange={setRange}
      />

      {/* Thêm cổ */}
      <TradeForm trades={trades} setTrades={setTrades} />

      {/* Export / Import */}
      <ExportImport trades={trades} setTrades={setTrades} />

      <InvestmentNote />
    </main>
  );
}
