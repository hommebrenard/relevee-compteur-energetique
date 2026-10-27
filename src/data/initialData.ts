import { MonthRecord, Site, EnergyTariffs } from '../types/energy';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    nom: 'Site Principal - Usine Nord',
    code: 'SP-01',
    localisation: 'Zone Industrielle Nord',
    capaciteCuveGazoilL: 4000,
  },
  {
    id: 'site-2',
    nom: 'Plateforme Logistique Sud',
    code: 'PL-02',
    localisation: 'Parc d\'Activités Sud',
    capaciteCuveGazoilL: 3000,
  },
  {
    id: 'site-3',
    nom: 'Bâtiment Administratif & R&D',
    code: 'BA-03',
    localisation: 'Campus Technologique',
    capaciteCuveGazoilL: 1500,
  },
];

export const DEFAULT_TARIFFS: EnergyTariffs = {
  elecCostHcNuit: 0.125,     // 0.125 € / kWh
  elecCostHpJour: 0.198,     // 0.198 € / kWh
  elecCostPointe: 0.285,     // 0.285 € / kWh
  elecCostReactifPenalty: 0.035, // Pénalité kVARh si dépassement
  eauCostM3: 3.80,          // 3.80 € / m³
  gazoilCostL: 1.68,        // 1.68 € / L
  currency: '€',
  co2ElecKgPerKwh: 0.055,   // kg CO2 eq / kWh
  co2FuelKgPerL: 2.68,      // kg CO2 eq / L
};

export const INITIAL_MONTH_RECORDS: MonthRecord[] = [
  {
    id: 'rec-2026-07',
    mois: 'JUILLET',
    annee: 2026,
    siteId: 'site-1',
    releves: [
      {
        id: 'jul-s26',
        siteId: 'site-1',
        semaine: 'S26',
        date: '05/07/2026',
        conditionsExterieures: 'Ensoleillé / 27°C',
        electricite: {
          actifHcNuit: 6521500,
          actifHpJour: 2305100,
          actifHdePointe: 1545800,
          reactifTriphase: 4425100,
        },
        eau: {
          ancienIndex: 52815,
          nouvelIndex: 52824,
          consoM3: 9,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 100,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'jul-s27',
        siteId: 'site-1',
        semaine: 'S27',
        date: '12/07/2026',
        conditionsExterieures: 'Chaud / 29°C',
        electricite: {
          actifHcNuit: 6529200,
          actifHpJour: 2307900,
          actifHdePointe: 1547700,
          reactifTriphase: 4430200,
        },
        eau: {
          ancienIndex: 52824,
          nouvelIndex: 52835,
          consoM3: 11,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 85,
          consoLitre: 15,
          unite: '%',
        },
      },
      {
        id: 'jul-s28',
        siteId: 'site-1',
        semaine: 'S28',
        date: '19/07/2026',
        conditionsExterieures: 'Pic chaleur / 32°C',
        electricite: {
          actifHcNuit: 6537100,
          actifHpJour: 2311200,
          actifHdePointe: 1549600,
          reactifTriphase: 4435800,
        },
        eau: {
          ancienIndex: 52835,
          nouvelIndex: 52846,
          consoM3: 11,
        },
        gazoil: {
          ancienIndex: 85,
          nouvelIndex: 85,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'jul-s29',
        siteId: 'site-1',
        semaine: 'S29',
        date: '26/07/2026',
        conditionsExterieures: 'Orageux / 26°C',
        electricite: {
          actifHcNuit: 6545026,
          actifHpJour: 2314473,
          actifHdePointe: 1551514,
          reactifTriphase: 4441784,
        },
        eau: {
          ancienIndex: 52846,
          nouvelIndex: 52854,
          consoM3: 8,
        },
        gazoil: {
          ancienIndex: 85,
          nouvelIndex: 70,
          consoLitre: 15,
          unite: '%',
        },
      },
    ],
  },
  // Données exactes de l'image pour le mois d'AOÛT
  {
    id: 'rec-2026-08',
    mois: 'AOUT',
    annee: 2026,
    siteId: 'site-1',
    releves: [
      {
        id: 'aout-s30',
        siteId: 'site-1',
        semaine: 'S30',
        date: '02/08/2026',
        conditionsExterieures: 'Chaud / 31°C - Climatisation active',
        electricite: {
          actifHcNuit: 6545026,
          actifHpJour: 2314473,
          actifHdePointe: 1551514,
          reactifTriphase: 4441784,
        },
        eau: {
          ancienIndex: 52854,
          nouvelIndex: 52857,
          consoM3: 3,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 100,
          consoLitre: 0,
          unite: '%',
        },
        notes: 'Semaine de maintenance préventive',
      },
      {
        id: 'aout-s31',
        siteId: 'site-1',
        semaine: 'S31',
        date: '09/08/2026',
        conditionsExterieures: 'Canicule / 35°C - Pleine charge',
        electricite: {
          actifHcNuit: 6554673,
          actifHpJour: 2318203,
          actifHdePointe: 1553732,
          reactifTriphase: 4448040,
        },
        eau: {
          ancienIndex: 52857,
          nouvelIndex: 52873,
          consoM3: 16,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 80,
          consoLitre: 20,
          unite: '%',
        },
        notes: 'Pic de chaleur, groupes froids à 100%',
      },
      {
        id: 'aout-s32',
        siteId: 'site-1',
        semaine: 'S32',
        date: '16/08/2026',
        conditionsExterieures: 'Ensoleillé / 29°C',
        electricite: {
          actifHcNuit: 6562077,
          actifHpJour: 2320970,
          actifHdePointe: 1555517,
          reactifTriphase: 4451991,
        },
        eau: {
          ancienIndex: 52873,
          nouvelIndex: 52886,
          consoM3: 13,
        },
        gazoil: {
          ancienIndex: 80,
          nouvelIndex: 80,
          consoLitre: 0,
          unite: '%',
        },
        notes: 'Fonctionnement régulier',
      },
      {
        id: 'aout-s33',
        siteId: 'site-1',
        semaine: 'S33',
        date: '23/08/2026',
        conditionsExterieures: 'Normal / 26°C - Production soutenue',
        electricite: {
          actifHcNuit: 6570095,
          actifHpJour: 2324288,
          actifHdePointe: 1557617,
          reactifTriphase: 4459622,
        },
        eau: {
          ancienIndex: 52886,
          nouvelIndex: 52896,
          consoM3: 10,
        },
        gazoil: {
          ancienIndex: 80,
          nouvelIndex: 60,
          consoLitre: 20,
          unite: '%',
        },
        notes: 'Test groupe électrogène de secours (15j)',
      },
    ],
  },
  {
    id: 'rec-2026-09',
    mois: 'SEPTEMBRE',
    annee: 2026,
    siteId: 'site-1',
    releves: [
      {
        id: 'sep-s35',
        siteId: 'site-1',
        semaine: 'S35',
        date: '06/09/2026',
        conditionsExterieures: 'Tempéré / 23°C',
        electricite: {
          actifHcNuit: 6577800,
          actifHpJour: 2332100,
          actifHdePointe: 1563200,
          reactifTriphase: 4465400,
        },
        eau: {
          ancienIndex: 52896,
          nouvelIndex: 52906,
          consoM3: 10,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 100,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'sep-s36',
        siteId: 'site-1',
        semaine: 'S36',
        date: '13/09/2026',
        conditionsExterieures: 'Nuageux / 21°C',
        electricite: {
          actifHcNuit: 6585100,
          actifHpJour: 2339800,
          actifHdePointe: 1568900,
          reactifTriphase: 4471100,
        },
        eau: {
          ancienIndex: 52906,
          nouvelIndex: 52918,
          consoM3: 12,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 85,
          consoLitre: 15,
          unite: '%',
        },
      },
      {
        id: 'sep-s37',
        siteId: 'site-1',
        semaine: 'S37',
        date: '20/09/2026',
        conditionsExterieures: 'Pluvieux / 18°C',
        electricite: {
          actifHcNuit: 6592400,
          actifHpJour: 2347200,
          actifHdePointe: 1574500,
          reactifTriphase: 4476900,
        },
        eau: {
          ancienIndex: 52918,
          nouvelIndex: 52927,
          consoM3: 9,
        },
        gazoil: {
          ancienIndex: 85,
          nouvelIndex: 85,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'sep-s38',
        siteId: 'site-1',
        semaine: 'S38',
        date: '27/09/2026',
        conditionsExterieures: 'Frais / 16°C',
        electricite: {
          actifHcNuit: 6599600,
          actifHpJour: 2354500,
          actifHdePointe: 1580100,
          reactifTriphase: 4482600,
        },
        eau: {
          ancienIndex: 52927,
          nouvelIndex: 52938,
          consoM3: 11,
        },
        gazoil: {
          ancienIndex: 85,
          nouvelIndex: 70,
          consoLitre: 15,
          unite: '%',
        },
      },
    ],
  },
  {
    id: 'rec-2026-10',
    mois: 'OCTOBRE',
    annee: 2026,
    siteId: 'site-1',
    releves: [
      {
        id: 'oct-s40',
        siteId: 'site-1',
        semaine: 'S40',
        date: '04/10/2026',
        conditionsExterieures: 'Automnal / 15°C',
        electricite: {
          actifHcNuit: 6607200,
          actifHpJour: 2362000,
          actifHdePointe: 1585900,
          reactifTriphase: 4488500,
        },
        eau: {
          ancienIndex: 52938,
          nouvelIndex: 52948,
          consoM3: 10,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 100,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'oct-s41',
        siteId: 'site-1',
        semaine: 'S41',
        date: '11/10/2026',
        conditionsExterieures: 'Pluvieux / 13°C',
        electricite: {
          actifHcNuit: 6614800,
          actifHpJour: 2369500,
          actifHdePointe: 1591700,
          reactifTriphase: 4494300,
        },
        eau: {
          ancienIndex: 52948,
          nouvelIndex: 52959,
          consoM3: 11,
        },
        gazoil: {
          ancienIndex: 100,
          nouvelIndex: 80,
          consoLitre: 20,
          unite: '%',
        },
      },
      {
        id: 'oct-s42',
        siteId: 'site-1',
        semaine: 'S42',
        date: '18/10/2026',
        conditionsExterieures: 'Froid matinal / 11°C',
        electricite: {
          actifHcNuit: 6622500,
          actifHpJour: 2377100,
          actifHdePointe: 1597600,
          reactifTriphase: 4500200,
        },
        eau: {
          ancienIndex: 52959,
          nouvelIndex: 52968,
          consoM3: 9,
        },
        gazoil: {
          ancienIndex: 80,
          nouvelIndex: 80,
          consoLitre: 0,
          unite: '%',
        },
      },
      {
        id: 'oct-s43',
        siteId: 'site-1',
        semaine: 'S43',
        date: '25/10/2026',
        conditionsExterieures: 'Venté / 12°C',
        electricite: {
          actifHcNuit: 6630300,
          actifHpJour: 2384800,
          actifHdePointe: 1603500,
          reactifTriphase: 4506300,
        },
        eau: {
          ancienIndex: 52968,
          nouvelIndex: 52978,
          consoM3: 10,
        },
        gazoil: {
          ancienIndex: 80,
          nouvelIndex: 60,
          consoLitre: 20,
          unite: '%',
        },
      },
    ],
  },
];

export const MONTH_NAMES = [
  'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'
];
