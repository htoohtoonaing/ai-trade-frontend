import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="px-6 pt-4 pb-2 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-400">AI TRADING ASSISTANT</div>
        <div className="text-lg font-bold">AIGPT Trade Bot</div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-gray-400">Neural Status</span>
        <span className="text-[11px] text-green-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>
    </div>
  );
};
