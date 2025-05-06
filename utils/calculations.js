// utils/calculations.js

import { materialTypes, componentLossValues, cycloneTypes, filterTypes } from './constants';

export function calculateTotalStaticPressure({
  pipeSections,
  flexHoseSections,
  components,
  materialType,
  cyclone,
  filter,
}) {
  let totalLoss = 0;

  // Pipe sections
  for (const section of pipeSections) {
    const friction = materialTypes[materialType]?.straight ?? 0.02;
    totalLoss += (section.length / 12) * friction;
  }

  // Flex hose sections
  for (const section of flexHoseSections) {
    const friction = materialTypes[materialType]?.flex ?? 0.2;
    totalLoss += (section.length / 12) * friction;
  }

  // Components
  for (const comp of components) {
    const loss = componentLossValues[comp.type] ?? 0.1;
    totalLoss += loss * comp.count;
  }

  // Cyclone
  totalLoss += cycloneTypes[cyclone] ?? 0;

  // Filter
  totalLoss += filterTypes[filter] ?? 0;

  return totalLoss;
}

export function calculateFinalCFM(staticPressure) {
  // Simplified fan curve approximation
  if (staticPressure < 1) return 1400;
  if (staticPressure < 2) return 1000;
  if (staticPressure < 3) return 700;
  return 500;
}

export function getVelocity(cfm, diameter) {
  const area = (Math.PI * Math.pow(diameter / 12, 2)) / 4;
  return cfm / area / 60;
}
