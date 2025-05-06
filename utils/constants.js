// utils/constants.js

export const ductDiameters = [4, 5, 6, 7, 8];

export const materialTypes = {
  Metal: {
    straight: 0.015,
    flex: 0.2,
  },
  PVC: {
    straight: 0.05,
    flex: 0.3,
  },
};

export const componentLossValues = {
  ELBOW45: 0.1,
  ELBOW90: 0.25,
  WYE: 0.3,
  TEE: 0.9,
  BLASTGATE: 0.03,
};

export const cycloneTypes = {
  None: 0,
  'Basic Cyclone': 0.5,
  'High Efficiency Cyclone': 0.35,
};

export const filterTypes = {
  None: 0,
  'Standard Cartridge Filter': 0.7,
  'HEPA Filter': 1.2,
};
