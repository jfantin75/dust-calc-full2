import React, { useState } from 'react';

const materialTypes = ['Metal', 'PVC'];
const componentTypes = ['elbow45', 'elbow90', 'wye', 'tee', 'blastGate'];
const pipeDiameters = [4, 5, 6, 7, 8];

const componentLossValues = {
  elbow45: 0.25,
  elbow90: 0.75,
  wye: 0.25,
  tee: 1.2,
  blastGate: 0.35
};

const pipeLossPerFoot = {
  Metal: {
    4: 0.015,
    5: 0.012,
    6: 0.01,
    7: 0.009,
    8: 0.008
  },
  PVC: {
    4: 0.017,
    5: 0.014,
    6: 0.012,
    7: 0.01,
    8: 0.009
  }
};

export default function DustCollectionCalculator() {
  const [material, setMaterial] = useState('Metal');
  const [mainDiameter, setMainDiameter] = useState(6);

  const [pipes, setPipes] = useState([{ length: 0, diameter: 6 }]);
  const [hoses, setHoses] = useState([{ length: 0, diameter: 6 }]);
  const [components, setComponents] = useState([]);

  const addPipe = () => {
    setPipes([...pipes, { length: 0, diameter: 6 }]);
  };

  const addHose = () => {
    setHoses([...hoses, { length: 0, diameter: 6 }]);
  };

  const addComponent = (type) => {
    setComponents([...components, { type, quantity: 1, diameter: 6 }]);
  };

  const updatePipe = (index, field, value) => {
    const updated = [...pipes];
    updated[index][field] = parseFloat(value);
    setPipes(updated);
  };

  const updateHose = (index, field, value) => {
    const updated = [...hoses];
    updated[index][field] = parseFloat(value);
    setHoses(updated);
  };

  const updateComponent = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = field === 'type' ? value : parseFloat(value);
    setComponents(updated);
  };

  const calculate = () => {
    let staticPressure = 0;

    pipes.forEach(pipe => {
      const loss = pipeLossPerFoot[material][pipe.diameter] || 0.01;
      staticPressure += loss * pipe.length / 12;
    });

    hoses.forEach(hose => {
      const loss = (pipeLossPerFoot[material][hose.diameter] || 0.01) * 1.5;
      staticPressure += loss * hose.length / 12;
    });

    components.forEach(comp => {
      const loss = componentLossValues[comp.type] || 0.5;
      staticPressure += loss * comp.quantity;
    });

    const cfm = 3500 - staticPressure * 800;
    const velocity = (cfm * 576) / (Math.PI * Math.pow(mainDiameter, 2));

    return { staticPressure, cfm, velocity };
  };

  const result = calculate();

  return (
    <div>
      <h1>Dust Collection Calculator</h1>

      <div>
        <label>Material: </label>
        <select value={material} onChange={(e) => setMaterial(e.target.value)}>
          {materialTypes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <h3>Straight Pipe Sections</h3>
        {pipes.map((pipe, i) => (
          <div key={i}>
            <label>Length (in): </label>
            <input type="number" value={pipe.length} onChange={e => updatePipe(i, 'length', e.target.value)} />
            <label> Diameter (in): </label>
            <select value={pipe.diameter} onChange={e => updatePipe(i, 'diameter', e.target.value)}>
              {pipeDiameters.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        ))}
        <button onClick={addPipe}>+ Add Pipe</button>
      </div>

      <div>
        <h3>Flex Hose Sections</h3>
        {hoses.map((hose, i) => (
          <div key={i}>
            <label>Length (in): </label>
            <input type="number" value={hose.length} onChange={e => updateHose(i, 'length', e.target.value)} />
            <label> Diameter (in): </label>
            <select value={hose.diameter} onChange={e => updateHose(i, 'diameter', e.target.value)}>
              {pipeDiameters.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        ))}
        <button onClick={addHose}>+ Add Flex Hose</button>
      </div>

      <div>
        <h3>System Components</h3>
        {components.map((comp, i) => (
          <div key={i}>
            <select value={comp.type} onChange={e => updateComponent(i, 'type', e.target.value)}>
              {componentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label> Diameter: </label>
            <select value={comp.diameter} onChange={e => updateComponent(i, 'diameter', e.target.value)}>
              {pipeDiameters.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <label> Quantity: </label>
            <input type="number" value={comp.quantity} onChange={e => updateComponent(i, 'quantity', e.target.value)} />
          </div>
        ))}
        {componentTypes.map(type => (
          <button key={type} onClick={() => addComponent(type)}>Add {type}</button>
        ))}
      </div>

      <div>
        <button onClick={calculate}>Calculate</button>
        <h3>Results</h3>
        <p>Static Pressure: {result.staticPressure.toFixed(2)} inH₂O</p>
        <p>CFM: {result.cfm.toFixed(0)} CFM</p>
        <p>Velocity: {result.velocity.toFixed(0)} FPM</p>
      </div>
    </div>
  );
}
