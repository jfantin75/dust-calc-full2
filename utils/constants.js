// File: utils/constants.js

export const initialState = {
  material: 'Metal',
  mainDuctDiameter: 6,
  pipeSections: [],
  flexHoseSections: [],
  components: [],
  cyclone: { type: 'None', diameter: 6 },
  filter: { type: 'None', diameter: 6 },
};

export const componentOptions = [
  { label: '45° Elbow', component: 'ELBOW45', loss: 0.25 },
  { label: '90° Elbow', component: 'ELBOW90', loss: 0.75 },
  { label: 'Wye', component: 'WYE', loss: 0.5 },
  { label: 'Tee', component: 'TEE', loss: 1.2 },
  { label: 'Blast Gate', component: 'BLASTGATE', loss: 0.05 },
];

export const cycloneOptions = [
  { label: 'None', type: 'None', loss: 0 },
  { label: 'Basic Cyclone', type: 'Basic', loss: 1.8 },
  { label: 'High Efficiency Cyclone', type: 'HighEfficiency', loss: 1.2 },
];

export const filterOptions = [
  { label: 'None', type: 'None', loss: 0 },
  { label: 'Bag Filter', type: 'Bag', loss: 2.0 },
  { label: 'Cartridge Filter', type: 'Cartridge', loss: 1.0 },
];
