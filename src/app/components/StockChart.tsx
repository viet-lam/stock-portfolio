"use client";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getHistory } from "../lib/api";
import { calcMA } from "../lib/calc";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function StockChart({ ticker, range }: any) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const history = await getHistory(ticker, range);
      const ma20 = calcMA(history, 20, true); // trả về mảng
      setChartData({
        labels: history.map((h) => h.date),
        datasets: [
          {
            label: "Giá đóng cửa",
            data: history.map((h) => h.close),
            borderColor: "blue",
            fill: false,
          },
          {
            label: "MA20",
            data: ma20,
            borderColor: "orange",
            fill: false,
          },
        ],
      });
    }
    load();
  }, [ticker, range]);

  if (!chartData) return <p className="mt-4">Đang tải biểu đồ...</p>;

  return (
    <div className="mt-6">
      <h3 className="text-center font-semibold mb-2">📈 Biểu đồ {ticker}</h3>
      <Line data={chartData} />
    </div>
  );
}
