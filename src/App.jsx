import React, { useState } from 'react';
import { 
  Home, Info, Settings, Mail, Beaker, Thermometer, 
  Droplet, Percent, Cpu, Target, Zap, Shield, Calculator 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const data = [
  { temp: 20, density: 1063 },
  { temp: 30, density: 1045 },
  { temp: 40, density: 1025 },
  { temp: 50, density: 1005 },
  { temp: 60, density: 985 },
  { temp: 70, density: 965 },
];

export default function NanofluidDashboard() {
  return (
    <div className="min-h-screen bg-[#020b1f] text-slate-200 font-sans p-6 selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full flex items-center justify-center">
            <Droplet className="text-white fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nanofluid Density Predictor</h1>
            <p className="text-blue-400 text-sm">Predict. Analyze. Optimize.</p>
          </div>
        </div>
        <nav className="flex items-center gap-6 bg-blue-900/20 backdrop-blur-md px-6 py-2 rounded-full border border-blue-500/20">
          <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Home size={18} /> Home</button>
          <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Info size={18} /> About</button>
          <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Settings size={18} /> How It Works</button>
          <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Mail size={18} /> Contact</button>
        </nav>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: INPUTS */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4 text-blue-400">
            <Settings size={20} />
            <h2 className="uppercase font-bold tracking-wider">Input Parameters</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm flex items-center gap-2"><Cpu size={14}/> 1. Nano Particle Combination</label>
              <select className="w-full bg-[#0a1631] border border-white/20 rounded p-2 outline-none focus:border-blue-500">
                <option>Al2O3 - MWCNT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm flex items-center gap-2"><Droplet size={14}/> 2. Base Fluid</label>
              <select className="w-full bg-[#0a1631] border border-white/20 rounded p-2 outline-none focus:border-blue-500">
                <option>Water</option>
              </select>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <ControlSlider label="3. Temperature (°C)" icon={<Thermometer size={14}/>} val="40" unit="°C" />
            <ControlSlider label="4. Volume Concentration (φ)" icon={<Percent size={14}/>} val="1.00" unit="%" sub="Range: 0 - 2%" />
            <ControlSlider label="5. Density of Nano Particle 1" icon={<Zap size={14}/>} val="3970" unit="kg/m³" sub="Range: 1000 to 10000 kg/m³" />
            <ControlSlider label="6. Density of Nano Particle 2" icon={<Zap size={14}/>} val="5810" unit="kg/m³" sub="Range: 1910 to 5810 kg/m³" />
            <ControlSlider label="7. Density of Base Fluid (pbf)" icon={<Droplet size={14}/>} val="997" unit="kg/m³" sub="Range: 977 to 1063 kg/m³" />
            <ControlSlider label="8. Total Volume Mixture" icon={<Beaker size={14}/>} val="1.000" unit="L" sub="Enter total volume of mixture" />
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2">
            <Calculator size={20} /> CALCULATE DENSITY
          </button>

          <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-300 text-sm flex items-center gap-3">
             <div className="bg-blue-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">i</div>
             Note: Volume Concentration (φ) should be between 0% and 2%.
          </div>
        </section>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-6">
          {/* Result Card */}
          <section className="bg-gradient-to-br from-blue-900 to-[#020b1f] border border-white/10 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="p-8 text-center relative z-10">
              <div className="flex justify-center mb-2"><Droplet className="text-blue-400" /></div>
              <p className="text-sm uppercase tracking-widest text-slate-400">Predicted Density of Nanofluid</p>
              <div className="text-6xl font-black my-2">1052.34</div>
              <p className="text-blue-300 text-xl font-light italic">kg/m³</p>
            </div>
            <div className="bg-green-500/10 border-t border-white/10 p-4 flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1"><Zap size={12} className="text-white"/></div>
              <div className="text-xs">
                <p className="text-green-400 font-bold">Prediction completed successfully</p>
                <p className="text-slate-400">Results are based on AI model trained with experimental data.</p>
              </div>
            </div>
          </section>

          {/* Graph Section */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
             <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <h3 className="flex items-center gap-2 text-blue-400 font-bold"><Zap size={18}/> OUTPUT GRAPH</h3>
                <select className="bg-white/10 text-xs p-1 rounded border border-white/10">
                   <option>Density vs. Temperature</option>
                </select>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="temp" stroke="#94a3b8" fontSize={12} label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[960, 1080]} label={{ value: 'Density (kg/m³)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                    <Line type="monotone" dataKey="density" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </section>

          {/* Tables Section */}
          <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="flex items-center gap-2 text-blue-400 font-bold text-sm"><Beaker size={18}/> AVAILABLE BASE FLUIDS</h3>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-blue-600/50 text-white">
                  <tr>
                    <th className="p-3 font-medium">Base Fluid</th>
                    <th className="p-3 font-medium">Temperature Range (°C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <TableRow icon={<Droplet size={14} className="text-blue-400"/>} name="Water" range="20 - 70 °C" />
                  <TableRow icon={<Beaker size={14} className="text-green-400"/>} name="GB (glycol-based)" range="30 - 70 °C" />
                  <TableRow icon={<Droplet size={14} className="text-purple-400"/>} name="DW (distilled water)" range="16 - 70 °C" />
                </tbody>
             </table>
          </section>
        </div>
      </main>

      {/* FOOTER FEATURES */}
      <footer className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-white/10">
        <FooterItem icon={<Cpu className="text-blue-400"/>} title="AI-Powered Prediction" desc="Advanced machine learning model for accurate results." />
        <FooterItem icon={<Target className="text-blue-400"/>} title="High Accuracy" desc="Trained on extensive experimental data." />
        <FooterItem icon={<Zap className="text-blue-400"/>} title="Fast & Reliable" desc="Get instant results within seconds." />
        <FooterItem icon={<Shield className="text-blue-400"/>} title="For Research & Industry" desc="Designed for engineers and innovators." />
      </footer>
    </div>
  );
}

function ControlSlider({ label, icon, val, unit, sub }) {
  return (
    <div className="space-y-2">
      <label className="text-xs flex items-center gap-2 text-slate-400">{icon} {label}</label>
      <div className="flex items-center gap-3">
        <input type="range" className="flex-1 accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
        <div className="flex items-center bg-[#0a1631] border border-white/20 rounded px-2 py-1 min-w-[70px]">
          <span className="text-sm font-mono flex-1 text-right">{val}</span>
          <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
        </div>
      </div>
      {sub && <p className="text-[10px] text-blue-400/70">{sub}</p>}
    </div>
  );
}

function TableRow({ icon, name, range }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-3 flex items-center gap-3">{icon} {name}</td>
      <td className="p-3 text-green-400 font-mono">{range}</td>
    </tr>
  );
}

function FooterItem({ icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="p-3 bg-white/5 rounded-lg h-fit">{icon}</div>
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}