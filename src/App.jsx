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
  "Al₂O₃/SiO₂": { baseFluid: "Water", np1: 3970, np2: 2200 },
  "TiO₂-SiO₂": { baseFluid: "Water", np1: 4230, np2: 2200 },
  "Fe₃O₄-MWCNT": { baseFluid: "Water", np1: 5180, np2: 2100 },
  "ND-Fe₃O₄": { baseFluid: "W-EG (60:40%)", np1: 3100, np2: 5810 },
  "Ag-GNP (17:83)": { baseFluid: "Water", np1: 10490, np2: 2000 },
};

export default function NanofluidDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [graphData, setGraphData] = useState([]);
  
  const [inputs, setInputs] = useState({
    nano_particle: "Al₂O₃/SiO₂",
    base_fluid: "Water",
    temperature: 25,
    volume_fraction: 0.25,
    density_np1: 3970,
    density_np2: 2200,
    density_bf: 997.05,
    volume: 100.0, // Matches 'Total Volume Mixture'
  });

  useEffect(() => {
    const props = COMBINATION_DATA[inputs.nano_particle];
    if (props) {
      setInputs(prev => ({
        ...prev,
        density_np1: props.np1,
        density_np2: props.np2,
        base_fluid: props.baseFluid
      }));
    }
  }, [inputs.nano_particle]);

  const updateField = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // HELPER: Maps internal state to the exact keys the Backend expects
  const mapToBackend = (temp) => ({
    'Temperature (°C)': temp,
    'Volume Concentration (φ)': inputs.volume_fraction,
    'Density of Nano Particle 1 (ρnp)': inputs.density_np1,
    'Density of Nano Particle 2 (ρnp)': inputs.density_np2,
    'Density of Base Fluid (ρbf)': inputs.density_bf,
    'Total Volume Mixture': inputs.volume
  });

  const handleCalculate = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

    try {
      // 1. Single Prediction
      const payload = mapToBackend(inputs.temperature);
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) setResult(data.prediction);

      // 2. 20-Point Graph Prediction
      const tempRange = Array.from({ length: 20 }, (_, i) => 10 + i * 3.5); // 10°C to 80°C
      
      const graphRequests = tempRange.map(t => 
        fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mapToBackend(t)),
        }).then(r => r.json().then(d => ({ 
          temp: parseFloat(t.toFixed(1)), 
          density: d.prediction 
        })))
      );

      const results = await Promise.all(graphRequests);
      setGraphData(results.sort((a, b) => a.temp - b.temp));

    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to connect to ML backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] p-6 font-sans text-slate-700">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        <header className="bg-[#001e3c] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Beaker className="text-blue-300" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hybrid Nanofluid Density Predictor</h1>
              <p className="text-xs text-slate-400">Targeting ML API with ρnp & φ parameters</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${loading ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-spin' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-xs font-medium text-slate-200">{loading ? 'Computing Graph...' : 'System Ready'}</span>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 p-6">
          {/* INPUT PANEL */}
          <div className="col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-[#001e3c]" />
              <h2 className="font-bold text-[#001e3c] uppercase tracking-wider text-sm">Parameters</h2>
            </div>

            <section className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase">Selection</label>
              <select 
                value={inputs.nano_particle}
                onChange={(e) => updateField('nano_particle', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(COMBINATION_DATA).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </section>

            <section className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Volume Concentration (φ)</span>
                  <span className="text-blue-600 font-bold">{inputs.volume_fraction}</span>
                </div>
                <input type="range" min="0" max="2" step="0.01" value={inputs.volume_fraction} onChange={(e) => updateField('volume_fraction', parseFloat(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Temperature (°C)</span>
                  <span className="text-blue-600 font-bold">{inputs.temperature}°C</span>
                </div>
                <input type="range" min="10" max="90" step="1" value={inputs.temperature} onChange={(e) => updateField('temperature', parseInt(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] uppercase font-bold text-slate-400 absolute left-3 top-2">ρbf (Base Fluid)</label>
                  <input type="number" value={inputs.density_bf} onChange={(e) => updateField('density_bf', parseFloat(e.target.value))} className="w-full pt-6 pb-2 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative">
                  <label className="text-[9px] uppercase font-bold text-slate-400 absolute left-3 top-2">Total Volume</label>
                  <input type="number" value={inputs.volume} onChange={(e) => updateField('volume', parseFloat(e.target.value))} className="w-full pt-6 pb-2 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-[#001e3c] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#002b56] transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Activity className="animate-spin" size={18} /> : <Calculator size={18} />}
                {loading ? "FETCHING PREDICTIONS..." : "GENERATE ANALYSIS"}
              </button>
            </section>
          </div>

          {/* RESULTS PANEL */}
          <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-8 text-white flex flex-col justify-center items-center shadow-lg">
                <p className="text-xs font-light mb-1 opacity-70">Predicted Result (kg/m³)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black">{result ? result.toFixed(2) : "--"}</span>
                </div>
              </div>

              <div className="col-span-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
                <h2 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Info size={14} className="text-blue-600" /> API Mapping Info
                </h2>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">ρnp 1</span>
                    <span className="font-bold">{inputs.density_np1}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">ρnp 2</span>
                    <span className="font-bold">{inputs.density_np2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">φ (Conc)</span>
                    <span className="font-bold">{inputs.volume_fraction}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GRAPH AREA */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
              <h2 className="font-bold uppercase text-xs tracking-tight mb-6 flex items-center gap-2">
                <Activity size={16} className="text-blue-800" /> Density (ρ) vs Temperature (T) Trend
              </h2>
              <div className="h-64 w-full">
                {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="temp" tick={{fontSize: 10}} label={{ value: 'T (°C)', position: 'bottom', offset: 0, fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="density" stroke="#2563eb" strokeWidth={3} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                    Generate Analysis to see graph data
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
