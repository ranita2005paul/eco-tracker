
import React, { useState, useEffect } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  Car, 
  Zap, 
  Flame, 
  PieChart, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TravelCalculator from './pages/TravelCalculator';
import ElectricityCalculator from './pages/ElectricityCalculator';
import LPGCalculator from './pages/LPGCalculator';
import Summary from './pages/Summary';
import Auth from './pages/Auth';
import AITools from './pages/AITools';

import { CarbonState, TransportMode, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eco_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [carbonState, setCarbonState] = useState<CarbonState>(() => {
    const saved = localStorage.getItem('carbon_data');
    return saved ? JSON.parse(saved) : {
      travel: { mode: TransportMode.CAR, distanceKm: 0, daysPerWeek: 5 },
      electricity: { monthlyKwh: 0 },
      lpg: { cylindersPerYear: 0 }
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eco_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eco_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('carbon_data', JSON.stringify(carbonState));
  }, [carbonState]);

  const handleLogout = () => {
    setUser(null);
    setIsSidebarOpen(false);
  };

  const SidebarLink = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {user && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen p-6">
              <div className="flex items-center space-x-2 text-emerald-600 mb-10 px-2">
                <Leaf className="fill-current" />
                <span className="text-xl font-bold tracking-tight">EcoTrack</span>
              </div>
              
              <nav className="flex-1 space-y-1">
                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink to="/ai-tools" icon={Sparkles} label="AI Tools" badge="New" />
                <SidebarLink to="/travel" icon={Car} label="Travel" />
                <SidebarLink to="/electricity" icon={Zap} label="Electricity" />
                <SidebarLink to="/lpg" icon={Flame} label="LPG" />
                <SidebarLink to="/summary" icon={PieChart} label="My Impact" />
              </nav>

              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Leaf size={24} className="fill-current" />
                <span className="text-lg font-bold">EcoTrack</span>
              </div>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </header>

            {/* Mobile Overlay Navigation */}
            {isSidebarOpen && (
              <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}>
                <nav 
                  className="bg-white w-64 h-full p-6 pt-20 flex flex-col"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink to="/ai-tools" icon={Sparkles} label="AI Tools" badge="New" />
                    <SidebarLink to="/travel" icon={Car} label="Travel" />
                    <SidebarLink to="/electricity" icon={Zap} label="Electricity" />
                    <SidebarLink to="/lpg" icon={Flame} label="LPG" />
                    <SidebarLink to="/summary" icon={PieChart} label="My Impact" />
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        <main className={`flex-1 w-full ${user ? 'pt-20 md:pt-0' : ''}`}>
          <Routes>
            <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!user ? <Auth onLogin={setUser} /> : <Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={user ? <Dashboard user={user} carbonState={carbonState} /> : <Navigate to="/" />} />
            <Route path="/ai-tools" element={user ? <AITools carbonState={carbonState} setCarbonState={setCarbonState} /> : <Navigate to="/" />} />
            <Route path="/travel" element={user ? <TravelCalculator carbonState={carbonState} setCarbonState={setCarbonState} /> : <Navigate to="/" />} />
            <Route path="/electricity" element={user ? <ElectricityCalculator carbonState={carbonState} setCarbonState={setCarbonState} /> : <Navigate to="/" />} />
            <Route path="/lpg" element={user ? <LPGCalculator carbonState={carbonState} setCarbonState={setCarbonState} /> : <Navigate to="/" />} />
            <Route path="/summary" element={user ? <Summary carbonState={carbonState} /> : <Navigate to="/" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
