"use client";

import React, { useRef, useState } from "react";

type Trade = {
  ticker: string;
  price: number;
  qty: number;
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
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [append, setAppend] = useState(false);

  const exportCSV = () => {
    if (!trades || trades.length === 0) {
      alert("Chưa có giao dịch để export.");
      return;
    }
    const header = ["ticker", "price", "qty", "type", "ts"];
    const rows = trades.map((t) =>
      [
        t.ticker,
        // đảm bảo ghi number đúng định dạng
        Number(t.price).toString(),
        Number(t.qty).toString(),
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

  const onImportClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        e.currentTarget.value = "";
        return;
      }

      // header có thể có BOM
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
          // Basic validation: cần ticker + qty + price
          if (!obj.ticker) return null;
          const t: Trade = {
            ticker: String(obj.ticker).toUpperCase(),
            price: Number(obj.price) || 0,
            qty: Number(obj.qty) || 0,
            type: obj.type || "Mua",
            ts: Number(obj.ts) || Date.now(),
          };
          return t;
        })
        .filter((r): r is Trade => r !== null && r.qty !== 0);

      if (parsed.length === 0) {
        alert("Không tìm thấy dòng giao dịch hợp lệ trong CSV.");
        e.currentTarget.value = "";
        return;
      }

      // nếu không append và đang có data thì confirm trước khi ghi đè
      if (!append && trades.length > 0) {
        const ok = confirm(
          `Bạn đang thay thế ${trades.length} giao dịch hiện tại bằng ${parsed.length} giao dịch từ file. Tiếp tục?`
        );
        if (!ok) {
          e.currentTarget.value = "";
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

  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={exportCSV}
        className="px-3 py-1 border rounded bg-white hover:shadow"
      >
        📤 Export CSV
      </button>

      <input
        ref={(r) => (fileRef.current = r)}
        type="file"
        accept=".csv,.txt"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={onImportClick}
        className="px-3 py-1 border rounded bg-white hover:shadow"
      >
        📥 Import CSV
      </button>

      <label className="ml-2 text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={append}
          onChange={(e) => setAppend(e.target.checked)}
        />
        <span className="select-none">Append (ghép vào thay vì ghi đè)</span>
      </label>
    </div>
  );
}
