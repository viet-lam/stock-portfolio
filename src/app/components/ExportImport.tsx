/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Trade = {
  ticker: string;
  qty: number;
  price: number;
  type: string;
  ts: number;
};

export default function ExportImport({
  trades,
  setTrades,
}: {
  trades: Trade[];
  setTrades: (t: Trade[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [append, setAppend] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // trạng thái thu/mở

  const onImportClick = () => {
    fileRef.current?.click();
  };

  function normalizeTicker(input: string) {
    const t = input.toUpperCase(); // chuyển input thành chữ in hoa
    if (t.endsWith(".VN") || t.endsWith(".HN")) return t;
    // nếu đã có đuôi .VN (HOSE) hoặc .HN (HNX) thì giữ nguyên
    return t + ".VN";
    // mặc định gắn thêm .VN nếu chưa có
  }

  function removeSuffix(input: string) {
    const t = input.toUpperCase(); // chuẩn hóa thành chữ hoa
    if (t.endsWith(".VN")) return t.slice(0, -3); // bỏ ".VN" nếu có
    if (t.endsWith(".HN")) return t.slice(0, -3); // bỏ ".HN" nếu có
    return t; // giữ nguyên nếu không có hậu tố
  }

  // Hàm convert price từ string -> number
  function parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/,/g, ""));
  }

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length <= 1) {
        alert("File CSV không có dữ liệu (chỉ header hoặc rỗng).");
        return;
      }

      const rawHeader = lines[0].replace(/^\uFEFF/, "");
      const cols = rawHeader.split(",").map((c) => c.trim().toLowerCase());

      const dataRows = lines.slice(1);
      const parsed: Trade[] = dataRows
        .map((row) => {
          const parts = row.split(",");
          const obj: any = {};
          cols.forEach((col, idx) => {
            obj[col] = parts[idx] !== undefined ? parts[idx].trim() : "";
          });
          if (!obj.ticker) return null;

          const t: Trade = {
            ticker: normalizeTicker(String(obj.ticker)),
            // ticker: String(obj.ticker).toUpperCase(),
            qty: Number(obj.qty) || 0,
            // price: Number(obj.price) || 0,
            price: parsePrice(obj.price) || 0,
            type: obj.type || "Mua",
            ts: Number(obj.ts) || Date.now(),
          };
          return t;
        })
        .filter((r): r is Trade => r !== null && r.qty !== 0);
      if (parsed.length === 0) {
        alert("Không tìm thấy dòng giao dịch hợp lệ trong CSV.");
        return;
      }

      if (!append && trades.length > 0) {
        const ok = confirm(
          `Bạn đang thay thế ${trades.length} giao dịch hiện tại bằng ${parsed.length} giao dịch từ file. Tiếp tục?`
        );
        if (!ok) {
          return;
        }
      }

      const merged = append ? [...trades, ...parsed] : parsed;
      setTrades(merged);
      localStorage.setItem("trades", JSON.stringify(merged));
      alert(`Import thành công ${parsed.length} hàng. (append=${append})`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đọc file CSV. Kiểm tra format và thử lại.");
    }
  };

  const exportCSV = () => {
    if (!trades || trades.length === 0) {
      alert("Chưa có giao dịch để export.");
      return;
    }
    const header = ["ticker", "qty", "price", "type", "ts"];
    const rows = trades.map((t) =>
      [
        removeSuffix(t.ticker),
        // t.ticker,
        Number(t.qty).toString(),
        Number(t.price).toString(),
        t.type,
        Number(t.ts).toString(),
      ].join(",")
    );
    const csv = header.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
      {/* Header thu/mở */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left text-lg font-semibold hover:bg-gray-100"
      >
        <span>📂 Export / Import CSV</span>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Nội dung có animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="export-import"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-wrap items-center gap-3 p-3 bg-white"
          >
            {/* Export CSV */}
            <button
              type="button"
              onClick={exportCSV}
              className="px-4 py-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition w-full sm:w-auto"
            >
              📤 Export CSV
            </button>

            {/* Hidden input cho Import */}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: "none" }}
              onChange={importCSV}
            />

            {/* Import CSV */}
            <button
              type="button"
              onClick={onImportClick}
              className="px-4 py-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition w-full sm:w-auto"
            >
              📥 Import CSV
            </button>

            {/* Checkbox Append */}
            <label className="flex items-center gap-2 text-sm w-full sm:w-auto">
              <input
                type="checkbox"
                checked={append}
                onChange={(e) => setAppend(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="select-none">
                Append (ghép vào thay vì ghi đè)
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
