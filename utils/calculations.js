// utils/calculations.js

import { oneidaLossTable, componentLossByDiameter } from './constants';

function interpolateLoss(cfm, diameter, type) {
  const data = oneidaLossTable[type]?.[diameter];
  if (!data || data.length === 0) return 0;

  const sorted = data.sort((a, b) => a.cfm - b.cfm);
  for (let i = 0; i < sorted.length - 1; i++) {
    const low = sorted[i];
    const high = sorted[i + 1];
    if (cfm >= low.cfm && cfm <= high.cfm) {
      const ratio = (cfm - low.cfm) / (high.cfm - low.cfm);
      return low.sp + ratio * (high.sp - low.sp);
    }
  }

  if (cfm < sorted[0].cfm) return sorted[0].sp;
  return sorted[sorted.length - 1].sp;
}

function calculatePipeLoss(pipes, cfm) {
  let total = 0;
  for (const { length, diameter } of pipes) {
    const d = Number(diameter);
    const l = Number(length);
    const spPerFt = interpolateLoss(cfm, d, 'pipe') / 5;
    total += l * spPerFt;
  }
  return total;
}

function calculateFlexLoss(flexHoses, cfm) {
  let total = 0;
  for (const { length, diameter } of flexHoses) {
    const d = Number(diameter);
    const l = Number(length);
    const spPerFt = interpolateLoss(cfm, d, 'flex') / 1;
    total += l * spPerFt;
  }
  return total;
}

function calculateComponentLoss(components) {
  let total = 0;
  for (const comp of components) {
    const qty = Number(comp.quantity) || 0;
    const d = Number(comp.diameter) || 6;
    const sp = componentLossByDiameter[comp.type]?.[d] ?? 0.1;
    total += qty * sp;
  }
  return total;
}

export function calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses, estimatedCFM) {
  const pipeLoss = calculatePipeLoss(pipes, estimatedCFM);
  const flexLoss = calculateFlexLoss(flexHoses, estimatedCFM);
  const compLoss = calculateComponentLoss(components);
  return pipeLoss + flexLoss + compLoss;
}

export function calculateFinalCFM(mainDuctDiameter, components, materialType, pipes, flexHoses) {
  let cfm = 800;
  let prevSP = 0;

  for (let i = 0; i < 10; i++) {
    const sp = calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses, cfm);
    if (Math.abs(sp - prevSP) < 0.01) break;
    prevSP = sp;

    // A very simplified fan curve assumption (can be replaced with user fan chart)
    if (sp < 1) cfm = 1400;
    else if (sp < 2) cfm = 1000;
    else if (sp < 3) cfm = 800;
    else if (sp < 4) cfm = 600;
    else cfm = 400;
  }

  return cfm;
}

export function getVelocity(cfm, diameter) {
  const d = Number(diameter);
  const area = (Math.PI * Math.pow(d / 12, 2)) / 4;
  return area ? cfm / area / 60 : 0;
}
