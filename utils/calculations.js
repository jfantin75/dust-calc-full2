// utils/calculations.js

import { getOneidaLoss, getComponentLoss } from './constants';

// Calculate the duct cross-sectional area in ft²
function getArea(diameter) {
  const d = Number(diameter);
  return (Math.PI * Math.pow(d / 12, 2)) / 4;
}

// Calculate FPM from CFM and diameter
function getFPM(cfm, diameter) {
  const area = getArea(diameter);
  return area ? cfm / area : 0;
}

// Estimate total SP using Oneida-based loss values at 4000 FPM and adjust
function calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses, estimatedCFM) {
  const fpm = getFPM(estimatedCFM, mainDuctDiameter);
  const multiplier = fpm ? Math.pow(fpm / 4000, 2) : 1;

  let total = 0;

  for (const pipe of pipes) {
    const lenFeet = Number(pipe.length) / 12;
    const d = Number(pipe.diameter);
    const lossPer5ft = getOneidaLoss('pipe', d);
    total += lenFeet * (lossPer5ft / 5) * multiplier;
  }

  for (const flex of flexHoses) {
    const lenFeet = Number(flex.length) / 12;
    const d = Number(flex.diameter);
    const lossPerFt = getOneidaLoss('flex', d);
    total += lenFeet * lossPerFt * multiplier;
  }

  for (const comp of components) {
    const qty = Number(comp.quantity) || 0;
    const d = Number(comp.diameter) || Number(mainDuctDiameter);
    const compLoss = getComponentLoss(comp.type, d);
    total += qty * compLoss * multiplier;
  }

  return total;
}

// Iteratively converge to a realistic CFM using adjusted SP and velocity
export function calculateFinalCFM(mainDuctDiameter, components, materialType, pipes, flexHoses, cycloneLoss, filterLoss) {
  let cfm = 1000;
  let lastSP = 0;

  for (let i = 0; i < 15; i++) {
    const sp = calculateTotalStaticPressure(
      components,
      materialType,
      mainDuctDiameter,
      pipes,
      flexHoses,
      cfm
    ) + cycloneLoss + filterLoss;

    if (Math.abs(sp - lastSP) < 0.01) break;
    lastSP = sp;

    // Simple fan curve estimate (replaceable with custom data)
    if (sp < 1) cfm = 1400;
    else if (sp < 2) cfm = 1000;
    else if (sp < 3) cfm = 700;
    else if (sp < 4) cfm = 600;
    else if (sp < 5) cfm = 500;
    else cfm = 400;
  }

  return cfm;
}

// Final output
export function getVelocity(cfm, diameter) {
  const area = getArea(diameter);
  return area ? cfm / area : 0;
}
