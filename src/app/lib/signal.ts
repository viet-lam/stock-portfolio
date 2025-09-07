/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Xác định tín hiệu Mua / Giữ / Bán dựa trên MA20, RSI14 và % lời/lỗ
 * 
 * @param {number} currentPrice - Giá hiện tại của cổ phiếu
 * @param {number} ma20 - Giá trung bình 20 phiên (MA20)
 * @param {number} rsi14 - RSI 14 phiên
 * @param {number} avgCost - Giá vốn trung bình (nếu chưa mua = 0)
 * @returns {string} - Tín hiệu hành động: "Gom mạnh", "DCA", "Bán bớt", "Giữ", "Cut-loss"
 */
export function getSignal(
  currentPrice: number,
  ma20: number,
  rsi14: number,
  avgCost: number,
  volNow?: number,
  vol20?: number
): string {
  // % lệch giá hiện tại so với MA20
  const priceVsMA20 = ((currentPrice - ma20) / ma20) * 100;

  /* Rule Gom mạnh */
  if (priceVsMA20 < -5 && rsi14 < 35) {
    return "📈 Gom mạnh";
  }

  /* Rule DCA */
  // if (priceVsMA20 >= -5 && priceVsMA20 <= 10 && rsi14 >= 40 && rsi14 <= 60 && volNow >= 0.8 * vol20) {
  if (priceVsMA20 >= -5 && priceVsMA20 <= 10 && rsi14 >= 40 && rsi14 <= 60) {
    return "🟡 DCA";
  }

  /* Rule Bán bớt */
  // if (priceVsMA20 > 10 && rsi14 > 70 && volNow > vol20) {
  if (priceVsMA20 > 10 && rsi14 > 70) {
    return "🔴 Bán bớt";
  }

  /* Rule Cut-loss (dựa trên giá vốn trung bình) */
  // if (priceVsMA20 < -10 && rsi14 < 30 && volNow > vol20) {
  if (avgCost > 0 && (currentPrice - avgCost) / avgCost < -0.15) {
    return "🟣 Cut-loss";
  }

  // Mặc định
  return "⚪ Giữ (DCA)";
}
