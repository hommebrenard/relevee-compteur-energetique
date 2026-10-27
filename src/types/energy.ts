export interface ElectricityReading {
  actifHcNuit: number;     // Actif Heures Creuses nuit (kWh index)
  actifHpJour: number;     // Actif Heures Pleines jour (kWh index)
  actifHdePointe: number;  // Actif Heures de Pointe (kWh index)
  reactifTriphase: number; // Réactif triphasé (kVARh index)
}

export interface WaterReading {
  ancienIndex: number;     // Ancien index (m³)
  nouvelIndex: number;     // Nouvel index (m³)
  consoM3?: number;        // Conso calculée en m³
}

export interface FuelReading {
  ancienIndex: number;     // Ancien index ou jauge (%)
  nouvelIndex: number;     // Nouvel index ou jauge (%)
  consoLitre: number;      // Conso en litres ou pourcentage calculé
  unite: 'L' | '%';        // Unité affichée
}

export interface WeeklyReading {
  id: string;
  siteId: string;
  semaine: string;          // Ex: "S30", "S31", "S32", "S33"
  date: string;             // Date du relevé, ex: "04/08/2026"
  conditionsExterieures: string; // Température, météo, contexte usine
  electricite: ElectricityReading;
  eau: WaterReading;
  gazoil: FuelReading;
  notes?: string;
}

export interface MonthRecord {
  id: string;
  mois: string;             // Ex: "AOUT", "SEPTEMBRE", etc.
  annee: number;            // 2026
  siteId: string;
  releves: WeeklyReading[];
}

export interface Site {
  id: string;
  nom: string;
  code: string;
  localisation: string;
  capaciteCuveGazoilL: number; // ex: 5000 Litres
}

export interface EnergyTariffs {
  elecCostHcNuit: number;    // € / kWh
  elecCostHpJour: number;    // € / kWh
  elecCostPointe: number;    // € / kWh
  elecCostReactifPenalty: number; // Pénalité si tan(phi) > 0.4 (€ / kVARh)
  eauCostM3: number;         // € / m³
  gazoilCostL: number;       // € / L
  currency: string;          // "€", "DH", "FCFA", "$"
  co2ElecKgPerKwh: number;   // 0.052 kg CO2 / kWh
  co2FuelKgPerL: number;     // 2.68 kg CO2 / L
}
