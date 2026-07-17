"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartData, DailyCount } from "./actions";

type Window = 7 | 30 | 90;

function mergeDays(
  signups: DailyCount[],
  posts: DailyCount[],
  dau: DailyCount[],
  days: number
): { date: string; signups: number; posts: number; dau: number }[] {
  const map = new Map<string, { signups: number; posts: number; dau: number }>();

  // Fill every day so there are no gaps in the chart
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { signups: 0, posts: 0, dau: 0 });
  }

  signups.forEach((r) => map.has(r.date) && (map.get(r.date)!.signups = r.count));
  posts.forEach((r) => map.has(r.date) && (map.get(r.date)!.posts = r.count));
  dau.forEach((r) => map.has(r.date) && (map.get(r.date)!.dau = r.count));

  return Array.from(map.entries()).map(([date, vals]) => ({
    date: date.slice(5), // MM-DD
    ...vals,
  }));
}

export default function Charts({ data }: { data: ChartData }) {
  const [window, setWindow] = useState<Window>(30);
  const merged = mergeDays(data.signupsPerDay, data.postsPerDay, data.dauPerDay, window);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-app)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Activity trends
        </h2>
        <div className="flex gap-1">
          {([7, 30, 90] as Window[]).map((w) => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                window === w
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
              }`}
            >
              {w}d
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#064E3B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#064E3B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gDau" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(merged.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="signups"
            name="Signups"
            stroke="#064E3B"
            strokeWidth={2}
            fill="url(#gSignups)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="posts"
            name="Posts"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#gPosts)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="dau"
            name="DAU"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gDau)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
