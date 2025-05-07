import {
  pipeFrictionLoss,
  flexFrictionLoss,
  componentLossValues,
} from './constants';

function getFrictionLossForPipe(lengthInInches, diameter, fpm = 4000) {
  const per5ftLoss = pipeFrictionLoss[diameter];
  if (!per5ftLoss) return 0;
  const perInchLoss = per5ftLoss / 60; // 5 ft = 60 in
  return perInchLoss * Number(lengthInInches);
}

function getFrictionLossForFlex(lengthInInches, diameter, fpm = 4000) {
  const perFootLoss = flexFrictionLoss[diameter];
  if (!perFootLoss) return 0;
  const perInchLoss = perFootLoss / 12;
  return perInchLoss * Number(lengthInInches);
}

function getComponentLoss(type, diameter) {
  const comp = componentLossValues[type];
  if (!comp || !comp.losses) return 0.1;
  return comp.losses[diameter] ?? comp.losses[6] ?? 0.1;
}

export function calculateTotalStaticPressure(
  components,
  material,
  mainDuctDiameter,
  pipes,
  flexHoses,
  cfm = 1000
) {
  let total = 0;

  // Pipe losses
  for (const { length, diameter } of pipes) {
    total += getFrictionLossForPipe(length, diameter);
  }

  // Flex hose losses
  for (const { length, diameter } of flexHoses) {
    total += getFrictionLossForFlex(length, diameter);
  }

  // Component losses
  for (const comp of components) {
    const quantity = Number(comp.quantity) || 0;
    const diameter = Number(comp.diameter) || mainDuctDiameter;
    total += quantity * getComponentLoss(comp.type, diameter);
  }

  return total;
}

export function calculateFinalCFM(
  mainDuctDiameter,
  components,
  material,
  pipes,
  flexHoses,
  fanChart = null
) {
  let cfm = 800;
  let prevSP = 0;

  for (let i = 0; i < 10; i++) {
    const sp =
      calculateTotalStaticPressure(
        components,
        material,
        mainDuctDiameter,
        pipes,
        flexHoses,
        cfm
      );

    if (Math.abs(sp - prevSP) < 0.01) break;
    prevSP = sp;

    if (fanChart && fanChart.length >= 2) {
      // Interpolate CFM from fan chart
      const lower = fanChart.find(
        (pt, idx) => pt.sp <= sp && fanChart[idx + 1]?.sp >= sp
      );
      const upper = fanChart.find((pt) => pt.sp >= sp);

      if (lower && upper && lower !== upper) {
        const slope = (upper.cfm - lower.cfm) / (upper.sp - lower.sp);
        cfm = lower.cfm + slope * (sp - lower.sp);
      } else {
        cfm = upper?.cfm || fanChart[fanChart.length - 1].cfm;
      }
    } else {
      // Generic curve
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
