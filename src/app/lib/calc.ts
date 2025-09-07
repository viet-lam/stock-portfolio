// lib/calc.ts
/**
 * Tính đường trung bình động (Moving Average – MA).
 * @param series - mảng { close: number, ... }
 * @param period - số phiên (mặc định 20)
 * @returns mảng cùng độ dài với series; các phần tử đầu sẽ là null nếu chưa đủ dữ liệu
 */
export function calcMA(
  series: { close: number }[],
  period = 20
): (number | null)[] {
  const ma = new Array(series.length).fill(null);
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i].close;
    if (i >= period) sum -= series[i - period].close;
    if (i >= period - 1) ma[i] = sum / period;
  }
  return ma;
}

/**
 * Tính RSI(14) cuối cùng theo công thức smoothed Wilder.
 * @param series - mảng { close: number }
 * @param period - số phiên RSI (mặc định 14)
 * @returns RSI cuối cùng (0-100) hoặc null nếu không đủ dữ liệu
 */
export function calcRSILast(
  series: { close: number }[],
  period = 14
): number | null {
  if (series.length < period + 1) return null;

  let gain = 0,
    loss = 0;

  // giai đoạn đầu
  for (let i = 1; i <= period; i++) {
    const diff = series[i].close - series[i - 1].close;
    if (diff > 0) gain += diff;
    else loss -= diff;
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  // smoothed
  for (let i = period + 1; i < series.length; i++) {
    const diff = series[i].close - series[i - 1].close;
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Hàm tính trung bình động khối lượng giao dịch (Vol MA).
 * Trả về mảng cùng độ dài với series; các phần tử đầu là null nếu chưa đủ dữ liệu.
 */
export function calcVolMA(
  series: { volume: number }[],
  period = 20
): (number | null)[] {
  const volMA = new Array(series.length).fill(null);
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i].volume;
    if (i >= period) sum -= series[i - period].volume;
    if (i >= period - 1) volMA[i] = sum / period;
  }
  return volMA;
}
