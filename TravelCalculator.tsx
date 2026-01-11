
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronLeft, MapPin, CalendarDays, Bike, Bus, Train, Plane } from 'lucide-react';
import { CarbonState, TransportMode } from '../types';
import { EMISSION_FACTORS } from '../constants';

interface Props {
  carbonState: CarbonState;
  setCarbonState: React.Dispatch<React.SetStateAction<CarbonState>>;
}

const TravelCalculator: React.FC<Props> = ({ carbonState, setCarbonState }) => {
  const navigate = useNavigate();
  const { mode, distanceKm, daysPerWeek } = carbonState.travel;

  const handleUpdate = (updates: Partial<typeof carbonState.travel>) => {
    setCarbonState(prev => ({
      ...prev,
      travel: { ...prev.travel, ...updates }
    }));
  };

  const dailyEmission = distanceKm * EMISSION_FACTORS.TRAVEL[mode];
  const monthlyEmission = dailyEmission * daysPerWeek * 4.3; // Avg weeks in month
  const yearlyEmission = monthlyEmission * 12;

  const transportIcons = {
    [TransportMode.CAR]: Car,
    [TransportMode.BIKE]: Bike,
    [TransportMode.BUS]: Bus,
    [TransportMode.TRAIN]: Train,
    [TransportMode.FLIGHT]: Plane,
  };

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
            <Car className="mr-3 text-blue-600" size={32} />
            Travel Calculator
          </h1>

          <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Primary Mode of Transport</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.values(TransportMode).map((m) => {
                  const Icon = transportIcons[m];
                  return (
                    <button
                      key={m}
                      onClick={() => handleUpdate({ mode: m })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${
                        mode === m 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-[10px] mt-2 font-bold uppercase">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance Input */}
            <div>
              <label className="flex items-center text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">
                <MapPin size={16} className="mr-2" />
                Avg Daily Distance (km)
              </label>
              <input 
                type="range"
                min="0"
                max="200"
                step="1"
                value={distanceKm}
                onChange={(e) => handleUpdate({ distanceKm: parseInt(e.target.value) || 0 })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-2 font-mono text-lg font-bold text-blue-600">
                <span>0 km</span>
                <span className="bg-blue-50 px-3 py-1 rounded-lg">{distanceKm} km</span>
                <span>200 km</span>
              </div>
            </div>

            {/* Frequency Input */}
            <div>
              <label className="flex items-center text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">
                <CalendarDays size={16} className="mr-2" />
                Travel Days Per Week
              </label>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleUpdate({ daysPerWeek: d })}
                    className={`w-10 h-10 rounded-full font-bold transition-all ${
                      daysPerWeek === d 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Side */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white h-full flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-8 opacity-80">Estimated Emission</h2>
            
            <div className="space-y-10">
              <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase mb-1">Daily Impact</p>
                  <p className="text-4xl font-black">{dailyEmission.toFixed(2)}</p>
                </div>
                <span className="text-slate-500 font-medium mb-1">kg CO2</span>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelCalculator;
