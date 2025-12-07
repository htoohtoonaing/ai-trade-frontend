import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SignalDisplay } from "./components/SignalDisplay";
import { StatsPanel } from "./components/StatsPanel";
import { MarketChart } from "./components/MarketChart";
import { Candle, TradeSignal, SignalType, IndicatorData } from "./types";
import { marketService } from "./services/marketService";
import { Zap, Settings, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [pair, setPair] = useState("EURUSD_OTC");

  // ✅ FIX — timeframe only declared once
  const [timeframe, setTimeframe] = useState<"5s" | "10s" | "15s" | "1m">("5s");

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [currentSignal, setCurrentSignal] = useState<TradeSignal>({
    type: SignalType.HOLD,
    confidence: 0,
    pair: "EURUSD_OTC",
    timeframe: "5s",
    reason: "Waiting for signal...",
    timestamp: Date.now(),
  });

  const [indicators, setIndicators] = useState<IndicatorData>({
    rsi: 50,
    sma: 0,
    ema: 0,
  });

  // ─────────────────────────────────────────────
  // 🔥 Start mock market stream
  // ─────────────────────────────────────────────
  useEffect(() => {
    marketService.startStream((newCandle) => {
      setCandles((prev) => {
        const updated = [...prev, newCandle];
        if (updated.length > 100) updated.shift();

        setIndicators(marketService.calculateIndicators(updated));

        return updated;
      });
    });

    return () => marketService.stopStream();
  }, []);

  // ─────────────────────────────────────────────
  // 🔥 AI GENERATE SIGNAL (Backend + Local Mock)
  // ─────────────────────────────────────────────
  const handleGenerateSignal = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const url = `${API_BASE}/signal_api/signal?pair=${pair}&timeframe=${timeframe}`;

      const res = await fetch(url);
      const data = await res.json();

      const mappedType = (() => {
  const s = String(data.signal).toUpperCase();

  if (s.includes("BUY") || s.includes("LONG") || s.includes("UP"))
      return SignalType.BUY;

  if (s.includes("SELL") || s.includes("SHORT") || s.includes("DOWN"))
      return SignalType.SELL;

  return SignalType.HOLD;
})();

      setCurrentSignal({
        type: mappedType,
        confidence: data.confidence ?? 0,
        pair: data.pair ?? pair,
        timeframe: timeframe,
        reason: data.note ?? "",
        timestamp: Date.now(),
      });

      setIndicators((prev) => ({
        ...prev,
        rsi: data.rsi ?? prev.rsi,
      }));
    } catch (err) {
      console.log("Backend Error → using HOLD fallback.");

      setCurrentSignal((prev) => ({
        ...prev,
        type: SignalType.HOLD,
        confidence: 0,
        reason: "Backend offline or network issue.",
      }));
    }

    setIsAnalyzing(false);
  };

  // ─────────────────────────────────────────────
  // 🔥 Manual Pair Change
  // ─────────────────────────────────────────────
  const handleChangePair = () => {
    const p = window.prompt("Enter pair (e.g. EURUSD_OTC):", pair);
    if (!p) return;

    const newPair = p.trim();
    setPair(newPair);

    setCurrentSignal((prev) => ({
      ...prev,
      pair: newPair,
    }));
  };

  // ─────────────────────────────────────────────
  // 🔥 UI RENDER START
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-crypto-dark flex items-center justify-center text-white relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[420px] h-[100dvh] bg-black relative overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <Header />

          <div className="flex flex-col items-center">
            <SignalDisplay signal={currentSignal} isAnalyzing={isAnalyzing} />

            {/* Pair + Reason */}
            <div className="px-6 text-center text-xs mb-3">
              <p className="text-gray-400">
                Pair: <span className="text-blue-400">{pair}</span> • TF:{" "}
                {timeframe}
              </p>

              {!isAnalyzing && (
                <p className="text-blue-300 font-mono mt-1">
                  "{currentSignal.reason}"
                </p>
              )}
            </div>

            {/* Chart + Stats */}
            <MarketChart data={candles} />
            <StatsPanel confidence={currentSignal.confidence} indicators={indicators} />

            {/* 👉 Timeframe Selector */}
<div className="w-full px-6 mt-4 flex justify-center">
  <div className="inline-flex bg-black/60 border border-gray-800 rounded-full p-1 gap-1">
    {["5s", "10s", "15s", "1m"].map((tf) => (
      <button
        key={tf}
        onClick={() => {
          setTimeframe(tf as "5s" | "10s" | "15s" | "1m");
          setCurrentSignal(prev => ({ ...prev, timeframe: tf }));
        }}
        className={
          "px-3 py-1 rounded-full text-xs font-semibold transition-colors " +
          (timeframe === tf
            ? "bg-blue-500 text-white"
            : "bg-transparent text-gray-400 hover:bg-gray-800")
        }
      >
        {tf}
      </button>
    ))}
  </div>
</div>

            {/* Processing Log */}
            <div className="w-full px-6 mt-6">
              <div className="text-[10px] text-gray-500 font-mono">PROCESSING LOG</div>
              <div className="h-20 bg-black/50 rounded border border-gray-800 p-2 mt-1 text-[10px] font-mono text-green-400/80">
                <p>> Backend: {API_BASE || "NO VITE_API_URL SET"}</p>
                <p>> Pair: {pair} | TF: {timeframe}</p>
                {isAnalyzing ? (
                  <p className="animate-pulse">> Analyzing pattern vectors...</p>
                ) : (
                  <p>> Last signal: {currentSignal.type}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black pt-10 pb-6 px-4 flex flex-col gap-3">
          <button
            onClick={handleGenerateSignal}
            disabled={isAnalyzing || !API_BASE}
            className={`w-full py-4 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 ${
              isAnalyzing || !API_BASE
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Settings className="animate-spin" size={18} />
                PROCESSING...
              </>
            ) : (
              <>
                <Zap size={18} />
                AI GENERATION SIGNAL
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs">
              AI NEURAL SETTINGS
            </button>
            <button
              onClick={handleChangePair}
              className="py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs"
            >
              CHANGE PAIR
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 mt-2">
            <Lock size={8} />
            SSL Secured • Powered by Flask AI Engine
          </div>
        </div>
      </div>
    </div>
  );
}
