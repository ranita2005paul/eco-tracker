
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-10 text-center lg:text-left mb-16 lg:mb-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                <Leaf size={14} className="mr-2" />
                Sustainability for Everyone
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
                Track, Understand, and <span className="text-emerald-600">Reduce</span> Your Emissions
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0">
                A simple, science-based tool to calculate your personal carbon footprint and discover actionable ways to lead a greener life.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <Link to="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center">
                  Start Tracking Free
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <a href="#about" className="bg-white border-2 border-slate-100 hover:border-emerald-100 px-8 py-4 rounded-xl font-bold text-lg text-slate-700 transition-all flex items-center justify-center">
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Nature" 
                  className="w-full object-cover aspect-video lg:aspect-square"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-50 rounded-full blur-3xl opacity-80"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why Calculate Your Footprint?</h2>
            <p className="text-lg text-slate-600">Understanding your personal impact is the first step toward environmental stewardship. EcoTrack makes data accessible and actionable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Impact</h3>
              <p className="text-slate-600">Small individual changes contribute to significant global carbon reduction. See where you stand compared to global averages.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Feedback</h3>
              <p className="text-slate-600">Our real-time calculator gives you immediate results for travel, electricity, and household fuel usage.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Data</h3>
              <p className="text-slate-600">We use scientifically backed emission factors (IPCC, IEA standards) to ensure your tracking is as accurate as possible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-6">
            <Leaf size={24} className="fill-current" />
            <span className="text-xl font-bold">EcoTrack</span>
          </div>
          <p>© 2024 EcoTrack Sustainability Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
