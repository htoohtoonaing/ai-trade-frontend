import { Candle, IndicatorData } from "../types";

export class MarketService {
  private lastClose = 1.085;
  private listeners: ((candle: Candle) => void)[] = [];
  private intervalId: number | null = null;

  public startStream(onCandle: (candle: Candle) => void) {
    this.listeners.push(onCandle);

    const history = this.generateHistory(50);
    history.forEach((c) => onCandle(c));

    if (!this.intervalId) {
      this.intervalId = window.setInterval(() => {
        const newCandle = this.generateNextCandle();
        this.listeners.forEach((l) => l(newCandle));
      }, 1000);
    }
  }

  public stopStream() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners = [];
  }

  private generateNextCandle(): Candle {
    const volatility = 0.0002;
    const change = (Math.random() - 0.5) * volatility;
    const open = this.lastClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 0.0001;
    const low = Math.min(open, close) - Math.random() * 0.0001;

    this.lastClose = close;

    return {
      time: Date.now(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000),
    };
  }

  private generateHistory(count: number): Candle[] {
    const history: Candle[] = [];
    let currentTime = Date.now() - count * 1000;

    for (let i = 0; i < count; i++) {
      const c = this.generateNextCandle();
      c.time = currentTime;
      history.push(c);
      currentTime += 1000;
    }

    return history;
  }

  public calculateIndicators(candles: Candle[]): IndicatorData {
    if (candles.length < 14) return { rsi: 50, sma: 0, ema: 0 };

    const closes = candles.map((c) => c.close);
    const recent = closes.slice(-14);

    let gains = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) gains++;
    }
    const rsi = 40 + Math.random() * 20 + gains * 1.5;

    const sum = recent.reduce((a, b) => a + b, 0);
    const sma = sum / recent.length;

    return {
      rsi: parseFloat(rsi.toFixed(2)),
      sma: parseFloat(sma.toFixed(5)),
      ema: parseFloat(sma.toFixed(5)),
    };
  }
}

export const marketService = new MarketService();
