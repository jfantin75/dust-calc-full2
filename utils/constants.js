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
    label: 'Metal',
    straight: 0.02, // Legacy fallback
    flex: 0.2,
  },
  pvc: {
    label: 'PVC',
    straight: 0.03,
    flex: 0.25,
  },
  flex: {
    label: 'Flex Hose',
    straight: 0.2,
    flex: 0.2,
  },
};

export const componentOptions = {
  elbow90: { label: '90° Elbow', loss: 0.35 },
  elbow45: { label: '45° Elbow', loss: 0.2 },
  wye: { label: 'Wye Fitting', loss: 0.3 },
  blastGate: { label: 'Blast Gate', loss: 0.05 },
  reducer: { label: 'Reducer', loss: 0.25 },
  tee: { label: 'Tee Fitting', loss: 0.4 },
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

// Real-world friction loss table (in inH₂O per 100 ft)
export const frictionLossData = {
  4: [
    { cfm: 100, sp: 0.95 },
    { cfm: 150, sp: 1.88 },
    { cfm: 200, sp: 3.25 },
    { cfm: 250, sp: 5.10 },
    { cfm: 300, sp: 7.25 },
  ],
  5: [
    { cfm: 100, sp: 0.34 },
    { cfm: 200, sp: 1.18 },
    { cfm: 300, sp: 2.50 },
    { cfm: 400, sp: 4.30 },
    { cfm: 500, sp: 6.50 },
  ],
  6: [
    { cfm: 200, sp: 0.43 },
    { cfm: 300, sp: 0.90 },
    { cfm: 400, sp: 1.50 },
    { cfm: 500, sp: 2.25 },
    { cfm: 600, sp: 3.20 },
    { cfm: 700, sp: 4.20 },
    { cfm: 800, sp: 5.30 },
  ],
  7: [
    { cfm: 300, sp: 0.48 },
    { cfm: 500, sp: 1.12 },
    { cfm: 700, sp: 2.00 },
    { cfm: 900, sp: 3.10 },
  ],
  8: [
    { cfm: 400, sp: 0.45 },
    { cfm: 600, sp: 0.90 },
    { cfm: 800, sp: 1.40 },
    { cfm: 1000, sp: 2.10 },
    { cfm: 1200, sp: 3.00 },
  ],
};

// helper to interpolate friction loss for any diameter/CFM
export function getInterpolatedLoss(cfm, diameter) {
  const table = frictionLossData[diameter];
  if (!table) return 0.02; // fallback default

  const sorted = table.slice().sort((a, b) => a.cfm - b.cfm);

  for (let i = 0; i < sorted.length - 1; i++) {
    const low = sorted[i];
    const high = sorted[i + 1];
    if (cfm >= low.cfm && cfm <= high.cfm) {
      const ratio = (cfm - low.cfm) / (high.cfm - low.cfm);
      return low.sp + ratio * (high.sp - low.sp);
    }
  }

  // If cfm is below or above range, use the nearest available value
  if (cfm < sorted[0].cfm) return sorted[0].sp;
  return sorted[sorted.length - 1].sp;
}
