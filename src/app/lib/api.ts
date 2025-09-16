// lib/api.ts
import { fetchYahoo } from "./fetchYahoo";

/**
 * Chuyển dữ liệu raw từ Yahoo Finance thành mảng có {date, close, volume}
 * @param {string} symbol - Mã cổ phiếu
 * @param {string} range - Khoảng thời gian muốn lấy dữ liệu
 * @returns {Promise<Array<{date: Date, close: number, volume: number, high: number}>>}
 */
export async function getHistory(symbol: string, range = "3mo", period = "1d") {
  // 📌 Gọi API Yahoo Finance thông qua proxy (interval = 1d = dữ liệu theo ngày)
  const result = await fetchYahoo(symbol, range, period);

  // Giá raw close
  // const closes = result.indicators?.quote?.[0]?.close || [];

  // Giá điều chỉnh (adjusted close)
  // const closes = result.indicators?.adjclose[0]?.adjclose || [];
  const closes =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ??
    [];

  // Mảng khối lượng giao dịch theo ngày
  const volumes = result.indicators?.quote?.[0]?.volume || [];

  // Giá đỉnh
  const highs = result.indicators?.quote?.[0]?.high ?? [];

  // Mảng timestamp (thời điểm của từng phiên)
  const ts = result.timestamp || [];

  const arr: { date: Date; close: number; volume: number; high: number }[] = [];
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i];
    const v = volumes[i];
    const h = highs[i];
    if (c == null || v == null) continue; // bỏ dữ liệu trống

    arr.push({
      date: new Date(ts[i] * 1000), // timestamp → Date
      close: c, // giá đóng cửa
      volume: v, // khối lượng giao dịch
      high: h, // giá high
    });
  }

  if (!arr.length) throw new Error("Không có dữ liệu giá/khối lượng");

  // Trả về mảng [{ date, close, volume }]
  return arr;
}
