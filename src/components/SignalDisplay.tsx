import React from "react";
import { TrendingUp, TrendingDown, Minus, BrainCircuit } from "lucide-react";
import { SignalType, TradeSignal } from "../types";

interface SignalDisplayProps {
  signal: TradeSignal;
  isAnalyzing: boolean;
}

export const SignalDisplay: React.FC<SignalDisplayProps> = ({
  signal,
  isAnalyzing,
}) => {
  const getSignalColor = () => {
    if (isAnalyzing)
      return "text-blue-400 border-blue-500 shadow-blue-500/50";
    if (signal.type === SignalType.BUY)
      return "text-crypto-accent border-crypto-accent shadow-crypto-accent/50";
    if (signal.type === SignalType.SELL)
      return "text-crypto-danger border-crypto-danger shadow-crypto-danger/50";
    return "text-gray-400 border-gray-500 shadow-gray-500/20";
  };

  const getGlowClass = () => {
    if (isAnalyzing)
      return "shadow-[0_0_50px_rgba(59,130,246,0.4)]";
    if (signal.type === SignalType.BUY)
      return "shadow-[0_0_60px_rgba(0,255,157,0.4)]";
    if (signal.type === SignalType.SELL)
      return "shadow-[0_0_60px_rgba(255,0,85,0.4)]";
    return "";
  };

  const getStatusText = () => {
    if (isAnalyzing) return "AI PROCESSING...";
    return signal.type;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      <div className="text-center mb-6">
        <h2 className="text-gray-400 text-sm font-semibold">
          Signal for:{" "}
          <span className="text-blue-400 font-bold">{signal.pair}</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Timeframe: {signal.timeframe}
        </p>
      </div>

      <div
        className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-500 ${getSignalColor()} ${getGlowClass()}`}
      >
        <div
          className={`absolute inset-0 rounded-full border-2 border-dashed opacity-50 animate-spin-slow ${
            isAnalyzing ? "border-blue-500" : "border-current"
          }`}
        ></div>

        <div className="transform scale-150 transition-all duration-300">
          {isAnalyzing ? (
            <BrainCircuit size={48} className="animate-pulse text-blue-400" />
          ) : (
            <>
              {signal.type === SignalType.BUY && (
                <TrendingUp size={64} strokeWidth={3} />
              )}
              {signal.type === SignalType.SELL && (
                <TrendingDown size={64} strokeWidth={3} />
              )}
              {signal.type === SignalType.HOLD && (
                <Minus size={64} strokeWidth={3} />
              )}
            </>
          )}
        </div>

        {!isAnalyzing && (
          <div className="absolute bottom-8 text-xs font-bold uppercase tracking-widest opacity-80">
            {signal.type === SignalType.BUY
              ? "UPWARD"
              : signal.type === SignalType.SELL
              ? "DOWNWARD"
              : "NEUTRAL"}
          </div>
        )}
      </div>

      <div
        className={`mt-6 text-2xl font-black tracking-widest transition-colors duration-300 ${
          isAnalyzing
            ? "text-blue-400 animate-pulse"
            : signal.type === SignalType.BUY
            ? "text-crypto-accent"
            : signal.type === SignalType.SELL
            ? "text-crypto-danger"
            : "text-gray-400"
        }`}
      >
        {getStatusText()}
      </div>
    </div>
  );
};
