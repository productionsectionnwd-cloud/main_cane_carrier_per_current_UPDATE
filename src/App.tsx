import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Cpu,
  Factory
} from 'lucide-react';
import { parseData, bucketData, DataPoint, BucketData } from './utils/dataProcessor';

const COLORS = {
  carrier: '#3b82f6', // blue-500
  leveller: '#10b981', // emerald-500
  cutter1: '#f59e0b', // amber-500
  cutter2: '#ef4444', // red-500
  kicker: '#8b5cf6', // violet-500
};

export default function App() {
  const data = useMemo(() => parseData(), []);
  const bucketedData = useMemo(() => bucketData(data), [data]);

  const stats = useMemo(() => {
    const totalTcd = data.reduce((acc, curr) => acc + curr.tcd, 0);
    const avgFiber = data.reduce((acc, curr) => acc + curr.fiber, 0) / data.length;
    const maxTcd = Math.max(...data.map(d => d.tcd));
    return { totalTcd, avgFiber, maxTcd, count: data.length };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Factory className="w-8 h-8 text-blue-600" />
            Cane Crush Analysis
          </h1>
          <p className="text-slate-500 mt-1">Industrial Performance & Efficiency Dashboard</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="px-4 py-1 border-r border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Days</p>
            <p className="text-lg font-bold text-slate-700">{stats.count}</p>
          </div>
          <div className="px-4 py-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Fiber %</p>
            <p className="text-lg font-bold text-slate-700">{stats.avgFiber.toFixed(2)}%</p>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Cane Crushed" 
          value={stats.totalTcd.toLocaleString()} 
          unit="TCD" 
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Max Crushing Rate" 
          value={stats.maxTcd.toLocaleString()} 
          unit="TCD" 
          icon={<Activity className="w-5 h-5" />}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Avg Carrier Efficiency" 
          value={(stats.totalTcd / data.reduce((a, b) => a + b.carrierCurrent, 0)).toFixed(2)} 
          unit="TCD/A" 
          icon={<Zap className="w-5 h-5" />}
          color="bg-amber-500"
        />
        <StatCard 
          title="System Load" 
          value="Optimal" 
          unit="Status" 
          icon={<Cpu className="w-5 h-5" />}
          color="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Efficiency Chart */}
        <ChartContainer title="TCD Per Current Efficiency (By TCD Range)" description="Higher values indicate better crushing efficiency per Ampere.">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={bucketedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="range" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="tcdPerCarrier" name="Carrier" fill={COLORS.carrier} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tcdPerLeveller" name="Leveller" fill={COLORS.leveller} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tcdPerCutter1" name="Cutter 1" fill={COLORS.cutter1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tcdPerCutter2" name="Cutter 2" fill={COLORS.cutter2} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tcdPerKicker" name="Kicker" fill={COLORS.kicker} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Trend Chart */}
        <ChartContainer title="Crushing Trend Over Time" description="Daily TCD variations across the recorded period.">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTcd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={Math.floor(data.length / 6)}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="tcd" name="TCD" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTcd)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Cutter Comparison */}
        <ChartContainer title="Cutter 1 vs Cutter 2 Efficiency" description="Comparison of TCD/A between the two side cutters.">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bucketedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="tcdPerCutter1" name="Cutter 1" stroke={COLORS.cutter1} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="tcdPerCutter2" name="Cutter 2" stroke={COLORS.cutter2} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Kicker & Leveller */}
        <ChartContainer title="Auxiliary Load Analysis" description="Efficiency of Side Cane Kicker and Cane Leveller.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bucketedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="tcdPerLeveller" name="Leveller" fill={COLORS.leveller} radius={[4, 4, 0, 0]} />
              <Bar dataKey="tcdPerKicker" name="Kicker" fill={COLORS.kicker} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 Sugar Factory Operations Analysis • Real-time Data Visualization</p>
        <p className="mt-2">
          Created by <a href="https://arkarsoe-profolio-showcase.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">AKS_Tech Channel</a>
        </p>
      </footer>
    </div>
  );
}

function StatCard({ title, value, unit, icon, color }: { title: string, value: string, unit: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-2 rounded-lg text-white`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function ChartContainer({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}
