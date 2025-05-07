// utils/constants.js

export const initialState = {
  component: {
    type: 'elbow90',
    quantity: 1,
    diameter: 6,
  },
};

export const materialTypes = {
  metal: {
    label: 'Metal Ducting',
  },
  pvc: {
    label: 'PVC Ducting',
  },
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

// Friction loss values (inH₂O) per 5 ft of straight pipe at 4000 FPM
export const pipeFrictionLoss = {
  3: 0.355,
  4: 0.285,
  5: 0.230,
  6: 0.185,
  7: 0.145,
  8: 0.115,
};

// Flex hose friction loss values (inH₂O) per foot at 4000 FPM
export const flexFrictionLoss = {
  3: 0.352,
  4: 0.280,
  5: 0.225,
  6: 0.180,
  7: 0.141,
  8: 0.108,
};

// Component losses per fitting at 4000 FPM
export const componentLossValues = {
  elbow90: {
    label: '90° Elbow',
    losses: {
      3: 0.470,
      4: 0.450,
      5: 0.531,
      6: 0.564,
      7: 0.468,
      8: 0.405,
    },
  },
  elbow45: {
    label: '45° Elbow',
    losses: {
      3: 0.235,
      4: 0.225,
      5: 0.266,
      6: 0.282,
      7: 0.234,
      8: 0.203,
    },
  },
  wye: {
    label: '45° Wye Branch',
    losses: {
      3: 0.282,
      4: 0.375,
      5: 0.354,
      6: 0.329,
      7: 0.324,
      8: 0.297,
    },
  },
  blastGate: {
    label: 'Blast Gate',
    losses: {
      6: 0.05, // estimated
    },
  },
  reducer: {
    label: 'Reducer',
    losses: {
      6: 0.25, // estimated
    },
  },
  tee: {
    label: 'Tee Fitting',
    losses: {
      6: 0.4, // estimated
    },
  },
};
