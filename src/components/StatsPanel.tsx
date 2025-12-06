import React from "react";
import { IndicatorData } from "../types";

interface StatsPanelProps {
  confidence: number;
  indicators: IndicatorData;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  confidence,
  indicators,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 px-2 mt-4 w-full max-w-md">
      <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-green-400 font-bold tracking-wider">
          DATA POINTS
        </span>
        <span className="text-xl font-mono text-white mt-1">—</span>
      </div>

      <div className="bg-gray-900/80 border border-blue-900/50 rounded-lg p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10"></div>
        <span className="text-[10px] text-blue-400 font-bold tracking-wider relative z-10">
          RSI (14)
        </span>
        <span className="text-xl font-mono text-white mt-1 relative z-10">
          {indicators.rsi.toFixed(1)}
        </span>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-orange-400 font-bold tracking-wider">
          CONFIDENCE
        </span>
        <span className="text-xl font-mono text-white mt-1">
          {confidence}%
        </span>
      </div>

      <div className="col-span-3 mt-2 px-2 flex justify-between items-center text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-gray-400">SIGNAL STRENGTH</span>
          <div className="flex gap-1">
            <div
              className={`w-2 h-4 rounded-sm ${
                confidence > 20 ? "bg-green-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`w-2 h-4 rounded-sm ${
                confidence > 40 ? "bg-green-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`w-2 h-4 rounded-sm ${
                confidence > 60 ? "bg-green-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`w-2 h-4 rounded-sm ${
                confidence > 80 ? "bg-green-500" : "bg-gray-700"
              }`}
            ></div>
            <div className="text-white ml-2 font-mono">
              {(confidence / 20).toFixed(0)}/5
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-gray-400">AI STATUS</span>
          <div className="flex items-center justify-end gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
