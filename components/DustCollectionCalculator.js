import React, { useState } from 'react';
import {
  initialState,
  componentOptions,
  cycloneOptions,
  filterOptions,
  materialTypes,
} from '../utils/constants';
import {
  calculateTotalStaticPressure,
  calculateFinalCFM,
  getVelocity,
} from '../utils/calculations';

const DustCollectionCalculator = () => {
  const [components, setComponents] = useState([{ ...initialState.component }]);
  const [pipes, setPipes] = useState([{ length: '', diameter: '6' }]);
  const [flexHoses, setFlexHoses] = useState([{ length: '', diameter: '6' }]);
  const [material, setMaterial] = useState('metal');
  const [diameter, setDiameter] = useState('6');
  const [cyclone, setCyclone] = useState('none');
  const [filter, setFilter] = useState('none');
  const [fanChart, setFanChart] = useState([{ sp: '', cfm: '' }]);
  const [showFanChartHelp, setShowFanChartHelp] = useState(false);
  const [result, setResult] = useState(null);

  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  const addComponent = () => {
    setComponents([...components, { ...initialState.component }]);
  };

  const removeComponent = (index) => {
    const updated = components.filter((_, i) => i !== index);
    setComponents(updated);
  };

  const handlePipeChange = (index, field, value) => {
    const updated = [...pipes];
    updated[index][field] = value;
    setPipes(updated);
  };

  const addPipe = () => {
    setPipes([...pipes, { length: '', diameter: '6' }]);
  };

  const handleFlexHoseChange = (index, field, value) => {
    const updated = [...flexHoses];
    updated[index][field] = value;
    setFlexHoses(updated);
  };

  const addFlexHose = () => {
    setFlexHoses([...flexHoses, { length: '', diameter: '6' }]);
  };

  const handleFanChartChange = (index, field, value) => {
    const updated = [...fanChart];
    updated[index][field] = value;
    setFanChart(updated);
  };

  const addFanChartRow = () => {
    setFanChart([...fanChart, { sp: '', cfm: '' }]);
  };

  const handleCalculate = () => {
    const sp = calculateTotalStaticPressure({
      pipeSections: pipes,
      flexHoseSections: flexHoses,
      components,
      materialType: material,
      cyclone,
      filter
    });

    let cfm;
    if (fanChart.some(row => row.sp && row.cfm)) {
      // Interpolate based on user input chart
      const sorted = [...fanChart].map(row => ({ sp: +row.sp, cfm: +row.cfm }))
        .filter(row => !isNaN(row.sp) && !isNaN(row.cfm))
        .sort((a, b) => a.sp - b.sp);
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (sp >= a.sp && sp <= b.sp) {
          const slope = (b.cfm - a.cfm) / (b.sp - a.sp);
          cfm = a.cfm + slope * (sp - a.sp);
          break;
        }
      }
      if (!cfm && sorted.length) cfm = sorted[sorted.length - 1].cfm;
    } else {
      cfm = calculateFinalCFM(sp, diameter);
    }

    const velocity = getVelocity(cfm, diameter);
    setResult({ sp: sp.toFixed(2), cfm: Math.round(cfm), velocity: Math.round(velocity) });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dust Collection Calculator</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">Duct Material</label>
          <select
            className="w-full p-2 border rounded"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            {Object.keys(materialTypes).map((key) => (
              <option key={key} value={key}>
                {materialTypes[key].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold">Main Duct Diameter (inches)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
        <p>
          <strong>Note:</strong> Only add a cyclone or filter if it's an aftermarket upgrade to your dust collector. If your system already includes these components, leave them set to "None."
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">Cyclone Type</label>
          <select
            className="w-full p-2 border rounded"
            value={cyclone}
            onChange={(e) => setCyclone(e.target.value)}
          >
            <option value="none">None</option>
            <option value="basic">Basic Cyclone (1.50 inH₂O)</option>
            <option value="highEfficiency">High-Efficiency Cyclone (0.75 inH₂O)</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">Filter Type</label>
          <select
            className="w-full p-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="none">None</option>
            <option value="standard">Standard Cartridge Filter (0.50 inH₂O)</option>
            <option value="hepa">HEPA Filter (2.00 inH₂O)</option>
          </select>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Fan Chart (Optional)</h2>
      <button
        className="text-blue-600 underline text-sm mb-2"
        onClick={() => setShowFanChartHelp(!showFanChartHelp)}
      >
        {showFanChartHelp ? 'Hide explanation' : 'What’s this?'}
      </button>
      {showFanChartHelp && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-sm text-yellow-800 mb-4 rounded">
          <p><strong>Fan Chart Input:</strong> Add your dust collector's fan chart (Static Pressure & CFM pairs) for more accurate results.</p>
          <p>This data tells the calculator how your dust collector behaves at different pressures, which helps calculate airflow more precisely.</p>
          <p>If you leave it blank, a generic estimate will be used instead.</p>
        </div>
      )}
      {fanChart.map((row, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
          <input
            type="number"
            className="p-2 border rounded"
            placeholder="Static Pressure (inH₂O)"
            value={row.sp}
            onChange={(e) => handleFanChartChange(i, 'sp', e.target.value)}
          />
          <input
            type="number"
            className="p-2 border rounded"
            placeholder="CFM"
            value={row.cfm}
            onChange={(e) => handleFanChartChange(i, 'cfm', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addFanChartRow} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        + Add Fan Chart Row
      </button>

      <div>
        <button
          onClick={handleCalculate}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p><strong>Static Pressure:</strong> {result.sp} inH₂O</p>
          <p><strong>Airflow (CFM):</strong> {result.cfm}</p>
          <p><strong>Velocity (FPM):</strong> {result.velocity}</p>
        </div>
      )}
    </div>
  );
};

export default DustCollectionCalculator;
