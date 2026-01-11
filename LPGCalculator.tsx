
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronLeft } from 'lucide-react';
import { CarbonState } from '../types';
import { EMISSION_FACTORS } from '../constants';

interface Props {
  carbonState: CarbonState;
  setCarbonState: React.Dispatch<React.SetStateAction<CarbonState>>;
}

const LPGCalculator: React.FC<Props> = ({ carbonState, setCarbonState }) => {
  const navigate = useNavigate();
  const { cylindersPerYear } = carbonState.lpg;

  const handleUpdate = (val: number) => {
    setCarbonState(prev => ({
      ...prev,
      lpg: { cylindersPerYear: val }
    }));
  };

  const yearlyEmission = cylindersPerYear * EMISSION_FACTORS.LPG;
  const monthlyEmission = yearlyEmission / 12;

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
            <Flame className="mr-3 text-red-500" size={32} />
            Cooking Fuel (LPG)
          </h1>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-10">
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-8 tracking-wider">Cylinders Consumed Per Year</label>
              <div className="flex flex-wrap gap-3">
                {[4, 6, 8, 10, 12, 14, 16, 18, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleUpdate(num)}
                    className={`px-6 py-4 rounded-2xl font-black text-xl transition-all border ${
                      cylindersPerYear === num 
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-400 mb-2">Or enter manual count:</label>
                <input 
                  type="number"
                  value={cylindersPerYear || ''}
                  onChange={(e) => handleUpdate(parseInt(e.target.value) || 0)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xl font-bold text-red-600"
                />
              </div>
            </div>

            <div className="p-6 bg-red-50 rounded-2xl">
              <p className="text-red-700 text-sm leading-relaxed">
                One standard 14.2kg LPG cylinder produces approximately <strong>42kg of CO2</strong> when fully combusted.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white h-full flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-8 opacity-80">LPG Emission Impact</h2>
            
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
                  <p className="text-4xl font-black">{yearlyEmission.toFixed(2)}</p>
                </div>
                <span className="text-slate-500 font-medium mb-1">kg CO2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPGCalculator;
