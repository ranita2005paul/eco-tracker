
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Share2, Download, Leaf, Loader2, Sparkles, TrendingDown } from 'lucide-react';
import { CarbonState, EmissionSummary } from '../types';
import { EMISSION_FACTORS } from '../constants';
import { getPersonalizedAdvice } from '../services/geminiService';

interface Props {
  carbonState: CarbonState;
}

const Summary: React.FC<Props> = ({ carbonState }) => {
  const [advice, setAdvice] = useState<any[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(true);

  const travelMonthly = (carbonState.travel.distanceKm * EMISSION_FACTORS.TRAVEL[carbonState.travel.mode] * carbonState.travel.daysPerWeek * 4.3);
  const electricityMonthly = (carbonState.electricity.monthlyKwh * EMISSION_FACTORS.ELECTRICITY);
  const lpgMonthly = (carbonState.lpg.cylindersPerYear * EMISSION_FACTORS.LPG) / 12;
  const totalMonthly = travelMonthly + electricityMonthly + lpgMonthly;

  const summary: EmissionSummary = {
    travel: travelMonthly,
    electricity: electricityMonthly,
    lpg: lpgMonthly,
    total: totalMonthly
  };

  const chartData = [
    { name: 'Travel', value: parseFloat(travelMonthly.toFixed(2)), color: '#3b82f6' },
    { name: 'Electricity', value: parseFloat(electricityMonthly.toFixed(2)), color: '#f59e0b' },
    { name: 'LPG', value: parseFloat(lpgMonthly.toFixed(2)), color: '#ef4444' }
  ];

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      const res = await getPersonalizedAdvice(summary);
      setAdvice(res);
      setLoadingAdvice(false);
    };
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Impact Analysis</h1>
          <p className="text-slate-500">Visualizing your carbon footprint contributions.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <Share2 size={18} />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-200">
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        {/* Total Metric Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Current Monthly Total</p>
          <p className="text-6xl font-black text-emerald-600 mb-2">{totalMonthly.toFixed(1)}</p>
          <p className="text-slate-500 font-medium">kg CO2 / Month</p>
          <div className="mt-8 flex items-center justify-center space-x-2 text-emerald-700 bg-emerald-50 py-2 rounded-xl">
            <TrendingDown size={18} />
            <span className="font-bold text-sm">~{(totalMonthly * 12 / 1000).toFixed(2)} Tons Yearly</span>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Contribution Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Comparison Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Comparison (Average Monthly)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'You', val: totalMonthly },
                { name: 'India Avg', val: 158 },
                { name: 'Global Avg', val: 375 },
              ]}
              layout="vertical"
              margin={{ left: 20, right: 30, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="val" radius={[0, 8, 8, 0]}>
                 <Cell fill="#10b981" />
                 <Cell fill="#94a3b8" />
                 <Cell fill="#cbd5e1" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendations */}
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 flex flex-col">
          <div className="flex items-center space-x-2 text-emerald-800 mb-6">
            <Sparkles className="fill-current" size={24} />
            <h2 className="text-xl font-bold">Smart Reduction Plan</h2>
          </div>
          
          <div className="flex-1 space-y-4">
            {loadingAdvice ? (
              <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-medium">Analyzing your footprint with Gemini...</p>
              </div>
            ) : (
              advice.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block mb-2">{item.category}</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{item.tip}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-emerald-100 text-center">
            <p className="text-emerald-700 text-sm italic">"The greatest threat to our planet is the belief that someone else will save it." — Robert Swan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
