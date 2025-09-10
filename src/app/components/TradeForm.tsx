/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react"; // icon đẹp (có thể bỏ nếu không cần)
import { motion, AnimatePresence } from "framer-motion";

export default function TradeForm({ trades, setTrades }: any) {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [type, setType] = useState("Mua");
  const [isOpen, setIsOpen] = useState(false);
  const toggleForm = () => setIsOpen(!isOpen);

  function normalizeTicker(input: string) {
    const t = input.toUpperCase(); // chuyển input thành chữ in hoa
    if (t.endsWith(".VN") || t.endsWith(".HN")) return t;
    // nếu đã có đuôi .VN (HOSE) hoặc .HN (HNX) thì giữ nguyên
    return t + ".VN";
    // mặc định gắn thêm .VN nếu chưa có
  }

  const addTrade = (e: any) => {
    e.preventDefault(); // chặn hành vi mặc định của form (reload page)
    if (!ticker || !price || !qty) return; // nếu thiếu dữ liệu thì không làm gì

    const trade = {
      ticker: normalizeTicker(ticker), // chuẩn hóa mã CP
      price: parseFloat(price), // chuyển giá sang số thực
      qty: parseInt(qty), // chuyển số lượng sang số nguyên
      type, // loại giao dịch (có thể là 'BUY' hoặc 'SELL')
      ts: Date.now(), // timestamp thời điểm thêm
    };

    setTrades([...trades, trade]); // thêm giao dịch mới vào danh sách
    setTicker(""); // reset input ticker
    setPrice(""); // reset input price
    setQty(""); // reset input qty
  };
  return (
    <>
      <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
        {/* Header thu/mở */}
        <button
          onClick={toggleForm}
          className="w-full flex items-center justify-between px-4 py-2 text-left text-lg font-semibold hover:bg-gray-100"
        >
          <span>➕ Thêm giao dịch</span>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Nội dung form (có animation) */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.form
              key="trade-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onSubmit={addTrade}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-white shadow-md rounded-lg"
            >
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Mã CP (FPT hoặc FPT.VN)"
                required
                className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Giá (VNĐ)"
                required
                className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Số lượng"
                required
                className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Mua">Mua</option>
                <option value="Bán">Bán</option>
              </select>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2.5 rounded-lg w-full hover:bg-blue-600 transition"
              >
                Thêm giao dịch
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
