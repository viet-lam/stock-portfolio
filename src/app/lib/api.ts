// lib/api.ts
import { fetchYahoo } from "./fetchYahoo";

/**
 * Chuyển dữ liệu raw từ Yahoo Finance thành mảng có {date, close, volume}
 * @param {string} symbol - Mã cổ phiếu
 * @param {string} range - Khoảng thời gian muốn lấy dữ liệu
 * @returns {Promise<Array<{date: Date, close: number, volume: number}>>}
 */
export async function getHistory(symbol: string, range = "3mo") {
  // 📌 Gọi API Yahoo Finance thông qua proxy (interval = 1d = dữ liệu theo ngày)
  const result = await fetchYahoo(symbol, range, "1d");

  // Mảng giá đóng cửa theo ngày
  const closes = result.indicators?.quote?.[0]?.close || [];

  // Mảng khối lượng giao dịch theo ngày
  const volumes = result.indicators?.quote?.[0]?.volume || [];

  // Mảng timestamp (thời điểm của từng phiên)
  const ts = result.timestamp || [];

  const arr: { date: Date; close: number; volume: number }[] = [];
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i];
    const v = volumes[i];
    if (c == null || v == null) continue;

    arr.push({
      date: new Date(ts[i] * 1000),
      close: c,
      volume: v,
    });
  }

  if (!arr.length) throw new Error("Không có dữ liệu giá/khối lượng");

  return arr;
}
