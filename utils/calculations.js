// utils/calculations.js

import { materialTypes, componentOptions } from './constants';

export function calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses) {
  let totalLoss = 0;

  // Add loss from straight pipes
  for (const section of pipes) {
    const lengthFeet = Number(section.length) / 12;
    const diameter = Number(section.diameter);
    const friction = materialTypes[materialType]?.straight ?? 0.02;
    const adjustment = diameter && diameter !== Number(mainDuctDiameter) ? diameter / Number(mainDuctDiameter) : 1;
    totalLoss += lengthFeet * friction * adjustment;
  }

  // Add loss from flex hoses
  for (const section of flexHoses) {
    const lengthFeet = Number(section.length) / 12;
    const diameter = Number(section.diameter);
    const friction = materialTypes[materialType]?.flex ?? 0.2;
    const adjustment = diameter && diameter !== Number(mainDuctDiameter) ? diameter / Number(mainDuctDiameter) : 1;
    totalLoss += lengthFeet * friction * adjustment;
  }

  // Add loss from components
  for (const comp of components) {
    const loss = componentOptions[comp.type]?.loss ?? 0.1;
    const quantity = Number(comp.quantity) || 0;
    totalLoss += loss * quantity;
  }

  return totalLoss;
}

export function calculateFinalCFM(staticPressure, fanChart = null) {
  const sp = Number(staticPressure);

  if (fanChart && fanChart.length >= 2) {
    // Sort fan chart by static pressure ascending
    const sorted = [...fanChart].sort((a, b) => a.sp - b.sp);

    // Edge cases
    if (sp <= sorted[0].sp) return sorted[0].cfm;
    if (sp >= sorted[sorted.length - 1].sp) return sorted[sorted.length - 1].cfm;

    // Linear interpolation
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];

      if (sp >= p1.sp && sp <= p2.sp) {
        const slope = (p2.cfm - p1.cfm) / (p2.sp - p1.sp);
        return p1.cfm + slope * (sp - p1.sp);
      }
    }
  }

  // Fallback if no fan chart
  if (sp < 1) return 1400;
  if (sp < 2) return 1000;
  if (sp < 3) return 700;
  return 500;
}

export function getVelocity(cfm, diameter) {
  const d = Number(diameter);
  const area = (Math.PI * Math.pow(d / 12, 2)) / 4;
  return area ? cfm / area / 60 : 0;
}
