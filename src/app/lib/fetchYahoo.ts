// lib/fetchYahoo.ts
export async function fetchYahoo(symbol: string, range = "3mo", interval = "1d") {
  try {

      // Gọi API
    const res = await fetch(
      `/api/yahoo?symbol=${symbol}&range=${range}&interval=${interval}`
    );

      // Nếu lỗi HTTP
    if (!res.ok) throw new Error("Failed to fetch from API route");

      // Parse JSON
      const json = await res.json();

    // Lấy kết quả đầu tiên từ chart result
      const result = json.chart?.result?.[0];
      if (!result) throw new Error("Yahoo trả về trống");

      return result; // trả về dữ liệu raw
  } catch (err) {
    console.error("fetchYahoo error", err);
    return null;
  }
}
