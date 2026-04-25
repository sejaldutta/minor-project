import React, { useState } from 'react';
import { 
  Home, Info, Settings, Mail, Beaker, Thermometer, 
  Droplet, Percent, Zap, Calculator 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock data for the chart
const chartData = [
  { temp: 20, density: 1063 },
  { temp: 30, density: 1045 },
  { temp: 40, density: 1025 },
  { temp: 50, density: 1005 },
  { temp: 60, density: 985 },
  { temp: 70, density: 965 },
];

export default function NanofluidDashboard() {
  // 1. Unified state for all API inputs
  const [inputs, setInputs] = useState({
    temperature: 40,
    volume_fraction: 1.0,
    density_np1: 3970,
    density_np2: 5810,
    density_bf: 997,
    volume: 1.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Update handler for sliders
  const updateField = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 3. API Call using the current state
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:10000";

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs), // Automatically sends all slider values
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data.prediction);
      } else {
        console.error("Server Error:", data);
      }
    } catch (error) {
      console.error("Network/API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b1f] text-slate-200 font-sans p-6 selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full flex items-center justify-center">
            <Droplet className="text-white fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nanofluid Density Predictor</h1>
            <p className="text-blue-400 text-sm">Predict. Analyze. Optimize.</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 bg-blue-900/20 backdrop-blur-md px-6 py-2 rounded-full border border-blue-500/20 text-sm">
          <button className="flex items-center gap-2 hover:text-blue-400"><Home size={16}/> Home</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Info size={16}/> About</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Settings size={16}/> Logic</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Mail size={16}/> Contact</button>
        </nav>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* INPUT SECTION */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-400">
            <Settings size={20}/> Input Parameters
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <ControlSlider 
              label="Temperature" icon={<Thermometer size={14}/>} 
              value={inputs.temperature} min={0} max={100} step={1} unit="°C"
              onChange={(val) => updateField('temperature', val)} 
            />
            <ControlSlider 
              label="Volume Fraction" icon={<Percent size={14}/>} 
              value={inputs.volume_fraction} min={0} max={10} step={0.1} unit="%"
              onChange={(val) => updateField('volume_fraction', val)} 
            />
            <ControlSlider 
              label="Density NP1" icon={<Zap size={14}/>} 
              value={inputs.density_np1} min={1000} max={8000} step={10} unit="kg/m³"
              onChange={(val) => updateField('density_np1', val)} 
            />
            <ControlSlider 
              label="Density NP2" icon={<Zap size={14}/>} 
              value={inputs.density_np2} min={1000} max={8000} step={10} unit="kg/m³"
              onChange={(val) => updateField('density_np2', val)} 
            />
            <ControlSlider 
              label="Base Fluid Density" icon={<Droplet size={14}/>} 
              value={inputs.density_bf} min={500} max={2000} step={1} unit="kg/m³"
              onChange={(val) => updateField('density_bf', val)} 
            />
            <ControlSlider 
              label="Volume" icon={<Beaker size={14}/>} 
              value={inputs.volume} min={0.1} max={10} step={0.1} unit="L"
              onChange={(val) => updateField('volume', val)} 
            />
          </div>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition-all rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Calculator size={20}/> {loading ? "PROCESSING..." : "CALCULATE DENSITY"}
          </button>
        </section>

        {/* RESULT & GRAPH SECTION */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-blue-900/40 to-[#020b1f] border border-blue-500/20 rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <Droplet className="text-blue-400 mx-auto mb-2 animate-pulse"/>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-medium">Predicted Density</p>

            <div className="text-7xl font-black my-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-400">
              {result !== null ? result.toFixed(2) : "--"}
            </div>

            <p className="text-blue-300 font-medium">kg/m³</p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 text-slate-400 uppercase tracking-wider">Density vs Temperature Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="temp" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="density" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// REUSABLE CONTROL COMPONENT
function ControlSlider({ label, icon, value, min, max, step, unit, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
          {icon} {label}
        </label>
        <span className="text-xs font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
          {value} {unit}
        </span>
      </div>
      <input 
        type="range" 
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-cyan-400 transition-all" 
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
    </div>
  );
}
