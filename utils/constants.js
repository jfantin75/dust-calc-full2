// utils/constants.js

export const ductDiameters = [
  '3', '4', '5', '6', '7', '8', '9', '10'
];

export const materialTypes = [
  { label: 'Metal', value: 'metal', frictionFactor: 0.06 },
  { label: 'PVC', value: 'pvc', frictionFactor: 0.07 }
];

export const componentOptions = [
  { label: '45° Elbow', value: 'elbow_45', baseSP: 0.3 },
  { label: '90° Elbow', value: 'elbow_90', baseSP: 0.75 },
  { label: 'Wye', value: 'wye', baseSP: 0.6 },
  { label: 'Tee', value: 'tee', baseSP: 0.9 },
  { label: 'Blast Gate', value: 'blast_gate', baseSP: 0.15 },
  { label: 'Reducer', value: 'reducer', baseSP: 0.2 }
];

export const cycloneOptions = [
  { label: 'None', value: 'none', sp: 0 },
  { label: 'Basic Cyclone', value: 'basic', sp: 2.0 },
  { label: 'High Efficiency Cyclone', value: 'high_efficiency', sp: 1.2 }
];

export const filterOptions = [
  { label: 'None', value: 'none', sp: 0 },
  { label: 'Standard Filter', value: 'standard', sp: 1.5 },
  { label: 'HEPA Filter', value: 'hepa', sp: 2.2 }
];
