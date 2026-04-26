import React, { useState, useEffect } from 'react';
import { 
  Beaker, Settings, Activity, Info, Download, Lock, 
  Droplets, CircleDot, PieChart, Calculator 
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [graphData, setGraphData] = useState([]);
  
  // State for inputs
  const [combination, setCombination] = useState("Ag-GNP (17:83)");
  const [concentration, setConcentration] = useState(0.25);
  const [temperature, setTemperature] = useState(25);
  const [baseDensity, setBaseDensity] = useState(997.05);
  const [totalVolume, setTotalVolume] = useState(100.0);

  const activeProps = COMBINATION_DATA[combination];

  // Map to the specific Backend Keys requested
  const mapToBackend = (temp) => ({
    'Temperature (°C)': temp,
    'Volume Concentration (φ)': concentration,
    'Density of Nano Particle 1 (ρnp)': activeProps.np1,
    'Density of Nano Particle 2 (ρnp)': activeProps.np2,
    'Density of Base Fluid (ρbf)': baseDensity,
    'Total Volume Mixture': totalVolume
  });

  const handlePredict = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

    try {
      // 1. Single Prediction for the Main Card
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapToBackend(temperature)),
      });
      const data = await res.json();
      if (res.ok) setResult(data.prediction);

      // 2. Generate 10-point Graph Data (Range 16°C to 70°C)
      const graphPoints = Array.from({ length: 10 }, (_, i) => 16 + i * 6);
      
      const graphRequests = graphPoints.map(t => 
        fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mapToBackend(t)),
        }).then(r => r.json().then(d => ({ temp: t, density: d.prediction })))
      );

      const results = await Promise.all(graphRequests);
      setGraphData(results.sort((a, b) => a.temp - b.temp));

    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] p-6 font-sans text-slate-700">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#001e3c] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Beaker className="text-blue-300" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hybrid Nanofluid Density Predictor</h1>
              <p className="text-xs text-slate-400">ML-Powered Real-time Analysis</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${loading ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-spin' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-xs font-medium text-slate-200">{loading ? 'Computing...' : 'ML Model Active'}</span>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 p-6">
          {/* LEFT: INPUTS */}
          <div className="col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-[#001e3c]" />
              <h2 className="font-bold text-[#001e3c] uppercase tracking-wider text-sm">Input Parameters</h2>
            </div>

            <section className="space-y-4">
              <label className="block text-sm font-semibold text-slate-600">1. Nanoparticle Combination</label>
              <select 
                value={combination}
                onChange={(e) => setCombination(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(COMBINATION_DATA).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </section>

            <section className="space-y-4">
              <label className="block text-sm font-semibold text-slate-600">2. Auto-filled (Read Only)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">Base Fluid</label>
                  <input readOnly value={activeProps.baseFluid} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">ρnp 1</label>
                  <input readOnly value={activeProps.np1} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">ρnp 2</label>
                  <input readOnly value={activeProps.np2} className="w-full pt-6 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <label className="block text-sm font-semibold text-slate-600">3. Interactive Controls</label>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Concentration (φ)</span>
                  <span className="text-blue-600 font-bold">{concentration}%</span>
                </div>
                <input type="range" min="0" max="0.5" step="0.01" value={concentration} onChange={(e) => setConcentration(parseFloat(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Temperature (°C)</span>
                  <span className="text-blue-600 font-bold">{temperature}°C</span>
                </div>
                <input type="range" min="16" max="70" step="1" value={temperature} onChange={(e) => setTemperature(parseInt(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">ρbf (Base Fluid Density)</label>
                <input type="number" value={baseDensity} onChange={(e) => setBaseDensity(parseFloat(e.target.value))} className="w-full pt-6 pb-2 px-3 border border-slate-200 rounded-lg text-sm" />
              </div>

              <button 
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-[#001e3c] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#002b56] transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Activity className="animate-spin" size={18} /> : <Beaker size={18} />}
                PREDICT DENSITY
              </button>
            </section>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 text-white flex flex-col justify-center items-center shadow-lg">
                <p className="text-sm font-light mb-1 opacity-80">Predicted Density</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black">{result !== null ? result.toFixed(2) : "--"}</span>
                  <span className="text-xl opacity-80">kg/m³</span>
                </div>
              </div>

              <div className="col-span-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
                <h2 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Info size={14} className="text-blue-600" /> Properties Summary
                </h2>
                {[
                  { label: 'NP1 ρ', val: activeProps.np1, icon: <CircleDot size={14}/> },
                  { label: 'NP2 ρ', val: activeProps.np2, icon: <CircleDot size={14}/> },
                  { label: 'Temp', val: `${temperature}°C`, icon: <PieChart size={14}/> },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-xs border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-500 flex items-center gap-2">{item.icon} {item.label}</span>
                    <span className="font-bold text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-[400px]">
              <h2 className="font-bold uppercase text-sm mb-6 flex items-center gap-2">
                <Activity size={18} className="text-blue-800" /> Density Trend vs Temperature
              </h2>
              <div className="h-64 w-full">
                {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="temp" tick={{fontSize: 11}} label={{ value: 'T (°C)', position: 'bottom', offset: 0, fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 11}} />
                      <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="density" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                    Click "Predict Density" to view graph trend
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
