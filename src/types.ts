export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export enum SignalType {
  BUY = "BUY (LONG)",
  SELL = "SELL (SHORT)",
  HOLD = "NEUTRAL",
  WAIT = "ANALYZING",
}

export interface TradeSignal {
  type: SignalType;
  confidence: number;
  pair: string;
  timeframe: string;
  reason: string;
  timestamp: number;
}

export interface IndicatorData {
  rsi: number;
  sma: number;
  ema: number;
}
