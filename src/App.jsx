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

  // ✅ STATE FOR RESULT
  const [result, setResult] = useState(null);

  // ✅ API CALL FUNCTION
  const handleCalculate = async () => {
    try {
      const res = await fetch("http://localhost:10000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: 40,
          volume_fraction: 1.0,
          density_np1: 3970,
          density_np2: 5810,
          density_bf: 997,
          volume: 1.0,
        }),
      });

      const data = await res.json();
      setResult(data.prediction);

    } catch (error) {
      console.error("API Error:", error);
    }
  };

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
          <button className="flex items-center gap-2 hover:text-blue-400"><Home size={18}/> Home</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Info size={18}/> About</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Settings size={18}/> How It Works</button>
          <button className="flex items-center gap-2 hover:text-blue-400"><Mail size={18}/> Contact</button>
        </nav>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* INPUT SECTION */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">

          <div className="grid grid-cols-2 gap-6 mb-8">
            <ControlSlider label="Temperature (°C)" icon={<Thermometer size={14}/>} val="40" unit="°C" />
            <ControlSlider label="Volume Concentration" icon={<Percent size={14}/>} val="1.0" unit="%" />
            <ControlSlider label="Density NP1" icon={<Zap size={14}/>} val="3970" unit="kg/m³" />
            <ControlSlider label="Density NP2" icon={<Zap size={14}/>} val="5810" unit="kg/m³" />
            <ControlSlider label="Base Fluid Density" icon={<Droplet size={14}/>} val="997" unit="kg/m³" />
            <ControlSlider label="Volume" icon={<Beaker size={14}/>} val="1.0" unit="L" />
          </div>

          {/* ✅ BUTTON CONNECTED */}
          <button 
            onClick={handleCalculate}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg font-bold text-white flex items-center justify-center gap-2"
          >
            <Calculator size={20}/> CALCULATE DENSITY
          </button>
        </section>

        {/* RESULT SECTION */}
        <div className="space-y-6">

          <section className="bg-gradient-to-br from-blue-900 to-[#020b1f] rounded-xl p-8 text-center">
            <Droplet className="text-blue-400 mx-auto mb-2"/>
            <p className="text-sm text-slate-400">Predicted Density</p>

            {/* ✅ DYNAMIC RESULT */}
            <div className="text-6xl font-black my-2">
              {result ? result.toFixed(2) : "--"}
            </div>

            <p className="text-blue-300">kg/m³</p>
          </section>

          {/* GRAPH */}
          <section className="bg-white/5 rounded-xl p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temp"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="density"/>
              </LineChart>
            </ResponsiveContainer>
          </section>

        </div>
      </main>
    </div>
  );
}

// COMPONENTS

function ControlSlider({ label, icon, val, unit }) {
  return (
    <div>
      <label className="text-xs">{icon} {label}</label>
      <div className="flex gap-2">
        <input type="range" className="flex-1"/>
        <span>{val} {unit}</span>
      </div>
    </div>
  );
}