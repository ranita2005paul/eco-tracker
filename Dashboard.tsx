
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Zap, 
  Flame, 
  ArrowRight,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { CarbonState, UserProfile } from '../types';
import { EMISSION_FACTORS } from '../constants';

interface DashboardProps {
  user: UserProfile;
  carbonState: CarbonState;
}

const Dashboard: React.FC<DashboardProps> = ({ user, carbonState }) => {
  // Quick calculations for the dashboard view
  const travelMonthly = (carbonState.travel.distanceKm * EMISSION_FACTORS.TRAVEL[carbonState.travel.mode] * carbonState.travel.daysPerWeek * 4.3);
  const electricityMonthly = (carbonState.electricity.monthlyKwh * EMISSION_FACTORS.ELECTRICITY);
  const lpgMonthly = (carbonState.lpg.cylindersPerYear * EMISSION_FACTORS.LPG) / 12;
  const totalMonthly = travelMonthly + electricityMonthly + lpgMonthly;

  const NavCard = ({ to, title, icon: Icon, value, unit, colorClass }: any) => (
    <Link to={to} className="group block bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={24} />
        </div>
        <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
      </div>
      <h3 className="text-slate-500 font-medium mb-1">{title}</h3>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-slate-900">{value.toFixed(1)}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </Link>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name} 👋</h1>
        <p className="text-slate-500">Track your progress and discover ways to reduce your environmental impact.</p>
      </header>

      {/* Main Stats Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <NavCard 
          to="/travel"
          title="Travel Emissions"
          icon={Car}
          value={travelMonthly}
          unit="kg CO2/mo"
          colorClass="bg-blue-50 text-blue-600"
        />
        <NavCard 
          to="/electricity"
          title="Electricity Usage"
          icon={Zap}
          value={electricityMonthly}
          unit="kg CO2/mo"
          colorClass="bg-amber-50 text-amber-600"
        />
        <NavCard 
          to="/lpg"
          title="Household Fuel (LPG)"
          icon={Flame}
          value={lpgMonthly}
          unit="kg CO2/mo"
          colorClass="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Total Summary Mini-View */}
        <div className="lg:col-span-2 bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold opacity-90 mb-6">Total Footprint Summary</h2>
            <div className="flex items-baseline space-x-2 mb-8">
              <span className="text-6xl font-black">{(totalMonthly / 1000).toFixed(2)}</span>
              <span className="text-xl font-medium opacity-80">Tons CO2 / Year (Est)</span>
            </div>
            <Link to="/summary" className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
              View Detailed Analysis
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
          <Leaf className="absolute -bottom-10 -right-10 text-emerald-500 opacity-20" size={240} strokeWidth={1} />
        </div>

        {/* Quick Tips */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 mb-6">
            <Leaf size={20} />
            <h2 className="text-lg font-bold">Quick Tip</h2>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <p className="text-emerald-800 font-medium italic">"Switching to energy-efficient appliances can reduce your household emissions by over 15% annually."</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Did you know?</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Average Indian per-capita carbon footprint is roughly 1.9 tons per year, while the global average is around 4.5 tons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
