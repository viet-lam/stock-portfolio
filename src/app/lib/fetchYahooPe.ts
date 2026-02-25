// lib/fetchYahooPe.ts
export async function fetchYahooPe(symbol: string) {
  try {

      // Gọi API
    const res = await fetch(
      `/api/yahoo/pe?symbol=${symbol}`
    );

      // Nếu lỗi HTTP
    if (!res.ok) throw new Error("Failed to fetch from API route");

      // Parse JSON
      const json = await res.json();

    // Lấy kết quả đầu tiên từ chart result
      const result = json;
      if (!result) throw new Error("Yahoo trả về trống");

      return result; // trả về dữ liệu raw
  } catch (err) {
    console.error("fetchYahoo error", err);
    return null;
  }
}
