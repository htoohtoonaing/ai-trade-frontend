import React from 'react';
import { ShieldCheck, Battery, Wifi, Menu, MoreVertical } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="w-full mb-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-2">
        <span>4:06</span>
        <div className="flex items-center gap-2">
          <Wifi size={12} />
          <Battery size={12} />
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button className="p-2 text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-bold font-mono tracking-wider text-white">
          AIGPT TRADE
        </h1>

        <button className="p-2 text-gray-400 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* STATUS BOX */}
      <div className="bg-crypto-card/50 backdrop-blur-md rounded-lg p-3 border border-gray-800 
          flex justify-between items-center text-[10px] font-mono mx-2">

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-crypto-accent">
            <ShieldCheck size={12} />
            <span>AI GPT TRADE BOT</span>
          </div>
          <div className="text-gray-400">
            Neural Network: <span className="text-white">Active</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-1 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>LIVE AI @ 1.289</span>
          </div>
          <div className="text-gray-400">94.7% Accuracy</div>
        </div>

      </div>
    </div>
  );
};
