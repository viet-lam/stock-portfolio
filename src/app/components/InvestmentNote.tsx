export default function InvestmentNote() {
  return (
    <div
      id="note"
      style={{
        background: "#ecfdf5",
        border: "1px solid #10b981",
        padding: "20px",
        borderRadius: "10px",
        margin: "20px 0",
        fontSize: "14px",
        lineHeight: 1.6,
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: "18px" }}>📌 Quan điểm đầu tư (Kim chỉ nam)</h3>

      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        <li>
          📊 <b>MA20 (Moving Average 20 ngày):</b> Giá trung bình 20 phiên gần nhất (~1 tháng vì 1 tháng có khoảng 20 ngày giao dịch).
          <br />👉 MA20 thường được dùng để phản ánh <b>xu hướng ngắn hạn – trung hạn</b>.
        </li>

        <li>
          📈 <b>RSI(14):</b> Chỉ số sức mạnh tương đối trên 14 phiên, chuẩn gốc của Wilder (1978). Dao động từ 0 → 100.
          <br /><u>Ý nghĩa các mốc:</u>
          <ul>
            <li>⬇️ <b>RSI &lt; 30 (Quá bán – Oversold):</b> Thị trường bị bán tháo, giá giảm mạnh, <i>khả năng hồi phục cao</i> (nếu có MA20 xác nhận).</li>
            <li>⬆️ <b>RSI &gt; 70 (Quá mua – Overbought):</b> Giá tăng nóng, <i>dễ điều chỉnh</i>. → <b>Vùng cảnh báo rủi ro cao</b>.</li>
            <li>➖ <b>RSI 40–60 (Trung tính):</b> Thị trường chưa rõ xu hướng → nên <b>Giữ</b> hoặc <i>đợi tín hiệu rõ hơn</i>.</li>
          </ul>
        </li>

        <li>
          ❓ <b>Vì sao dùng MA20 và RSI(14)?</b><br />
          Đây là <b>“chuẩn thị trường” (market convention)</b>, được đa số nhà đầu tư & trader sử dụng:
          <br />👉 MA20 giúp theo dõi <i>xu hướng ngắn – trung hạn</i>.
          <br />👉 RSI(14) cân bằng giữa <i>độ nhạy và độ ổn định</i>.
        </li>

        <li>
          📉 <b>Vol20 (Volume 20):</b> Khối lượng trung bình 20 phiên gần nhất (~1 tháng vì 1 tháng có khoảng 20 ngày giao dịch).
          <br />👉 <b>Chỉ hành động mạnh</b> (bán, mua) khi <b>VolNow ≥ Vol20 × 1.3(30%)</b> → tín hiệu có sức mạnh (có dòng tiền tham gia).
          <br />👉 <i>Khối lượng ≈ hoặc &lt; Vol20 → tín hiệu yếu</i>, dễ bị &quot;bull trap&quot; hay &quot;bear trap&quot;.
        </li>

        <li>
          🔎 <b>Quan sát nâng cao (Giá – RSI – Vol):</b>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li>🚨 <b>Giá cao + RSI cao + Vol cao:</b> Thị trường hưng phấn, nhưng thường là <b>tay to đang xả hàng</b> → rủi ro giảm giá.</li>
            <li>📊 <b>Giá cao + RSI cao + Vol thấp:</b> Tay to <i>chưa bán mạnh</i>, có thể đang <b>kéo giá lên tiếp</b> để hút nhỏ lẻ. Nhưng rủi ro rất cao → khi nào tay to bắt đầu xả (Vol tăng vọt) → giá đảo chiều nhanh.</li>
            <li>⚠️ <b>Giá cao + RSI cao + Vol ≈ Vol20:</b> Có khả năng <b>xả âm thầm</b>, tay to bán từ từ tránh đẩy Vol quá cao để không lộ ý đồ → Nếu sau đó Vol tăng dần (bán ra nhiều hơn) + RSI quay đầu xuống dưới 70 → tín hiệu rõ ràng hơn là đỉnh đã hình thành → chuẩn bị điều chỉnh giảm.</li>
            <li>💥 <b>Giá thấp + RSI thấp + Vol cao:</b> Lực bán tháo mạnh. Nếu sau đó Vol tăng tiếp + RSI hồi → thường là <b>dấu hiệu tạo đáy</b> → rủi ro giá tăng..</li>
            <li>⚠️ <b>Giá thấp + RSI thấp + Vol thấp:</b> <b>Tay to chưa gom hàng</b>, có thể còn <b>đè giá xuống tiếp</b> → đáy chưa chắc là đáy.</li>
            <li>🔍 <b>Giá thấp + RSI thấp + Vol ≈ Vol20:</b> Có lực <b>gom âm thầm</b>, nhà đầu tư lớn thường gom dần, không vội đẩy Vol quá cao để tránh bị lộ → Đây là tín hiệu sớm cho khả năng đảo chiều, nếu sau đó Vol tăng dần + RSI quay lên khỏi 35 (tăng mua rõ ràng hơn) → <b>xác nhận đáy</b>.</li>
          </ul>
        </li>

        <li>
          🎯 <b>Logic gợi ý hành động:</b>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li><b style={{ color: "green" }}>✅ Gom mạnh:</b> Giá &lt; MA20 –5% <i>và</i> RSI(14) &lt; 35 → <b>Mua gấp đôi</b>.</li>
            <li><b style={{ color: "orange" }}>🟠 Mua DCA:</b> Giá trong vùng MA20 –5% → +10% <i>và</i> RSI(14) trong 40–60 → <i>Mua đều đặn</i>.</li>
            <li><b style={{ color: "#d97706" }}>📤 Bán bớt:</b> Giá &gt; MA20 +10% <i>và</i> RSI(14) &gt; 70 → <b>Bán 10–20%</b> để chờ gom lại.</li>
            <li><b style={{ color: "red" }}>⛔ Cut-loss (bảo hiểm):</b> Nếu cổ phiếu giảm &gt;15% so với giá vốn TB <i>và</i> có tin xấu → <b>Bán toàn bộ</b>.</li>
          </ul>
        </li>

        <li>🛡️ <b>Quản lý rủi ro:</b> Không để 1 mã &gt;20% tổng danh mục để tránh rủi ro tập trung.</li>

        <li>
          📅 <b>Chiến lược dài hạn:</b> Luôn duy trì <b>DCA</b> (mua đều hàng tháng) để bình quân giá vốn.
          <i>Các rule trên chỉ nhằm tối ưu vốn, không thay thế nền tảng DCA.</i>
        </li>

        <li>
          📌 <b>Kỷ luật giao dịch:</b><br />
          - <b>Chốt lời</b> khi lãi 15–20%.<br />
          - <b>Cắt lỗ</b> nếu lỗ &gt;10%.
        </li>

        <li>
          🧘 <b>Tâm lý:</b> Không chạy theo tin đồn, không “đu đỉnh – bán đáy”.
          Luôn ra quyết định dựa trên <b>MA20 + RSI</b>, <i>không dựa vào cảm xúc</i>.
        </li>
      </ul>
    </div>
  );
}
