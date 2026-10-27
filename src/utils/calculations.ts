import { MonthRecord, WeeklyReading, EnergyTariffs, Site } from '../types/energy';

export interface WeeklyDelta {
  semaine: string;
  date: string;
  conditionsExterieures: string;
  notes?: string;
  // Index bruts
  actifHcNuitIndex: number;
  actifHpJourIndex: number;
  actifHdePointeIndex: number;
  reactifTriphaseIndex: number;
  // Deltas consommations
  consoHcNuit: number;
  consoHpJour: number;
  consoHdePointe: number;
  consoTotalElec: number;
  consoReactif: number;
  // Eau
  eauAncien: number;
  eauNouvel: number;
  consoEauM3: number;
  // Gazoil
  gazoilAncien: number;
  gazoilNouvel: number;
  consoGazoilL: number;
  consoGazoilPct: number;
}

export interface MonthSummary {
  // Electricité
  totalHcNuit: number;
  totalHpJour: number;
  totalHdePointe: number;
  totalActifKwh: number;
  totalReactifKvarh: number;
  tanPhi: number;
  cosPhi: number;
  isCosPhiConform: boolean;
  excessReactifKvarh: number;

  // Eau
  totalEauM3: number;
  totalEauLitres: number;
  avgEauM3PerDay: number;

  // Gazoil
  totalGazoilL: number;
  totalGazoilPct: number;
  currentTankLevelPct: number;
  currentTankLevelL: number;
  estimatedAutonomyDays: number;

  // Coûts
  costElecHcNuit: number;
  costElecHpJour: number;
  costElecPointe: number;
  costReactifPenalty: number;
  costElecTotal: number;
  costEauTotal: number;
  costGazoilTotal: number;
  costGlobal: number;

  // CO2
  co2ElecKg: number;
  co2FuelKg: number;
  co2TotalKg: number;

  // Deltas par semaine
  weeklyDeltas: WeeklyDelta[];
}

export function calculateWeeklyDeltas(releves: WeeklyReading[], site?: Site): WeeklyDelta[] {
  if (!releves || releves.length === 0) return [];

  const deltas: WeeklyDelta[] = [];
  const cuveCapacite = site?.capaciteCuveGazoilL || 4000;

  for (let i = 0; i < releves.length; i++) {
    const current = releves[i];
    const prev = i > 0 ? releves[i - 1] : null;

    let deltaHcNuit = 0;
    let deltaHpJour = 0;
    let deltaHdePointe = 0;
    let deltaReactif = 0;

    if (prev) {
      deltaHcNuit = Math.max(0, current.electricite.actifHcNuit - prev.electricite.actifHcNuit);
      deltaHpJour = Math.max(0, current.electricite.actifHpJour - prev.electricite.actifHpJour);
      deltaHdePointe = Math.max(0, current.electricite.actifHdePointe - prev.electricite.actifHdePointe);
      deltaReactif = Math.max(0, current.electricite.reactifTriphase - prev.electricite.reactifTriphase);
    }

    const consoTotalElec = deltaHcNuit + deltaHpJour + deltaHdePointe;

    // Eau
    const consoEauM3 = current.eau.consoM3 !== undefined
      ? current.eau.consoM3
      : Math.max(0, current.eau.nouvelIndex - current.eau.ancienIndex);

    // Gazoil
    let consoGazoilPct = 0;
    let consoGazoilL = 0;

    if (current.gazoil.unite === '%') {
      consoGazoilPct = current.gazoil.consoLitre;
      consoGazoilL = (consoGazoilPct / 100) * cuveCapacite;
    } else {
      consoGazoilL = current.gazoil.consoLitre;
      consoGazoilPct = cuveCapacite > 0 ? (consoGazoilL / cuveCapacite) * 100 : 0;
    }

    deltas.push({
      semaine: current.semaine,
      date: current.date,
      conditionsExterieures: current.conditionsExterieures,
      notes: current.notes,
      actifHcNuitIndex: current.electricite.actifHcNuit,
      actifHpJourIndex: current.electricite.actifHpJour,
      actifHdePointeIndex: current.electricite.actifHdePointe,
      reactifTriphaseIndex: current.electricite.reactifTriphase,
      consoHcNuit: deltaHcNuit,
      consoHpJour: deltaHpJour,
      consoHdePointe: deltaHdePointe,
      consoTotalElec,
      consoReactif: deltaReactif,
      eauAncien: current.eau.ancienIndex,
      eauNouvel: current.eau.nouvelIndex,
      consoEauM3,
      gazoilAncien: current.gazoil.ancienIndex,
      gazoilNouvel: current.gazoil.nouvelIndex,
      consoGazoilL,
      consoGazoilPct,
    });
  }

  return deltas;
}

export function calculateMonthSummary(
  record: MonthRecord,
  tariffs: EnergyTariffs,
  site?: Site
): MonthSummary {
  const releves = record.releves || [];
  const cuveCapacite = site?.capaciteCuveGazoilL || 4000;
  const weeklyDeltas = calculateWeeklyDeltas(releves, site);

  if (releves.length === 0) {
    return {
      totalHcNuit: 0,
      totalHpJour: 0,
      totalHdePointe: 0,
      totalActifKwh: 0,
      totalReactifKvarh: 0,
      tanPhi: 0,
      cosPhi: 1,
      isCosPhiConform: true,
      excessReactifKvarh: 0,
      totalEauM3: 0,
      totalEauLitres: 0,
      avgEauM3PerDay: 0,
      totalGazoilL: 0,
      totalGazoilPct: 0,
      currentTankLevelPct: 100,
      currentTankLevelL: cuveCapacite,
      estimatedAutonomyDays: 90,
      costElecHcNuit: 0,
      costElecHpJour: 0,
      costElecPointe: 0,
      costReactifPenalty: 0,
      costElecTotal: 0,
      costEauTotal: 0,
      costGazoilTotal: 0,
      costGlobal: 0,
      co2ElecKg: 0,
      co2FuelKg: 0,
      co2TotalKg: 0,
      weeklyDeltas: [],
    };
  }

  // Si on a au moins 2 relevés, les totaux mensuels d'électricité sont:
  // Index du dernier relevé - Index du premier relevé (identique à la somme des deltas)
  const first = releves[0];
  const last = releves[releves.length - 1];

  let totalHcNuit = 0;
  let totalHpJour = 0;
  let totalHdePointe = 0;
  let totalReactifKvarh = 0;

  if (releves.length > 1) {
    totalHcNuit = Math.max(0, last.electricite.actifHcNuit - first.electricite.actifHcNuit);
    totalHpJour = Math.max(0, last.electricite.actifHpJour - first.electricite.actifHpJour);
    totalHdePointe = Math.max(0, last.electricite.actifHdePointe - first.electricite.actifHdePointe);
    totalReactifKvarh = Math.max(0, last.electricite.reactifTriphase - first.electricite.reactifTriphase);
  }

  const totalActifKwh = totalHcNuit + totalHpJour + totalHdePointe;

  // Calcul du Tan(phi) et Cos(phi)
  // Tan(phi) = Q / P
  const tanPhi = totalActifKwh > 0 ? totalReactifKvarh / totalActifKwh : 0;
  // Cos(phi) = 1 / sqrt(1 + tan(phi)^2)
  const cosPhi = totalActifKwh > 0 ? 1 / Math.sqrt(1 + Math.pow(tanPhi, 2)) : 1;
  // Norme industrielle classique : Tan(phi) <= 0.4 (Cos phi >= 0.928)
  const isCosPhiConform = tanPhi <= 0.4;
  // Dépassement d'énergie réactive facturable
  const allowedReactif = totalActifKwh * 0.4;
  const excessReactifKvarh = Math.max(0, totalReactifKvarh - allowedReactif);

  // Total Eau : somme des deltas eau
  const totalEauM3 = releves.reduce((acc, curr) => {
    const delta = curr.eau.consoM3 !== undefined
      ? curr.eau.consoM3
      : Math.max(0, curr.eau.nouvelIndex - curr.eau.ancienIndex);
    return acc + delta;
  }, 0);
  const totalEauLitres = totalEauM3 * 1000;
  const daysInMonth = 30;
  const avgEauM3PerDay = Number((totalEauM3 / daysInMonth).toFixed(2));

  // Gazoil
  let totalGazoilPct = 0;
  let totalGazoilL = 0;
  releves.forEach((r) => {
    if (r.gazoil.unite === '%') {
      totalGazoilPct += r.gazoil.consoLitre;
      totalGazoilL += (r.gazoil.consoLitre / 100) * cuveCapacite;
    } else {
      totalGazoilL += r.gazoil.consoLitre;
      totalGazoilPct += cuveCapacite > 0 ? (r.gazoil.consoLitre / cuveCapacite) * 100 : 0;
    }
  });

  const lastReading = releves[releves.length - 1];
  const currentTankLevelPct = lastReading.gazoil.nouvelIndex || 60;
  const currentTankLevelL = (currentTankLevelPct / 100) * cuveCapacite;
  const avgGazoilLPerDay = totalGazoilL > 0 ? totalGazoilL / daysInMonth : 10;
  const estimatedAutonomyDays = avgGazoilLPerDay > 0
    ? Math.round(currentTankLevelL / avgGazoilLPerDay)
    : 90;

  // Calcul financier
  const costElecHcNuit = totalHcNuit * tariffs.elecCostHcNuit;
  const costElecHpJour = totalHpJour * tariffs.elecCostHpJour;
  const costElecPointe = totalHdePointe * tariffs.elecCostPointe;
  const costReactifPenalty = excessReactifKvarh * tariffs.elecCostReactifPenalty;
  const costElecTotal = costElecHcNuit + costElecHpJour + costElecPointe + costReactifPenalty;

  const costEauTotal = totalEauM3 * tariffs.eauCostM3;
  const costGazoilTotal = totalGazoilL * tariffs.gazoilCostL;
  const costGlobal = costElecTotal + costEauTotal + costGazoilTotal;

  // Bilan Carbone
  const co2ElecKg = totalActifKwh * tariffs.co2ElecKgPerKwh;
  const co2FuelKg = totalGazoilL * tariffs.co2FuelKgPerL;
  const co2TotalKg = Math.round(co2ElecKg + co2FuelKg);

  return {
    totalHcNuit,
    totalHpJour,
    totalHdePointe,
    totalActifKwh,
    totalReactifKvarh,
    tanPhi: Number(tanPhi.toFixed(3)),
    cosPhi: Number(cosPhi.toFixed(3)),
    isCosPhiConform,
    excessReactifKvarh: Math.round(excessReactifKvarh),

    totalEauM3,
    totalEauLitres,
    avgEauM3PerDay,

    totalGazoilL: Math.round(totalGazoilL),
    totalGazoilPct: Math.round(totalGazoilPct),
    currentTankLevelPct,
    currentTankLevelL: Math.round(currentTankLevelL),
    estimatedAutonomyDays,

    costElecHcNuit: Math.round(costElecHcNuit),
    costElecHpJour: Math.round(costElecHpJour),
    costElecPointe: Math.round(costElecPointe),
    costReactifPenalty: Math.round(costReactifPenalty),
    costElecTotal: Math.round(costElecTotal),
    costEauTotal: Math.round(costEauTotal),
    costGazoilTotal: Math.round(costGazoilTotal),
    costGlobal: Math.round(costGlobal),

    co2ElecKg: Math.round(co2ElecKg),
    co2FuelKg: Math.round(co2FuelKg),
    co2TotalKg,

    weeklyDeltas,
  };
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return new Intl.NumberFormat('fr-FR').format(val);
}
