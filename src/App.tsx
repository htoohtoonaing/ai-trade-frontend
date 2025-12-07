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
  const [pair, setPair] = useState("EURUSD_OTC");
  const [timeframe, setTimeframe] = useState<"5s" | "10s" | "15s" | "1m">("5s");

  const [currentSignal, setCurrentSignal] = useState<TradeSignal>({
    type: SignalType.HOLD,
    confidence: 0,
    pair: "EURUSD_OTC",
    timeframe: "5s",
    reason: "Waiting for signal...",
    timestamp: Date.now(),
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorData>({
    rsi: 50,
    sma: 0,
    ema: 0,
  });

  // ----------------------------
  // Candle Stream
  // ----------------------------
  useEffect(() => {
    marketService.startStream((newCandle) => {
      setCandles((prev) => {
        const updated = [...prev, newCandle];
        if (updated.length > 120) updated.shift();

        setIndicators(marketService.calculateIndicators(updated));

        return updated;
      });
    });

    return () => marketService.stopStream();
  }, []);

  // ----------------------------
  // GENERATE SIGNAL
  // ----------------------------
  const handleGenerateSignal = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const url = `${API_BASE}/signal_api/signal?pair=${pair}&timeframe=${timeframe}`;
      const res = await fetch(url);
      const data = await res.json();

      const mappedType =
        data.signal === "BUY"
          ? SignalType.BUY
          : data.signal === "SELL"
          ? SignalType.SELL
          : SignalType.HOLD;

      setCurrentSignal({
        type: mappedType,
        confidence: data.confidence ?? 0,
        pair: data.pair ?? pair,
        timeframe: data.timeframe ?? timeframe,
        reason: data.note ?? "",
        timestamp: Date.now(),
      });

      setIndicators((prev) => ({ ...prev, rsi: data.rsi ?? prev.rsi }));
    } catch (err) {
      setCurrentSignal((prev) => ({
        ...prev,
        type: SignalType.HOLD,
        confidence: 0,
        reason: "Backend offline or network error.",
      }));
    }

    setIsAnalyzing(false);
  };

  // ----------------------------
  // CHANGE PAIR
  // ----------------------------
  const handleChangePair = () => {
    const p = window.prompt("Enter pair:", pair);
    if (p) {
      const cleaned = p.trim();
      setPair(cleaned);
      setCurrentSignal((prev) => ({ ...prev, pair: cleaned }));
    }
  };

  // ----------------------------
  // RENDER UI
  // ----------------------------
  return (
    <div className="min-h-screen w-full bg-crypto-dark flex items-center justify-center text-white relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/20"></div>

      {/* PHONE FRAME */}
      <div className="w-full max-w-[420px] h-[100dvh] bg-black md:rounded-[3rem] md:border-[8px] md:border-gray-800 overflow-hidden flex flex-col relative">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <Header />

          <div className="flex flex-col items-center">

            {/* MAIN SIGNAL DISPLAY */}
            <SignalDisplay signal={currentSignal} isAnalyzing={isAnalyzing} />

            {/* Pair & Timeframe info */}
            <div className="px-6 text-center h-10 mb-2">
              <p className="text-[11px] text-gray-400">
                Pair: <span className="text-blue-400">{pair}</span> • TF: {timeframe}
              </p>
              {!isAnalyzing && (
                <p className="text-[11px] text-blue-300 font-mono mt-1">
                  "{currentSignal.reason}"
                </p>
              )}
            </div>

            <MarketChart data={candles} />

            <StatsPanel confidence={currentSignal.confidence} indicators={indicators} />

            {/* ------------------------- */}
            {/* TIMEFRAME SELECTOR */}
            {/* ------------------------- */}
            <div className="w-full px-6 mt-4 flex justify-center">
              <div className="inline-flex bg-black/60 border border-gray-800 rounded-full p-1 gap-1">
                {["5s", "10s", "15s", "1m"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf as any);
                      setCurrentSignal((prev) => ({ ...prev, timeframe: tf }));
                    }}
                    className={
                      "px-3 py-1 rounded-full text-xs font-semibold " +
                      (timeframe === tf
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:bg-gray-800")
                    }
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* PROCESSING LOG */}
            <div className="w-full px-6 mt-6">
              <p>&gt; Backend: {API_BASE || "NO VITE_API_URL SET"}</p>
<p>&gt; Pair: {pair} | Timeframe: {timeframe}</p>
{isAnalyzing ? (
  <p className="animate-pulse">&gt; Analyzing pattern vectors...</p>
) : (
  <p>&gt; Last signal: {currentSignal.type}</p>
)}
                <p>> Pair: {pair} | Timeframe: {timeframe}</p>
                {isAnalyzing ? (
                  <p className="animate-pulse">> Analyzing pattern vectors...</p>
                ) : (
                  <p>> Last signal: {currentSignal.type}</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black pt-10 pb-6 px-4">

          <button
            onClick={handleGenerateSignal}
            disabled={isAnalyzing || !API_BASE}
            className={
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 " +
              (isAnalyzing || !API_BASE
                ? "bg-blue-900/50 text-blue-300 cursor-wait"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white")
            }
          >
            {isAnalyzing ? (
              <>
                <Settings className="animate-spin" size={18} /> PROCESSING DATA...
              </>
            ) : (
              <>
                <Zap size={18} /> AI GENERATION SIGNAL
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 mt-3">
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

          <div className="text-gray-600 text-[9px] flex items-center justify-center mt-2">
            <Lock size={8} />
            <span className="ml-1">SSL Secured • Powered by Flask AI Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
}
