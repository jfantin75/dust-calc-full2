// utils/calculations.js

import { frictionLossData, componentOptions } from './constants';

function interpolateSP(cfm, diameter) {
  const table = frictionLossData[diameter];
  if (!table) return null;

  for (let i = 0; i < table.length - 1; i++) {
    const low = table[i];
    const high = table[i + 1];
    if (cfm >= low.cfm && cfm <= high.cfm) {
      const ratio = (cfm - low.cfm) / (high.cfm - low.cfm);
      return low.sp + ratio * (high.sp - low.sp);
    }
  }

  // Extrapolate if outside known range
  if (cfm < table[0].cfm) return table[0].sp;
  return table[table.length - 1].sp;
}

function estimatePipeLoss(pipes, cfm) {
  let total = 0;
  for (const { length, diameter } of pipes) {
    const d = Number(diameter);
    const l = Number(length);
    const spPer100ft = interpolateSP(cfm, d);
    if (spPer100ft != null) {
      total += (l / 1200) * spPer100ft; // 1200 inches in 100 ft
    }
  }
  return total;
}

function estimateFlexLoss(flexHoses, materialType) {
  let total = 0;
  const friction = materialType === 'metal' ? 0.2 : 0.25; // fallback rough numbers
  for (const { length } of flexHoses) {
    const l = Number(length);
    total += (l / 12) * friction;
  }
  return total;
}

export function calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses, estimatedCFM) {
  const pipeLoss = estimatePipeLoss(pipes, estimatedCFM);
  const flexLoss = estimateFlexLoss(flexHoses, materialType);

  let compLoss = 0;
  for (const comp of components) {
    const quantity = Number(comp.quantity) || 0;
    const loss = componentOptions[comp.type]?.loss ?? 0.1;
    compLoss += loss * quantity;
  }

  return pipeLoss + flexLoss + compLoss;
}

export function calculateFinalCFM(mainDuctDiameter, components, materialType, pipes, flexHoses) {
  let cfm = 1000;
  let prevSP = 0;

  for (let i = 0; i < 10; i++) {
    const sp = calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses, cfm);
    if (Math.abs(sp - prevSP) < 0.01) break;
    prevSP = sp;

    // Simple fan curve approximation: decrease CFM as SP increases
    if (sp < 1) cfm = 1400;
    else if (sp < 2) cfm = 1000;
    else if (sp < 3) cfm = 700;
    else cfm = 500;
  }

  return cfm;
}

export function getVelocity(cfm, diameter) {
  const d = Number(diameter);
  const area = (Math.PI * Math.pow(d / 12, 2)) / 4;
  return area ? cfm / area / 60 : 0;
}
