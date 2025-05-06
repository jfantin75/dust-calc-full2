export const initialState = {
  ductMaterial: 'Metal',
  mainDuctDiameter: 6,
  pipes: [{ length: 0, diameter: 6 }],
  flexHoses: [{ length: 0, diameter: 6 }],
  components: [],
  cyclone: 'None',
  filter: 'None',
};

export const componentOptions = {
  ELBOW45: 0.3,
  ELBOW90: 0.75,
  WYE: 0.5,
  TEE: 0.9,
  BLASTGATE: 0.2,
};

export const cycloneOptions = {
  None: 0,
  'Basic Cyclone': 1.0,
  'High Efficiency Cyclone': 0.5,
};

export const filterOptions = {
  None: 0,
  Bag: 0.8,
  Cartridge: 0.6,
};
