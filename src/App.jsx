import React, { useState, useEffect } from 'react';
import { 
  Beaker, Settings, Activity, Info, Download, Lock, 
  Droplets, CircleDot, PieChart 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const COMBINATION_DATA = {
  "Ag-GNP (17:83)": { baseFluid: "Water", np1: 10490, np2: 2000 },
  "ND-Fe3O4 (28:72)": { baseFluid: "W-EG (60:40%)", np1: 3100, np2: 5810 },
  "Co3O4/rGO (80:20)": { baseFluid: "Water", np1: 6110, np2: 1910 },
  "TiO2-MgO (20:80)": { baseFluid: "DW (Distilled Water)", np1: 4320, np2: 3580 },
  "Fe3O4-MWCNT (74:26)": { baseFluid: "Water", np1: 5810, np2: 2100 }
};

export default function NanofluidDashboard() {
  const [combination, setCombination] = useState("Ag-GNP (17:83)");
  const [concentration, setConcentration] = useState(0.25);
  const [temperature, setTemperature] = useState(25);
  const [baseDensity, setBaseDensity] = useState(997.05);
  
  // New states for API data
  const [prediction, setPrediction] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeProps = COMBINATION_DATA[combination];

  // Helper to format payload exactly as required by backend
  const createPayload = (temp) => ({
    'Temperature (°C)': temp,
    'Volume Concentration (φ)': concentration,
    'Density of Nano Particle 1 (ρnp)': activeProps.np1,
    'Density of Nano Particle 2 (ρnp)': activeProps.np2,
    'Density of Base Fluid (ρbf)': baseDensity,
    'Total Volume Mixture': 100
  });

  const handlePredict = async () => {
    setIsLoading(true);
    // Sanitize API URL to prevent double slashes
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/$/, "");
    const endpoint = `${baseUrl}/predict`;

    try {
      // 1. Fetch single prediction
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload(temperature))
      });
      const data = await res.json();
      setPrediction(data.prediction);

      // 2. Fetch graph data (16°C to 70°C)
      const temps = Array.from({ length: 10 }, (_, i) => 16 + i * 6);
      const graphResults = await Promise.all(temps.map(async (t) => {
        const gRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload(t))
        });
        const gData = await gRes.json();
        return { temp: t, density: gData.prediction };
      }));
      
      setGraphData(graphResults);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run prediction on initial load
  // useEffect(() => {
  //   handlePredict();
  // }, [combination]); // Re-run when combination changes to keep UI in sync

  return (
    <div className="min-h-screen bg-[#f0f4f9] p-6 font-sans text-slate-700">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#001e3c] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Beaker className="text-blue-300" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hybrid Nanofluid Density Predictor</h1>
              <p className="text-xs text-slate-400">Predict density of nanofluid with two nanoparticles using ML model</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0a2a4d] px-3 py-1.5 rounded-full border border-green-500/30">
            <div className={`w-2 h-2 rounded-full bg-green-500 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="text-xs font-medium text-green-400">{isLoading ? 'Syncing...' : 'ML Model Active'}</span>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 p-6">
          
          {/* LEFT: INPUT PARAMETERS */}
          <div className="col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-[#001e3c]" />
              <h2 className="font-bold text-[#001e3c] uppercase tracking-wider text-sm">Input Parameters</h2>
            </div>

            <section className="space-y-4">
              <label className="block text-sm font-semibold">1. Select Nanoparticle Combination</label>
              <select 
                value={combination}
                onChange={(e) => setCombination(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.keys(COMBINATION_DATA).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </section>

            <section className="space-y-4">
              <label className="block text-sm font-semibold">2. Auto-filled Properties (Read Only)</label>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">Base Fluid</label>
                <input readOnly value={activeProps.baseFluid} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">NP1 Density (kg/m³)</label>
                  <input readOnly value={activeProps.np1} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">NP2 Density (kg/m³)</label>
                  <input readOnly value={activeProps.np2} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative w-full">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">Volume Mixture</label>
                  <input readOnly value={100} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <label className="block text-sm font-semibold">3. User Inputs</label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1 text-slate-600">Volume Concentration (%) <Info size={12}/></span>
                  <span className="bg-white border px-2 py-1 rounded font-mono text-blue-600 font-bold">{concentration.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="0.5" step="0.01" value={concentration} onChange={(e) => setConcentration(parseFloat(e.target.value))} className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1 text-slate-600">Temperature (°C) <Info size={12}/></span>
                  <span className="bg-white border px-2 py-1 rounded font-mono text-blue-600 font-bold">{temperature}</span>
                </div>
                <input type="range" min="16" max="70" step="1" value={temperature} onChange={(e) => setTemperature(parseInt(e.target.value))} className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-500 absolute left-3 top-2">Base Fluid Density (kg/m³)</label>
                <input type="number" step="0.01" value={baseDensity} onChange={(e) => setBaseDensity(parseFloat(e.target.value))} className="w-full pt-6 pb-2 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none" />
              </div>

              <button onClick={handlePredict} disabled={isLoading} className="w-full bg-[#001e3c] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#002b56] transition-colors shadow-lg disabled:opacity-50">
                <Beaker size={18} />
                {isLoading ? 'Processing...' : 'Predict Density'}
              </button>
            </section>
          </div>

          {/* RIGHT: RESULTS & GRAPHS */}
          <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 text-white flex items-center justify-center relative overflow-hidden shadow-lg border border-blue-400/20">
                <div className="absolute -left-4 -bottom-4 opacity-10"><Beaker size={120} /></div>
                <div className="text-center z-10">
                  <p className="text-sm font-light mb-2">Predicted Density of Nanofluid</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold tracking-tighter">{prediction ? prediction.toFixed(2) : '--'}</span>
                    <span className="text-xl font-medium opacity-80">kg/m³</span>
                  </div>
                  <p className="mt-4 text-[11px] opacity-70">at {concentration.toFixed(2)}% concentration and {temperature}°C</p>
                </div>
              </div>

              <div className="col-span-2 border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-blue-800" />
                  <h2 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Combination Summary</h2>
                </div>
                {[
                  { label: 'Combination', val: combination, icon: <Beaker size={14}/> },
                  { label: 'Base Fluid', val: activeProps.baseFluid, icon: <Droplets size={14}/> },
                  { label: 'NP1 Density', val: `${activeProps.np1}`, icon: <CircleDot size={14}/> },
                  { label: 'NP2 Density', val: `${activeProps.np2}`, icon: <CircleDot size={14}/> },
                  { label: 'Mixture Ratio', val: '100% (Fixed)', icon: <PieChart size={14}/> },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-blue-600">{item.icon}</span>
                      {item.label}
                    </div>
                    <span className="font-semibold text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-[420px]">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-blue-800" />
                  <h2 className="font-bold uppercase text-sm tracking-tight">Density Trend</h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-slate-400">Plot Density</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="trend" defaultChecked className="accent-blue-600" /> vs Temperature
                    </label>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="temp" tick={{fontSize: 11}} label={{ value: 'Temperature (°C)', position: 'bottom', offset: -5, fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 11}} label={{ value: 'Density (kg/m³)', angle: -90, position: 'insideLeft', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="density" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-blue-50/50 p-4 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[11px] text-blue-800/70 font-medium">
            <Info size={14} />
            <span>Note: Values are fetched directly from the ML Backend for accuracy.</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 bg-white hover:bg-blue-50 transition-all shadow-sm">
            <Download size={14} />
            Download Report
          </button>
        </footer>
      </div>
    </div>
  );
}
