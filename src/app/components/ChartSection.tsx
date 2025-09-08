import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StockChart from "./StockChart";

export default function ChartSection({
  trades,
  selectedTicker,
  setSelectedTicker,
  range,
  setRange,
}: {
  trades: { ticker: string }[];
  selectedTicker: string | null;
  setSelectedTicker: (t: string) => void;
  range: string;
  setRange: (r: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left text-lg font-semibold hover:bg-gray-100"
      >
        <span>📊 Biểu đồ</span>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Nội dung có animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="chart-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-wrap items-center gap-3 p-3 bg-white"
          >
            {/* Badge */}
            {/* <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
              Biểu đồ
            </span> */}

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
          </motion.div>
        )}

        {/* Chart chỉ hiển thị khi mở và có ticker */}

        {isOpen && selectedTicker && (
          //   <motion.div
          //     key="stock-chart"
          //     initial={{ height: 0, opacity: 0 }}
          //     animate={{ height: "auto", opacity: 1 }}
          //     exit={{ height: 0, opacity: 0 }}
          //     transition={{ duration: 0.3, ease: "easeInOut" }}
          //   >
          //     <StockChart ticker={selectedTicker} range={range} />
          //   </motion.div>

          <StockChart ticker={selectedTicker} range={range} />
        )}
      </AnimatePresence>
    </div>
  );
}
