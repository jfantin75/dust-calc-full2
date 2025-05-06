import React, { useState } from 'react';
import {
  initialState,
  componentOptions,
  cycloneOptions,
  filterOptions,
  materialTypes }
from '../utils/constants';
import {
  calculateTotalStaticPressure,
  calculateFinalCFM,
  getVelocity,
} from '../utils/calculations';

const DustCollectionCalculator = () => {
  const [components, setComponents] = useState([{ ...initialState.component }]);
  const [material, setMaterial] = useState('metal');
  const [diameter, setDiameter] = useState('6');
  const [cyclone, setCyclone] = useState('none');
  const [filter, setFilter] = useState('none');
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

  const handleCalculate = () => {
    const sp = calculateTotalStaticPressure(components, material, diameter);
    const adjustedSP = sp + cycloneOptions[cyclone] + filterOptions[filter];
    const cfm = calculateFinalCFM(adjustedSP, diameter);
    const velocity = getVelocity(cfm, diameter);
    setResult({ sp: adjustedSP.toFixed(2), cfm: Math.round(cfm), velocity: Math.round(velocity) });
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

      <h2 className="text-xl font-semibold mb-2">System Components</h2>
      {components.map((comp, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4 items-end">
          <select
            className="p-2 border rounded"
            value={comp.type}
            onChange={(e) => handleComponentChange(i, 'type', e.target.value)}
          >
            {Object.keys(componentOptions).map((key) => (
              <option key={key} value={key}>
                {componentOptions[key].label}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="p-2 border rounded"
            value={comp.quantity}
            onChange={(e) => handleComponentChange(i, 'quantity', e.target.value)}
            placeholder="Qty"
          />
          <input
            type="number"
            className="p-2 border rounded"
            value={comp.diameter || ''}
            onChange={(e) => handleComponentChange(i, 'diameter', e.target.value)}
            placeholder="Diameter (in)"
          />
          <button
            onClick={() => removeComponent(i)}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={addComponent} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        + Add Component
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
