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
  const ma = new Array(series.length).fill(null);  // Mảng kết quả, ban đầu gán null
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i].close; // Cộng dồn giá đóng cửa
    if (i >= period) sum -= series[i - period].close; // Trừ đi giá cũ đã quá số ngày cần
    if (i >= period - 1) ma[i] = sum / period; // Tính trung bình khi đủ số ngày
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
  if (series.length < period + 1) return null; // Không đủ dữ liệu

  let gain = 0,
    loss = 0;

  // 1️⃣ Tính tổng lãi/lỗ trong giai đoạn đầu (period ngày)
  for (let i = 1; i <= period; i++) {
    const diff = series[i].close - series[i - 1].close;
    if (diff > 0) gain += diff; 
    else loss -= diff; // Nếu giảm thì cộng vào loss
  }

  // Trung bình lãi và lỗ giai đoạn đầu
  let avgGain = gain / period;
  let avgLoss = loss / period;

  // 2️⃣ Tính RSI cho các ngày tiếp theo bằng công thức "smoothed"
  for (let i = period + 1; i < series.length; i++) {
    const diff = series[i].close - series[i - 1].close;
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }

  // 3️⃣ Công thức RSI
  if (avgLoss === 0) return 100; // Không có lỗ → RSI = 100
  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

/*     
  Hàm tính trung bình động khối lượng giao dịch (Moving Average of Volume)
  series: mảng dữ liệu giá, mỗi phần tử cần có {date, close, volume}
  period: số ngày lấy trung bình (mặc định 20 phiên ~ 1 tháng)
  Kết quả: trả về mảng volMA, trong đó mỗi phần tử là giá trị trung bình khối lượng
  của 'period' ngày gần nhất tại thời điểm đó (các phần tử đầu tiên < period sẽ là null) 
*/
export function calcVolMA(
  series: { volume: number }[],
  period = 20
): (number | null)[] {
  const volMA = new Array(series.length).fill(null); // mảng kết quả, khởi tạo = null
  let sum = 0; // tổng khối lượng để tính trung bình trượt

  for (let i = 0; i < series.length; i++) {
    sum += series[i].volume; // cộng dồn khối lượng hôm nay

    // Nếu đã vượt quá số ngày cần tính -> trừ khối lượng của ngày quá cũ
    if (i >= period) sum -= series[i - period].volume;

    // Khi đã đủ ít nhất 'period' ngày -> bắt đầu tính trung bình
    if (i >= period - 1) volMA[i] = sum / period;
  }

  return volMA;
}
