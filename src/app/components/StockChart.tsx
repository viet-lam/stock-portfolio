/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import { calcMA } from "../lib/calc";
import { getHistory } from "../lib/api";

let chartInstance: Chart | null = null;

export default function StockChart({ ticker, range = "3mo" }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function load() {
     if (!canvasRef.current) return; // ✅ kiểm tra null

      const history = await getHistory(ticker, range);
      const labels = history.map((p) => p.date.toLocaleDateString());
      const prices = history.map((p) => p.close);
      const ma20 = calcMA(history, 20);

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: `${ticker} Close`,
              data: prices,
              borderColor: "blue",
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
            {
              label: "MA20",
              data: ma20,
              borderColor: "orange",
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "top" } },
          scales: { x: { ticks: { maxTicksLimit: 10 } } },
        },
      });
    }
    load();
  }, [ticker, range]);

  return <canvas ref={canvasRef} id="priceChart" />;
}
