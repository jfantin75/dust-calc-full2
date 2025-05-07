import React, { useState } from 'react';
import {
  initialState,
  componentLossValues,
  cycloneOptions,
  filterOptions,
  pipeFrictionLoss,
  flexFrictionLoss,
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
  const [showFanHelp, setShowFanHelp] = useState(false);
  const [result, setResult] = useState(null);

  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  const addComponent = () => setComponents([...components, { ...initialState.component }]);
  const removeComponent = (i) => setComponents(components.filter((_, idx) => idx !== i));

  const handlePipeChange = (index, field, value) => {
    const updated = [...pipes];
    updated[index][field] = value;
    setPipes(updated);
  };
  const addPipe = () => setPipes([...pipes, { length: '', diameter: '6' }]);

  const handleFlexHoseChange = (index, field, value) => {
    const updated = [...flexHoses];
    updated[index][field] = value;
    setFlexHoses(updated);
  };
  const addFlexHose = () => setFlexHoses([...flexHoses, { length: '', diameter: '6' }]);

  const handleFanChartChange = (index, field, value) => {
    const updated = [...fanChart];
    updated[index][field] = value;
    setFanChart(updated);
  };
  const addFanRow = () => setFanChart([...fanChart, { sp: '', cfm: '' }]);

  const handleCalculate = () => {
    const parsedFanChart = fanChart
      .map((pt) => ({ sp: parseFloat(pt.sp), cfm: parseFloat(pt.cfm) }))
      .filter((pt) => !isNaN(pt.sp) && !isNaN(pt.cfm))
      .sort((a, b) => a.sp - b.sp);

    const mainDuctDiameter = Number(diameter);
    let cfm;

    if (parsedFanChart.length >= 2) {
      cfm = calculateFinalCFM(mainDuctDiameter, components, material, pipes, flexHoses, parsedFanChart);
    } else {
      cfm = calculateFinalCFM(mainDuctDiameter, components, material, pipes, flexHoses);
    }

    const staticPressure = calculateTotalStaticPressure(
      components,
      material,
      mainDuctDiameter,
      pipes,
      flexHoses,
      cfm
    ) + cycloneOptions[cyclone] + filterOptions[filter];

    const velocity = getVelocity(cfm, mainDuctDiameter);

    setResult({
      sp: staticPressure.toFixed(2),
      cfm: Math.round(cfm),
      velocity: Math.round(velocity),
    });
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
      <button onClick={() => setShowFanHelp(!showFanHelp)} className="text-blue-600 underline mb-2">
        {showFanHelp ? 'Hide explanation' : "What's this?"}
      </button>
      {showFanHelp && (
        <div className="mb-4 text-sm text-gray-700">
          <p>
            This lets you enter your dust collector's fan chart. The calculator will interpolate CFM based on your
            system’s pressure. If blank, it uses a generic fan curve.
          </p>
        </div>
      )}
      {fanChart.map((row, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number"
            placeholder="Static Pressure (inH₂O)"
            value={row.sp}
            onChange={(e) => handleFanChartChange(i, 'sp', e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="CFM"
            value={row.cfm}
            onChange={(e) => handleFanChartChange(i, 'cfm', e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      ))}
      <button onClick={addFanRow} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        + Add Fan Chart Row
      </button>

      <h2 className="text-xl font-semibold mb-2">Straight Pipe Sections</h2>
      {pipes.map((pipe, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          <input
            type="number"
            className="p-2 border rounded"
            value={pipe.length}
            onChange={(e) => handlePipeChange(i, 'length', e.target.value)}
            placeholder="Length (in)"
          />
          <input
            type="number"
            className="p-2 border rounded"
            value={pipe.diameter}
            onChange={(e) => handlePipeChange(i, 'diameter', e.target.value)}
            placeholder="Diameter (in)"
          />
        </div>
      ))}
      <button onClick={addPipe} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        + Add Pipe
      </button>

      <h2 className="text-xl font-semibold mb-2">Flex Hose Sections</h2>
      {flexHoses.map((hose, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          <input
            type="number"
            className="p-2 border rounded"
            value={hose.length}
            onChange={(e) => handleFlexHoseChange(i, 'length', e.target.value)}
            placeholder="Length (in)"
          />
          <input
            type="number"
            className="p-2 border rounded"
            value={hose.diameter}
            onChange={(e) => handleFlexHoseChange(i, 'diameter', e.target.value)}
            placeholder="Diameter (in)"
          />
        </div>
      ))}
      <button onClick={addFlexHose} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        + Add Flex Hose
      </button>

      <h2 className="text-xl font-semibold mb-2">System Components</h2>
      {components.map((comp, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4 items-end">
          <select
            className="p-2 border rounded"
            value={comp.type}
            onChange={(e) => handleComponentChange(i, 'type', e.target.value)}
          >
            {Object.keys(componentLossValues).map((key) => (
              <option key={key} value={key}>
                {componentLossValues[key].label}
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
        <button onClick={handleCalculate} className="bg-green-600 text-white px-6 py-2 rounded">
          Calculate
        </button>
      </div>

      {result && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p>
            <strong>Static Pressure:</strong> {result.sp} inH₂O
          </p>
          <p>
            <strong>Airflow (CFM):</strong> {result.cfm}
          </p>
          <p>
            <strong>Velocity (FPM):</strong> {result.velocity}
          </p>
        </div>
      )}
    </div>
  );
};

export default DustCollectionCalculator;
