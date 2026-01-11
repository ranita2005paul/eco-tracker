
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronLeft, Lightbulb } from 'lucide-react';
import { CarbonState } from '../types';
import { EMISSION_FACTORS } from '../constants';

interface Props {
  carbonState: CarbonState;
  setCarbonState: React.Dispatch<React.SetStateAction<CarbonState>>;
}

const ElectricityCalculator: React.FC<Props> = ({ carbonState, setCarbonState }) => {
  const navigate = useNavigate();
  const { monthlyKwh } = carbonState.electricity;

  const handleUpdate = (val: number) => {
    setCarbonState(prev => ({
      ...prev,
      electricity: { monthlyKwh: val }
    }));
  };

  const monthlyEmission = monthlyKwh * EMISSION_FACTORS.ELECTRICITY;
  const yearlyEmission = monthlyEmission * 12;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-slate-500 hover:text-emerald-600 transition-colors mb-6"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <Zap className="mr-3 text-amber-500" size={32} />
            Electricity Calculator
          </h1>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-10">
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-6 tracking-wider">Monthly Units Consumed (kWh)</label>
              <input 
                type="number"
                value={monthlyKwh || ''}
                onChange={(e) => handleUpdate(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full text-5xl font-black text-amber-600 outline-none border-b-4 border-slate-50 focus:border-amber-400 transition-colors pb-2"
              />
              <p className="mt-4 text-slate-400 text-sm italic">Find this value on your monthly utility bill.</p>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 text-sm mb-1 uppercase tracking-tight">Pro Tip</h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    A typical Indian household consumes roughly 150-250 kWh per month. Cooling and water heating often account for 50% of usage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white h-full flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-8 opacity-80">Energy Impact</h2>
            
            <div className="space-y-10">
              <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase mb-1">Monthly Impact</p>
                  <p className="text-4xl font-black">{monthlyEmission.toFixed(2)}</p>
                </div>
                <span className="text-slate-500 font-medium mb-1">kg CO2</span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase mb-1">Annual Impact</p>
                  <p className="text-4xl font-black">{(yearlyEmission / 1000).toFixed(2)}</p>
                </div>
                <span className="text-slate-500 font-medium mb-1">Tons CO2</span>
              </div>

              <div className="pt-8">
                <div className="bg-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-3">
                    <span>Low Impact</span>
                    <span>High Impact</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500" 
                      style={{ width: `${Math.min((monthlyKwh / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-4 italic">Usage relative to typical high-consumption baseline (500kWh)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityCalculator;
