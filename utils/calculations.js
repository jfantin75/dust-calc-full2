import { frictionLossData, componentOptions } from './constants';

// Interpolate static pressure from duct friction table
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
      total += (l / 1200) * spPer100ft;
    }
  }
  return total;
}

function estimateFlexLoss(flexHoses, materialType) {
  let total = 0;
  const friction = materialType === 'metal' ? 0.2 : 0.25;
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

export function calculateFinalCFM(diameter, components, materialType, pipes, flexHoses, fanChart) {
  if (!fanChart || fanChart.length < 2) {
    return 0;
  }

  // Sort fan chart by SP (low to high)
  const sorted = [...fanChart].sort((a, b) => a.sp - b.sp);
  let cfmGuess = sorted[0].cfm;

  for (let i = 0; i < 15; i++) {
    const actualSP = calculateTotalStaticPressure(components, materialType, diameter, pipes, flexHoses, cfmGuess);
    const matched = sorted.find((p) => Math.abs(p.sp - actualSP) < 0.01);
    if (matched) return matched.cfm;

    // Interpolate next CFM guess from fan chart
    for (let j = 0; j < sorted.length - 1; j++) {
      const low = sorted[j];
      const high = sorted[j + 1];
      if (actualSP >= low.sp && actualSP <= high.sp) {
        const ratio = (actualSP - low.sp) / (high.sp - low.sp);
        cfmGuess = low.cfm + ratio * (high.cfm - low.cfm);
        break;
      }
    }
  }

  return Math.round(cfmGuess);
}

export function getVelocity(cfm, diameter) {
  const d = Number(diameter);
  const area = (Math.PI * Math.pow(d / 12, 2)) / 4;
  return area ? cfm / area / 60 : 0;
}
