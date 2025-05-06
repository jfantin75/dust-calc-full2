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
  const [fanCurve, setFanCurve] = useState([{ sp: '', cfm: '' }]);
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
    setComponents(components.filter((_, i) => i !== index));
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

  const handleFanCurveChange = (index, field, value) => {
    const updated = [...fanCurve];
    updated[index][field] = value;
    setFanCurve(updated);
  };

  const addFanCurvePoint = () => {
    setFanCurve([...fanCurve, { sp: '', cfm: '' }]);
  };

  const removeFanCurvePoint = (index) => {
    setFanCurve(fanCurve.filter((_, i) => i !== index));
  };

  const interpolateCFM = (targetSP) => {
    const sorted = [...fanCurve].map(p => ({ sp: +p.sp, cfm: +p.cfm }))
      .filter(p => !isNaN(p.sp) && !isNaN(p.cfm))
      .sort((a, b) => a.sp - b.sp);

    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      if (targetSP >= p1.sp && targetSP <= p2.sp) {
        const ratio = (targetSP - p1.sp) / (p2.sp - p1.sp);
        return p1.cfm + ratio * (p2.cfm - p1.cfm);
      }
    }
    return sorted.length ? sorted[sorted.length - 1].cfm : 0;
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
    const cfm = interpolateCFM(sp);
    const velocity = getVelocity(cfm, diameter);
    setResult({ sp: sp.toFixed(2), cfm: Math.round(cfm), velocity: Math.round(velocity) });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dust Collection Calculator</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">Duct Material</label>
          <select className="w-full p-2 border rounded" value={material} onChange={(e) => setMaterial(e.target.value)}>
            {Object.keys(materialTypes).map((key) => (
              <option key={key} value={key}>{materialTypes[key].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold">Main Duct Diameter (inches)</label>
          <input type="number" className="w-full p-2 border rounded" value={diameter} onChange={(e) => setDiameter(e.target.value)} />
        </div>
      </div>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
        <p><strong>Note:</strong> Only add a cyclone or filter if it's an aftermarket upgrade to your dust collector. If your system already includes these components, leave them set to "None."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">Cyclone Type</label>
          <select className="w-full p-2 border rounded" value={cyclone} onChange={(e) => setCyclone(e.target.value)}>
            <option value="none">None</option>
            <option value="basic">Basic Cyclone (1.50 inH₂O)</option>
            <option value="highEfficiency">High-Efficiency Cyclone (0.75 inH₂O)</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">Filter Type</label>
          <select className="w-full p-2 border rounded" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="none">None</option>
            <option value="standard">Standard Cartridge Filter (0.50 inH₂O)</option>
            <option value="hepa">HEPA Filter (2.00 inH₂O)</option>
          </select>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Fan Curve Data</h2>
      {fanCurve.map((entry, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-2">
          <input type="number" className="p-2 border rounded" value={entry.sp} placeholder="Static Pressure" onChange={(e) => handleFanCurveChange(i, 'sp', e.target.value)} />
          <input type="number" className="p-2 border rounded" value={entry.cfm} placeholder="CFM" onChange={(e) => handleFanCurveChange(i, 'cfm', e.target.value)} />
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => removeFanCurvePoint(i)}>Remove</button>
        </div>
      ))}
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6" onClick={addFanCurvePoint}>+ Add Fan Curve Point</button>

      <h2 className="text-xl font-semibold mb-2">Straight Pipe Sections</h2>
      {pipes.map((pipe, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          <input type="number" className="p-2 border rounded" value={pipe.length} onChange={(e) => handlePipeChange(i, 'length', e.target.value)} placeholder="Length (in)" />
          <input type="number" className="p-2 border rounded" value={pipe.diameter} onChange={(e) => handlePipeChange(i, 'diameter', e.target.value)} placeholder="Diameter (in)" />
        </div>
      ))}
      <button onClick={addPipe} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">+ Add Pipe</button>

      <h2 className="text-xl font-semibold mb-2">Flex Hose Sections</h2>
      {flexHoses.map((hose, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          <input type="number" className="p-2 border rounded" value={hose.length} onChange={(e) => handleFlexHoseChange(i, 'length', e.target.value)} placeholder="Length (in)" />
          <input type="number" className="p-2 border rounded" value={hose.diameter} onChange={(e) => handleFlexHoseChange(i, 'diameter', e.target.value)} placeholder="Diameter (in)" />
        </div>
      ))}
      <button onClick={addFlexHose} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">+ Add Flex Hose</button>

      <h2 className="text-xl font-semibold mb-2">System Components</h2>
      {components.map((comp, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4 items-end">
          <select className="p-2 border rounded" value={comp.type} onChange={(e) => handleComponentChange(i, 'type', e.target.value)}>
            {Object.keys(componentOptions).map((key) => (
              <option key={key} value={key}>{componentOptions[key].label}</option>
            ))}
          </select>
          <input type="number" className="p-2 border rounded" value={comp.quantity} onChange={(e) => handleComponentChange(i, 'quantity', e.target.value)} placeholder="Qty" />
          <input type="number" className="p-2 border rounded" value={comp.diameter || ''} onChange={(e) => handleComponentChange(i, 'diameter', e.target.value)} placeholder="Diameter (in)" />
          <button onClick={() => removeComponent(i)} className="bg-red-500 text-white px-3 py-2 rounded">Remove</button>
        </div>
      ))}
      <button onClick={addComponent} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">+ Add Component</button>

      <div>
        <button onClick={handleCalculate} className="bg-green-600 text-white px-6 py-2 rounded">Calculate</button>
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
