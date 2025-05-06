// File: components/DustCollectionCalculator.js
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
  w: 0.35,
  tee: 0.4,
  blastGate: 0.15
};

const frictionLoss = {
  metal: { '4': 0.006, '5': 0.005, '6': 0.004 },
  pvc: { '4': 0.008, '5': 0.007, '6': 0.006 }
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
  const [material, setMaterial] = useState('metal');
  const [pipes, setPipes] = useState([{ length: 0, diameter: 6 }]);
  const [flexLength, setFlexLength] = useState(0);
  const [components, setComponents] = useState([]);
  const [results, setResults] = useState(null);

  const addPipe = () => setPipes(p => [...p, { length: 0, diameter: 6 }]);
  const updatePipe = (i, field, val) => {
    const updated = [...pipes];
    updated[i][field] = field === 'length' ? Number(val) : val;
    setPipes(updated);
  };

  const addComponent = (type) => setComponents(c => [...c, { type, count: 1, diameter: 6 }]);
  const updateComponent = (i, field, val) => {
    const updated = [...components];
    updated[i][field] = field === 'count' ? Number(val) : val;
    setComponents(updated);
  };

  const calculate = () => {
    let sp = flexLength * 0.02;
    pipes.forEach(p => {
      const loss = frictionLoss[material][p.diameter.toString()] || 0.005;
      sp += p.length * loss;
    });
    components.forEach(c => {
      sp += (componentLoss[c.type] || 0.2) * c.count;
    });

    let cfm = 1000, prev = 0, tries = 0;
    while (Math.abs(cfm - prev) > 1 && tries < 20) {
      prev = cfm;
      cfm = interpolateCFM(defaultFanChart, sp);
      tries++;
    }
    setResults({ sp: sp.toFixed(2), cfm: Math.round(cfm) });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dust Collection Calculator</h1>
      <div>
        <label>Material: </label>
        <select value={material} onChange={e => setMaterial(e.target.value)}>
          <option value="metal">Metal</option>
          <option value="pvc">PVC</option>
        </select>
      </div>
      <h3>Straight Pipe Sections</h3>
      {pipes.map((p, i) => (
        <div key={i}>
          Length (in): <input type="number" value={p.length} onChange={e => updatePipe(i, 'length', e.target.value)} />
          Diameter (in): 
          <select value={p.diameter} onChange={e => updatePipe(i, 'diameter', e.target.value)}>
            <option value={4}>4"</option>
            <option value={5}>5"</option>
            <option value={6}>6"</option>
          </select>
        </div>
      ))}
      <button onClick={addPipe}>+ Add Pipe</button>
      <div>
        <label>Flex Hose Length (in): </label>
        <input type="number" value={flexLength} onChange={e => setFlexLength(Number(e.target.value))} />
      </div>
      <h3>System Components</h3>
      {components.map((c, i) => (
        <div key={i}>
          {c.type.toUpperCase()} Count: 
          <input type="number" value={c.count} onChange={e => updateComponent(i, 'count', e.target.value)} />
          Diameter:
          <select value={c.diameter} onChange={e => updateComponent(i, 'diameter', e.target.value)}>
            <option value={4}>4"</option>
            <option value={5}>5"</option>
            <option value={6}>6"</option>
          </select>
        </div>
      ))}
      <div>
        {['elbow45','elbow90','wye','w','tee','blastGate'].map(t => (
          <button key={t} onClick={() => addComponent(t)}>Add {t}</button>
        ))}
      </div>
      <br />
      <button onClick={calculate}>Calculate</button>
      {results && (
        <div>
          <h3>Results</h3>
          <p>Static Pressure: {results.sp} inH₂O</p>
          <p>CFM: {results.cfm}</p>
        </div>
      )}
    </div>
  );
}

export default DustCollectionCalculator;
