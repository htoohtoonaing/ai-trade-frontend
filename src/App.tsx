import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SignalDisplay } from "./components/SignalDisplay";
import { StatsPanel } from "./components/StatsPanel";
import { MarketChart } from "./components/MarketChart";
import { marketService } from "./services/marketService";
import { Candle, TradeSignal, SignalType, IndicatorData } from "./types";
import { Zap, Settings, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [pair, setPair] = useState<string>("EURUSD_OTC");
  const [timeframe] = useState<string>("5s");

  const [currentSignal, setCurrentSignal] = useState<TradeSignal>({
    type: SignalType.HOLD,
    confidence: 0,
    pair,
    timeframe,
    reason: "Waiting for signal...",
    timestamp: Date.now(),
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorData>({
    rsi: 50,
    sma: 0,
    ema: 0,
  });

  useEffect(() => {
    marketService.startStream((newCandle) => {
      setCandles((prev) => {
        const updated = [...prev, newCandle];
        if (updated.length > 100) updated.shift();
        const ind = marketService.calculateIndicators(updated);
        setIndicators((prevInd) => ({ ...prevInd, ...ind }));
        return updated;
      });
    });

    return () => marketService.stopStream();
  }, []);

  const handleGenerateSignal = async () => {
    if (isAnalyzing || !API_BASE) return;

    setIsAnalyzing(true);

    try {
      const url = `${API_BASE}/signal_api/signal?pair=${encodeURIComponent(
        pair
      )}&timeframe=${encodeURIComponent(timeframe)}`;

      const res = await fetch(url);
      const data = await res.json();

      const mappedType =
        data.signal === "BUY"
          ? SignalType.BUY
          : data.signal === "SELL"
          ? SignalType.SELL
          : SignalType.HOLD;

      const newSignal: TradeSignal = {
        type: mappedType,
        confidence: data.confidence ?? 0,
        pair: data.pair ?? pair,
        timeframe: data.timeframe ?? timeframe,
        reason: data.note ?? "",
        timestamp: Date.now(),
      };

      setCurrentSignal(newSignal);

      setIndicators((prev) => ({
        ...prev,
        rsi: data.rsi ?? prev.rsi,
      }));
    } catch (err) {
      console.error("Signal error:", err);
      setCurrentSignal((prev) => ({
        ...prev,
        type: SignalType.HOLD,
        confidence: 0,
        reason: "Backend offline or network error.",
      }));
    }

    setIsAnalyzing(false);
  };

  const handleChangePair = () => {
    const p = window.prompt(
      "Enter pair (e.g. EURUSD_OTC, GBPUSD_OTC):",
      pair
    );
    if (p) {
      const trimmed = p.trim();
      setPair(trimmed);
      setCurrentSignal((prev) => ({
        ...prev,
        pair: trimmed,
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-crypto-dark flex items-center justify-center font-sans text-white relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-[420px] h-[100dvh] md:h-[90vh] md:max-h-[850px] bg-black md:rounded-[3rem] md:border-[8px] md:border-gray-800 relative overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <Header />

          <div className="flex flex-col items-center">
            <SignalDisplay
              signal={currentSignal}
              isAnalyzing={isAnalyzing}
            />

            <div className="px-6 text-center h-10 mb-2 flex flex-col justify-center">
              <p className="text-[11px] text-gray-400">
                Pair:{" "}
                <span className="text-blue-400 font-bold">{pair}</span> • TF:{" "}
                {timeframe}
              </p>
              {!isAnalyzing && currentSignal.reason && (
                <p className="text-[11px] text-blue-300 font-mono mt-1">
                  "{currentSignal.reason}"
                </p>
              )}
            </div>

            <MarketChart data={candles} />

            <StatsPanel
              confidence={currentSignal.confidence}
              indicators={indicators}
            />

            <div className="w-full px-6 mt-6">
              <div className="text-[10px] text-gray-500 font-mono mb-1">
                PROCESSING LOG
              </div>
              <div className="h-20 bg-black/50 rounded border border-gray-800 p-2 font-mono text-[10px] text-green-400/80 overflow-hidden leading-tight">
                <p>&gt; Backend: {API_BASE || "NO VITE_API_URL SET"}</p>
                <p>
                  &gt; Pair: {pair} | Timeframe: {timeframe}
                </p>
                {isAnalyzing ? (
                  <p className="animate-pulse">
                    &gt; Analyzing pattern vectors...
                  </p>
                ) : (
                  <p>&gt; Last signal: {currentSignal.type}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-6 px-4 flex flex-col gap-3 z-20">
          <button
            onClick={handleGenerateSignal}
            disabled={isAnalyzing || !API_BASE}
            className={`w-full py-4 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              isAnalyzing || !API_BASE
                ? "bg-blue-900/50 text-blue-300 cursor-wait"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Settings className="animate-spin" size={18} />
                PROCESSING DATA...
              </>
            ) : (
              <>
                <Zap size={18} />
                AI GENERATION SIGNAL
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-xs font-semibold text-gray-300 transition-colors">
              AI NEURAL SETTINGS
            </button>
            <button
              onClick={handleChangePair}
              className="py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-xs font-semibold text-gray-300 transition-colors"
            >
              CHANGE PAIR
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 mt-2">
            <Lock size={8} />
            <span>SSL Secured & Encrypted • Powered by Flask AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
