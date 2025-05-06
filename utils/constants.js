// utils/constants.js

export const initialState = {
  component: {
    type: 'wye',
    quantity: 1,
    diameter: '6',
  },
};

export const componentOptions = {
  wye: { label: 'Wye', loss: 0.15 },
  tee: { label: 'Tee', loss: 0.25 },
  elbow45: { label: '45° Elbow', loss: 0.15 },
  elbow90: { label: '90° Elbow', loss: 0.25 },
  blastGate: { label: 'Blast Gate', loss: 0.1 },
  reducer: { label: 'Reducer', loss: 0.2 },
  lateral: { label: 'Lateral', loss: 0.2 },
  custom: { label: 'Custom Component', loss: 0.1 },
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

export const materialTypes = {
  metal: {
    label: 'Metal Ducting',
    straight: 0.02,
    flex: 0.2,
  },
  pvc: {
    label: 'PVC Ducting',
    straight: 0.025,
    flex: 0.25,
  },
  flex: {
    label: 'Flexible Hose Only',
    straight: 0.03,
    flex: 0.3,
  },
};
