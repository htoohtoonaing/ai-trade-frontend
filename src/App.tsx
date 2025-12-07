import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SignalDisplay } from "./components/SignalDisplay";
import { StatsPanel } from "./components/StatsPanel";
import { MarketChart } from "./components/MarketChart";
import { marketService } from "./services/marketService";
import { Candle, TradeSignal, SignalType, IndicatorData } from "./types";
import { Zap, Settings, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ---------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------
export default function App() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [pair, setPair] = useState<string>("EURUSD_OTC");
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

  // ---------------------------------------------------
  // MOCK LIVE STREAM (chart animation)
  // ---------------------------------------------------
  useEffect(() => {
    marketService.startStream((candle) => {
      setCandles((prev) => {
        const updated = [...prev, candle];
        if (updated.length > 100) updated.shift();
        setIndicators(marketService.calculateIndicators(updated));
        return updated;
      });
    });
    return () => marketService.stopStream();
  }, []);

  // ---------------------------------------------------
  // GENERATE SIGNAL FROM BACKEND
  // ---------------------------------------------------
  const handleGenerateSignal = async () => {
    if (!API_BASE) {
      alert("❌ No backend API found! Set VITE_API_URL in .env");
      return;
    }

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

      setIndicators((prev) => ({
        ...prev,
        rsi: data.rsi ?? prev.rsi,
      }));
    } catch (err) {
      setCurrentSignal((prev) => ({
        ...prev,
        type: SignalType.HOLD,
        confidence: 0,
        reason: "Backend offline or unreachable.",
      }));
    }

    setIsAnalyzing(false);
  };

  // ---------------------------------------------------
  // CHANGE PAIR
  // ---------------------------------------------------
  const handleChangePair = () => {
    const p = window.prompt("Enter pair (ex: EURUSD_OTC):", pair);
    if (p) {
      setPair(p.trim());
      setCurrentSignal((prev) => ({ ...prev, pair: p.trim() }));
    }
  };

  // ---------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-crypto-dark flex items-center justify-center text-white relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/20"></div>

      <div className="w-full max-w-[420px] h-[100dvh] bg-black md:rounded-[3rem] md:border-[8px] md:border-gray-800 overflow-hidden shadow-2xl flex flex-col">

        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <Header />

          <div className="flex flex-col items-center">

            {/* SIGNAL DISPLAY */}
            <SignalDisplay signal={currentSignal} isAnalyzing={isAnalyzing} />

            {/* Pair + TF info */}
            <div className="px-6 text-center h-10 mb-2">
              <p className="text-[11px] text-gray-400">
                Pair: <span className="text-blue-400">{pair}</span> • TF: {timeframe}
              </p>

              {!isAnalyzing && currentSignal.reason && (
                <p className="text-[11px] text-blue-300 font-mono mt-1">
                  "{currentSignal.reason}"
                </p>
              )}
            </div>

            {/* Chart */}
            <MarketChart data={candles} />

            {/* Stats */}
            <StatsPanel confidence={currentSignal.confidence} indicators={indicators} />

            {/* TIMEFRAME SELECTOR */}
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
              <div className="text-[10px] text-gray-500 font-mono mb-1">PROCESSING LOG</div>

              <div className="h-20 bg-black/50 rounded border border-gray-800 p-2 font-mono text-[10px] text-green-400/80 leading-tight">
                <p>> Backend: {API_BASE || "NO VITE_API_URL SET"}</p>
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

        {/* FOOTER BUTTONS */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black pt-10 pb-6 px-4">
          
          <button
            onClick={handleGenerateSignal}
            disabled={isAnalyzing || !API_BASE}
            className={`w-full py-4 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 ${
              isAnalyzing || !API_BASE
                ? "bg-blue-900/50 text-blue-300"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
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

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button className="py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300">
              AI NEURAL SETTINGS
            </button>

            <button
              onClick={handleChangePair}
              className="py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300"
            >
              CHANGE PAIR
            </button>
          </div>

          <div className="flex justify-center mt-2 text-[9px] text-gray-600">
            <Lock size={8} />
            &nbsp; SSL Secured • Powered by Flask AI Engine
          </div>
        </div>

      </div>
    </div>
  );
}
