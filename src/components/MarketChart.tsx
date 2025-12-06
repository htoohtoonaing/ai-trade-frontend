import React from "react";
import { Candle } from "../types";

interface MarketChartProps {
  data: Candle[];
}

export const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  return (
    <div className="w-full max-w-md px-4 mt-4">
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl h-32 flex items-center justify-center text-xs text-gray-500">
        {/* ပိုဖန်တီးချင်ရင် Recharts ထည့်ပြီး candlestick ခန့် later upgrade လုပ်လို့ရ */}
        {data.length === 0 ? "Live chart loading..." : "Live micro chart (demo)"}
      </div>
    </div>
  );
};
