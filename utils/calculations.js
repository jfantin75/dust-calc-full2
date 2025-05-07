// utils/calculations.js

import {
  pipeFrictionLoss,
  flexFrictionLoss,
  componentLossValues,
} from './constants';

function getAdjustedLoss(baseLoss, actualFPM) {
  const ratio = actualFPM / 4000;
  return baseLoss * Math.pow(ratio, 1.85);
}

function estimatePipeLoss(pipes, cfm) {
  let total = 0;
  for (const { length, diameter } of pipes) {
    const d = Number(diameter);
    const l = Number(length);
    const baseLossPerInch = pipeFrictionLoss[d] / 60; // Oneida values are per 5 ft (60 in)
    const fpm = getVelocity(cfm, d);
    const adjustedLoss = getAdjustedLoss(baseLossPerInch, fpm);
    total += l * adjustedLoss;
  }
  return total;
}

function estimateFlexLoss(flexHoses, cfm) {
  let total = 0;
  for (const { length, diameter } of flexHoses) {
    const d = Number(diameter);
    const l = Number(length);
    const baseLossPerInch = flexFrictionLoss[d]; // Oneida values are already per inch
    const fpm = getVelocity(cfm, d);
    const adjustedLoss = getAdjustedLoss(baseLossPerInch, fpm);
    total += l * adjustedLoss;
  }
  return total;
}

function estimateComponentLoss(components, cfm) {
  let total = 0;
  for (const { type, quantity, diameter } of components) {
    const d = Number(diameter);
    const qty = Number(quantity);
    const baseLoss = componentLossValues[type]?.losses?.[d] ?? 0.1;
    const fpm = getVelocity(cfm, d);
    const adjustedLoss = getAdjustedLoss(baseLoss, fpm);
    total += adjustedLoss * qty;
  }
  return total;
}

export function calculateTotalStaticPressure(
  components,
  material,
  mainDuctDiameter,
  pipes,
  flexHoses,
  cfm
) {
  return (
    estimatePipeLoss(pipes, cfm) +
    estimateFlexLoss(flexHoses, cfm) +
    estimateComponentLoss(components, cfm)
  );
}

export function calculateFinalCFM(
  mainDuctDiameter,
  components,
  material,
  pipes,
  flexHoses,
  fanChart = []
) {
  let cfm = 800;
  let prevSP = 0;

  for (let i = 0; i < 10; i++) {
    const sp = calculateTotalStaticPressure(
      components,
      material,
      mainDuctDiameter,
      pipes,
      flexHoses,
      cfm
    );

    if (Math.abs(sp - prevSP) < 0.01) break;
    prevSP = sp;

    if (fanChart.length >= 2) {
      const lower = fanChart.find((pt, i) => pt.sp <= sp && fanChart[i + 1]?.sp >= sp);
      const upper = fanChart.find((pt) => pt.sp >= sp);
      if (lower && upper && lower !== upper) {
        const slope = (upper.cfm - lower.cfm) / (upper.sp - lower.sp);
        cfm = lower.cfm + slope * (sp - lower.sp);
      } else {
        cfm = upper?.cfm || fanChart[fanChart.length - 1].cfm;
      }
    } else {
      // crude fallback approximation
      if (sp < 1) cfm = 1400;
      else if (sp < 2) cfm = 1000;
      else if (sp < 3) cfm = 700;
      else cfm = 500;
    }
  }

  return cfm;
}

export function getVelocity(cfm, diameter) {
  const d = Number(diameter);
  const area = (Math.PI * Math.pow(d / 12, 2)) / 4;
  return area ? (cfm / area) : 0;
}
