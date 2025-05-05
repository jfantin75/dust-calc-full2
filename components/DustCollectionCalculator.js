
import React, { useState } from 'react';

const defaultFanChart = [
  { cfm: 500, sp: 7.5 },
  { cfm: 800, sp: 6.0 },
  { cfm: 1000, sp: 5.0 },
  { cfm: 1200, sp: 4.0 },
  { cfm: 1400, sp: 3.0 },
  { cfm: 1600, sp: 2.2 },
  { cfm: 1800, sp: 1.5 },
  { cfm: 2000, sp: 1.0 }
];

const componentLoss = {
  elbow45: 0.2,
  elbow90: 0.3,
  wye: 0.25,
  blastGate: 0.15,
  cycloneLow: 0.5,
  cycloneHigh: 1.0,
  filterStandard: 0.5,
  filterHEPA: 1.0
};

function interpolateCFM(fanChart, targetSP) {
  for (let i = 0; i < fanChart.length - 1; i++) {
    const p1 = fanChart[i];
    const p2 = fanChart[i + 1];
    if (targetSP <= p1.sp && targetSP >= p2.sp) {
      const ratio = (targetSP - p2.sp) / (p1.sp - p2.sp);
      return p2.cfm + ratio * (p1.cfm - p2.cfm);
    }
  }
  return 0;
}

function DustCollectionCalculator() {
  const [ductDiameter, setDuctDiameter] = useState(6);
  const [material, setMaterial] = useState('metal');
  const [components, setComponents] = useState([]);
  const [flexLength, setFlexLength] = useState(0);
  const [straightLength, setStraightLength] = useState(0);
  const [cyclone, setCyclone] = useState('none');
  const [filter, setFilter] = useState('none');
  const [results, setResults] = useState(null);

  const addComponent = (type) => {
    setComponents(prev => [...prev, { type, count: 1 }]);
  };

  const updateComponent = (index, count) => {
    const updated = [...components];
    updated[index].count = Number(count);
    setComponents(updated);
  };

  const calculate = () => {
    const lossPerInch = material === 'pvc' ? 0.006 : 0.004;
    let sp = straightLength * lossPerInch + flexLength * 0.02;

    components.forEach(c => {
      sp += (componentLoss[c.type] || 0) * c.count;
    });

    if (cyclone === 'low') sp += componentLoss.cycloneLow;
    if (cyclone === 'high') sp += componentLoss.cycloneHigh;
    if (filter === 'standard') sp += componentLoss.filterStandard;
    if (filter === 'hepa') sp += componentLoss.filterHEPA;

    let cfm = 1000;
    let previousCFM = 0;
    let iterations = 0;

    while (Math.abs(cfm - previousCFM) > 1 && iterations < 20) {
      const area = Math.PI * ((ductDiameter / 2) ** 2) / 144;
      const fpm = cfm / area;
      const updatedSP = straightLength * lossPerInch + flexLength * 0.02;

      components.forEach(c => {
        sp += (componentLoss[c.type] || 0) * c.count;
      });
      if (cyclone === 'low') sp += componentLoss.cycloneLow;
      if (cyclone === 'high') sp += componentLoss.cycloneHigh;
      if (filter === 'standard') sp += componentLoss.filterStandard;
      if (filter === 'hepa') sp += componentLoss.filterHEPA;

      previousCFM = cfm;
      cfm = interpolateCFM(defaultFanChart, sp);
      iterations++;
    }

    setResults({ sp: sp.toFixed(2), cfm: Math.round(cfm) });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dust Collection Calculator</h1>
      <div>
        <label>Duct Diameter (inches):</label>
        <input type="number" value={ductDiameter} onChange={e => setDuctDiameter(Number(e.target.value))} />
      </div>
      <div>
        <label>Material:</label>
        <select value={material} onChange={e => setMaterial(e.target.value)}>
          <option value="metal">Metal</option>
          <option value="pvc">PVC</option>
        </select>
      </div>
      <div>
        <label>Straight Pipe Length (inches):</label>
        <input type="number" value={straightLength} onChange={e => setStraightLength(Number(e.target.value))} />
      </div>
      <div>
        <label>Flex Hose Length (inches):</label>
        <input type="number" value={flexLength} onChange={e => setFlexLength(Number(e.target.value))} />
      </div>
      <div>
        <h3>System Components</h3>
        <button onClick={() => addComponent('elbow45')}>Add 45° Elbow</button>
        <button onClick={() => addComponent('elbow90')}>Add 90° Elbow</button>
        <button onClick={() => addComponent('wye')}>Add Wye</button>
        <button onClick={() => addComponent('blastGate')}>Add Blast Gate</button>
        {components.map((c, i) => (
          <div key={i}>
            {c.type}: 
            <input type="number" value={c.count} onChange={e => updateComponent(i, e.target.value)} />
          </div>
        ))}
      </div>
      <div>
        <label>Cyclone:</label>
        <select value={cyclone} onChange={e => setCyclone(e.target.value)}>
          <option value="none">None</option>
          <option value="low">Low Resistance</option>
          <option value="high">High Resistance</option>
        </select>
      </div>
      <div>
        <label>Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="none">None</option>
          <option value="standard">Standard</option>
          <option value="hepa">HEPA</option>
        </select>
      </div>
      <button onClick={calculate}>Calculate</button>
      {results && (
        <div>
          <h3>Results</h3>
          <p>Static Pressure: {results.sp} inH₂O</p>
          <p>Estimated CFM: {results.cfm}</p>
        </div>
      )}
    </div>
  );
}

export default DustCollectionCalculator;
