"use client";
import { useState } from "react";

export default function TradeForm({ trades, setTrades }: any) {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [type, setType] = useState("Mua");

  function normalizeTicker(input: string) {
    const t = input.toUpperCase();
    if (t.endsWith(".VN") || t.endsWith(".HN")) return t;
    return t + ".VN";
  }

  const addTrade = (e: any) => {
    e.preventDefault();
    if (!ticker || !price || !qty) return;
    const trade = {
      ticker: normalizeTicker(ticker),
      price: parseFloat(price),
      qty: parseInt(qty),
      type,
      ts: Date.now(),
    };
    setTrades([...trades, trade]);
    setTicker("");
    setPrice("");
    setQty("");
  };

  return (
    <form onSubmit={addTrade} className="flex flex-wrap gap-2 justify-center">
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Mã CP (FPT hoặc FPT.VN)"
        required
        className="border p-2 rounded"
      />
      <input
        type="number"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Giá (VNĐ)"
        required
        className="border p-2 rounded"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="Số lượng"
        required
        className="border p-2 rounded"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="Mua">Mua</option>
        <option value="Bán">Bán</option>
      </select>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Thêm giao dịch
      </button>
    </form>
  );
}
