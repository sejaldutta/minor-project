import React, { useState } from 'react';
import { 
  Home, Info, Settings, Mail, Beaker, Thermometer, 
  Droplet, Percent, Zap, Calculator, ChevronDown 
} from 'lucide-react';

export default function NanofluidDashboard() {
  // 1. STATE (Includes UI-only dropdown values)
  const [inputs, setInputs] = useState({
    nano_particle: "Al₂O₃/SiO₂", 
    base_fluid: "Water",         
    temperature: 40,
    volume_fraction: 1.0,
    density_np1: 3970,
    density_np2: 5810,
    density_bf: 997,
    volume: 1.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // 2. API CALL (Filtered to send only numerical data)
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

      // Destructure to separate UI-only values from backend values
      const { nano_particle, base_fluid, ...backendData } = inputs;

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.prediction);
      }      else {
  // 💡 This will tell you exactly what FastAPI didn't like
  alert("Error from Backend: " + JSON.stringify(data.detail || data.error));
}
    } catch (error) {
      console.error("Network/API Error:", error);
    } finally {
      setLoading(false);
    }

  };

  const nanoOptions = [
    "Al₂O₃/SiO₂", "TiO₂-SiO₂", "Fe₃O₄-MWCNT", "Al₂O₃-CNT", "Al₂O₃-MWCNT",
    "TiO₂-MgO", "MgO-MWCNT", "CuO-MWCNT", "Co₃O₄/rGO", "Ag-GNP",
    "ND-Fe₃O₄", "TiO₂-MWCNT", "CeO₂-MWCNT", "ZnO-MWCNT"
  ];

  const fluidOptions = [
    "Water", "20 – 70 °C", "GB (glycol-based)", "30 – 70 °C", 
    "DW (distilled water)", "16 – 70 °C", "W-EG 60:40%", "20 – 60 °C"
  ];

  return (
    <div className="min-h-screen bg-[#020b1f] text-slate-200 font-sans p-6 selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Droplet className="text-white fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nanofluid Density Predictor</h1>
            <p className="text-blue-400 text-sm">Predict. Analyze. Optimize.</p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto items-start">
        
        {/* INPUT SECTION (Spans 3 columns) */}
        <section className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold mb-8 flex items-center gap-2 text-blue-400">
            <Settings size={20}/> Configuration Parameters
          </h2>

          {/* DROPDOWNS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 border-b border-white/10 pb-10">
            <Dropdown 
              label="Nano Particle"
              options={nanoOptions}
              value={inputs.nano_particle}
              onChange={(val) => updateField('nano_particle', val)}
            />
            <Dropdown 
              label="Base Fluid"
              options={fluidOptions}
              value={inputs.base_fluid}
              onChange={(val) => updateField('base_fluid', val)}
            />
          </div>
          
          {/* SLIDERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 mb-10">
            <ControlSlider label="Temperature" icon={<Thermometer size={14}/>} value={inputs.temperature} min={0} max={100} step={1} unit="°C" onChange={(val) => updateField('temperature', val)} />
            <ControlSlider label="Vol. Concentration" icon={<Percent size={14}/>} value={inputs.volume_fraction} min={0} max={10} step={0.1} unit="%" onChange={(val) => updateField('volume_fraction', val)} />
            <ControlSlider label="Density NP1" icon={<Zap size={14}/>} value={inputs.density_np1} min={1000} max={8000} step={10} unit="kg/m³" onChange={(val) => updateField('density_np1', val)} />
            <ControlSlider label="Density NP2" icon={<Zap size={14}/>} value={inputs.density_np2} min={1000} max={8000} step={10} unit="kg/m³" onChange={(val) => updateField('density_np2', val)} />
            <ControlSlider label="Base Fluid Density" icon={<Droplet size={14}/>} value={inputs.density_bf} min={500} max={2000} step={1} unit="kg/m³" onChange={(val) => updateField('density_bf', val)} />
            <ControlSlider label="Volume" icon={<Beaker size={14}/>} value={inputs.volume} min={0.1} max={10} step={0.1} unit="L" onChange={(val) => updateField('volume', val)} />
          </div>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition-all rounded-lg font-bold text-white flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
          >
            <Calculator size={22}/> {loading ? "CALCULATING..." : "GENERATE PREDICTION"}
          </button>
        </section>

        {/* RESULTS SECTION (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-gradient-to-br from-blue-900/40 to-[#020b1f] border border-blue-500/20 rounded-xl p-12 text-center h-full flex flex-col justify-center items-center relative overflow-hidden min-h-[400px]">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-6 relative z-10">Predicted Density Result</p>
            
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-400 mb-4 relative z-10">
              {result !== null ? result.toFixed(2) : "--"}
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <p className="text-blue-300 text-lg font-medium tracking-wide">kg/m³</p>
              <div className="h-1 w-12 bg-blue-500/30 rounded-full mt-6"></div>
            </div>

            {result === null && !loading && (
              <p className="mt-8 text-xs text-slate-500 italic">Adjust parameters and click calculate to see results.</p>
            )}
          </section>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Summary</h3>
            <div className="space-y-3">
              <SummaryItem label="Particle" value={inputs.nano_particle} />
              <SummaryItem label="Fluid" value={inputs.base_fluid} />
              <SummaryItem label="Temp" value={`${inputs.temperature}°C`} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-blue-300 font-medium">{value}</span>
    </div>
  );
}

function Dropdown({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0a162e] border border-white/10 text-blue-100 py-3 px-4 rounded-lg appearance-none focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer text-sm shadow-inner"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0a162e]">{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400/50" size={16} />
      </div>
    </div>
  );
}

function ControlSlider({ label, icon, value, min, max, step, unit, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-wider">
          <span className="text-blue-400/70">{icon}</span> {label}
        </label>
        <span className="text-xs font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 shadow-sm">
          {value} {unit}
        </span>
      </div>
      <input 
        type="range" 
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-cyan-400 transition-all" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
    </div>
  );
}
