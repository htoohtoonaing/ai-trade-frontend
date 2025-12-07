import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Candle } from '../types';

interface MarketChartProps {
  data: Candle[];
}

export const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  return (
    <div className="h-24 w-full opacity-30 mt-4 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />

          <Area
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorPrice)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
