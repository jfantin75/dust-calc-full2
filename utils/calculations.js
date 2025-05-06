// utils/calculations.js

import { materialTypes, componentOptions } from './constants';

export function calculateTotalStaticPressure(components, materialType, mainDuctDiameter, pipes, flexHoses) {
  let totalLoss = 0;

  // Add loss from straight pipes
  for (const section of pipes) {
    const lengthFeet = Number(section.length) / 12;
    const diameter = Number(section.diameter);
    const friction = materialTypes[materialType]?.straight ?? 0.02;

    // Adjust friction based on diameter
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

export function calculateFinalCFM(staticPressure, diameter) {
  // Use a simplified fan curve for a typical dust collector
  const sp = Number(staticPressure);

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
