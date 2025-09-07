// lib/signal.ts
/**
 * Quyết định tín hiệu dựa trên rule gốc của bạn
 */
export function getSignal(
  currentPrice: number,
  ma20: number | null,
  rsi14: number | null,
  avgCost: number,
  volNow?: number | null,
  vol20?: number | null
): string {
  // Nếu không có MA20 hoặc RSI thì vẫn kiểm tra cut-loss (dựa trên avgCost)
  // nhưng các rule khác cần MA20 & RSI để so sánh.
  if (!ma20 || ma20 === 0 || rsi14 === null || rsi14 === undefined) {
    if (avgCost > 0 && (currentPrice - avgCost) / avgCost < -0.15) {
      return "🟣 Cut-loss";
    }
    return "⚪ Giữ(Nên mua DCA)";
  }

  // % lệch giá hiện tại so với MA20
  const priceVsMA20 = ((currentPrice - ma20) / ma20) * 100;

  /* Rule Gom mạnh */
  if (priceVsMA20 < -5 && rsi14 < 35) {
    return "📈 Gom mạnh";
  }

  /* Rule Mua DCA */
  if (priceVsMA20 >= -5 && priceVsMA20 <= 10 && rsi14 >= 40 && rsi14 <= 60) {
    return "🟡 Mua DCA";
  }

  /* Rule Bán bớt */
  if (priceVsMA20 > 10 && rsi14 > 70) {
    return "🔴 Bán bớt";
  }

  /* Rule Cut-loss (dựa trên giá vốn trung bình) */
  if (avgCost > 0 && (currentPrice - avgCost) / avgCost < -0.15) {
    return "🟣 Cut-loss";
  }

  // Mặc định
  return "⚪ Giữ(Nên mua DCA)";
}
