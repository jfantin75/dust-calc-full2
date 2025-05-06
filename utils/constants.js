// File: utils/constants.js

export const materialTypes = {
  metal: { label: 'Metal', spFactor: 0.02 },
  pvc: { label: 'PVC', spFactor: 0.03 },
};

export const cycloneOptions = {
  none: 0,
  basic: 1.5,
  highEfficiency: 0.75,
};

export const filterOptions = {
  none: 0,
  standard: 0.5,
  hepa: 2.0,
};

export const componentOptions = {
  elbow90: { label: '90° Elbow', sp: 0.75 },
  elbow45: { label: '45° Elbow', sp: 0.5 },
  wye: { label: 'Wye', sp: 0.5 },
  tee: { label: 'Tee', sp: 1.0 },
  blastGate: { label: 'Blast Gate', sp: 0.25 },
};

export const initialState = {
  component: { type: 'elbow90', quantity: 1, diameter: '' },
  straightPipe: { length: '', diameter: '' },
  flexHose: { length: '', diameter: '' },
};
