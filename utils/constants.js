// utils/constants.js

export const initialState = {
  systemDiameter: 6,
  material: 'PVC',
  mainRuns: [{ length: 10, diameter: 6 }],
  flexRuns: [],
  components: [],
  cyclone: { type: '', spLoss: 0 },
  filter: { type: '', spLoss: 0 },
};

export const componentOptions = [
  { label: '90° Elbow', type: 'elbow_90', baseSP: 0.75 },
  { label: '45° Elbow', type: 'elbow_45', baseSP: 0.4 },
  { label: 'Wye', type: 'wye', baseSP: 0.35 },
  { label: 'Tee', type: 'tee', baseSP: 0.5 },
  { label: 'Blast Gate', type: 'blast_gate', baseSP: 0.1 },
];

export const cycloneOptions = [
  { label: 'None', value: '', spLoss: 0 },
  { label: 'Basic Cyclone (Add-on)', value: 'basic', spLoss: 1.0 },
  { label: 'High Efficiency Cyclone (Add-on)', value: 'high_eff', spLoss: 0.75 },
];

export const filterOptions = [
  { label: 'None', value: '', spLoss: 0 },
  { label: 'Standard Filter (Add-on)', value: 'standard', spLoss: 0.5 },
  { label: 'High Efficiency Filter (Add-on)', value: 'high_eff', spLoss: 0.75 },
];

export const materialTypes = {
  metal: { label: 'Metal', lossPerFoot: 0.05 },
  pvc: { label: 'PVC', lossPerFoot: 0.03 },
  flex: { label: 'Flex Hose', lossPerFoot: 0.15 },
};

export const ductDiameters = [4, 5, 6, 7, 8];
