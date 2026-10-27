import React, { useState } from 'react';
import { 
  Zap, 
  Droplet, 
  Fuel, 
  Euro, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ThermometerSun, 
  Gauge, 
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ReferenceLine 
} from 'recharts';
import { MonthRecord, Site, EnergyTariffs } from '../types/energy';
import { calculateMonthSummary, formatNumber } from '../utils/calculations';

interface DashboardViewProps {
  currentRecord: MonthRecord;
  allRecords: MonthRecord[];
  site: Site;
  tariffs: EnergyTariffs;
  onOpenAddModal: () => void;
  onSwitchToExcel: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRecord,
  allRecords,
  site,
  tariffs,
  onOpenAddModal,
  onSwitchToExcel,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'electricity' | 'water' | 'fuel' | 'compare'>('overview');

  const summary = calculateMonthSummary(currentRecord, tariffs, site);
  const weeklyData = summary.weeklyDeltas;

  // Calcul du mois précédent pour les pourcentages de variation
  const currentMonthIndex = allRecords.findIndex((r) => r.id === currentRecord.id);
  const prevRecord = currentMonthIndex > 0 ? allRecords[currentMonthIndex - 1] : null;
  const prevSummary = prevRecord ? calculateMonthSummary(prevRecord, tariffs, site) : null;

  const elecVarPct = prevSummary && prevSummary.totalActifKwh > 0
    ? ((summary.totalActifKwh - prevSummary.totalActifKwh) / prevSummary.totalActifKwh) * 100
    : 0;

  const eauVarPct = prevSummary && prevSummary.totalEauM3 > 0
    ? ((summary.totalEauM3 - prevSummary.totalEauM3) / prevSummary.totalEauM3) * 100
    : 0;

  // Données de répartition Heures Creuses / Pleines / Pointe pour le Pie Chart
  const elecDistributionData = [
    { name: 'Heures Creuses (Nuit)', value: summary.totalHcNuit, color: '#38bdf8' },
    { name: 'Heures Pleines (Jour)', value: summary.totalHpJour, color: '#0284c7' },
    { name: 'Heures de Pointe', value: summary.totalHdePointe, color: '#f59e0b' },
  ];

  // Données de répartition des Coûts
  const costDistributionData = [
    { name: 'Électricité Actif', value: summary.costElecHcNuit + summary.costElecHpJour + summary.costElecPointe, color: '#0ea5e9' },
    { name: 'Pénalité Réactif', value: summary.costReactifPenalty, color: '#ef4444' },
    { name: 'Eau', value: summary.costEauTotal, color: '#f97316' },
    { name: 'Gazoil', value: summary.costGazoilTotal, color: '#ec4899' },
  ].filter(d => d.value > 0);

  // Données comparatives multi-mois
  const multiMonthData = allRecords.map((rec) => {
    const s = calculateMonthSummary(rec, tariffs, site);
    return {
      mois: rec.mois,
      actifKwh: s.totalActifKwh,
      eauM3: s.totalEauM3,
      gazoilL: s.totalGazoilL,
      coutTotal: s.costGlobal,
      tanPhi: s.tanPhi,
    };
  });

  return (
    <div className="space-y-6">
      {/* Barre de contexte du site & alertes intelligentes */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Bilan Mensuel Énergétique</span>
            <span>·</span>
            <span className="text-cyan-400">{site.nom}</span>
            <span>·</span>
            <span className="text-amber-400">{currentRecord.mois} {currentRecord.annee}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span>Tableau de Bord des Consommations</span>
            <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentRecord.releves.length} relevés hebdomadaires
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidation automatique des compteurs d'électricité triphasée (HC/HP/Pointe), eau sanitaire & process, et gazoil cuve.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onSwitchToExcel}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-medium border border-slate-600 transition-colors cursor-pointer"
          >
            <span>Voir Feuille Excel</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nouveau Relevé</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Principales (5 cartes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Electricité Totale */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4" /> Électricité Totale
              </span>
              {prevSummary && (
                <span className={`flex items-center text-[11px] font-semibold ${elecVarPct >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {elecVarPct >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(Math.round(elecVarPct))}%
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {formatNumber(summary.totalActifKwh)}
              <span className="text-xs font-normal text-slate-400 ml-1">kWh</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span title="Heures Creuses">HC: <strong className="text-slate-200">{formatNumber(summary.totalHcNuit)}</strong></span>
            <span title="Heures Pleines">HP: <strong className="text-slate-200">{formatNumber(summary.totalHpJour)}</strong></span>
            <span title="Pointe" className="text-amber-400">Pte: <strong>{formatNumber(summary.totalHdePointe)}</strong></span>
          </div>
        </div>

        {/* KPI 2: Cosinus Phi & Réactif */}
        <div className={`bg-slate-900 border rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between transition-colors ${
          summary.isCosPhiConform 
            ? 'border-slate-800 hover:border-emerald-500/40' 
            : 'border-red-900/60 bg-red-950/10'
        }`}>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Gauge className="w-4 h-4" /> Facteur Puissance
              </span>
              {summary.isCosPhiConform ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Conforme
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Tan φ &gt; 0.4
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{summary.cosPhi}</span>
              <span className="text-xs font-normal text-slate-400">cos(φ)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tan φ: <strong className="text-slate-200">{summary.tanPhi}</strong></span>
            <span>Réactif: <strong className="text-slate-200">{formatNumber(summary.totalReactifKvarh)}</strong></span>
          </div>
        </div>

        {/* KPI 3: Eau */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Droplet className="w-4 h-4" /> Eau Totale
              </span>
              {prevSummary && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {summary.totalEauM3} m³
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {summary.totalEauM3}
              <span className="text-xs font-normal text-slate-400 ml-1">m³</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Vol: <strong className="text-slate-200">{formatNumber(summary.totalEauLitres)} L</strong></span>
            <span>Moy: <strong className="text-slate-200">{summary.avgEauM3PerDay} m³/j</strong></span>
          </div>
        </div>

        {/* KPI 4: Gazoil Cuve */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-rose-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Fuel className="w-4 h-4" /> Gazoil Consommé
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Cuve: {summary.currentTankLevelPct}%
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {formatNumber(summary.totalGazoilL)}
              <span className="text-xs font-normal text-slate-400 ml-1">Litres</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Conso: <strong className="text-rose-300">{summary.totalGazoilPct}%</strong></span>
            <span>Reste: <strong className="text-emerald-400">{formatNumber(summary.currentTankLevelL)} L</strong></span>
          </div>
        </div>

        {/* KPI 5: Coût Global Estimé & Carbone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Euro className="w-4 h-4" /> Facture Estimée
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {tariffs.currency}
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatNumber(summary.costGlobal)}
              <span className="text-xs font-normal text-slate-300 ml-1">{tariffs.currency}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-300">
              <Leaf className="w-3 h-3 text-emerald-400" />
              {(summary.co2TotalKg / 1000).toFixed(1)} t CO₂e
            </span>
            <span className="text-slate-400 text-[10px]">Tous fluides</span>
          </div>
        </div>
      </div>

      {/* Alerte Industrielle Tan(phi) / Surconsommation si existante */}
      {!summary.isCosPhiConform && (
        <div className="bg-red-950/30 border border-red-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold text-red-200">
              Alerte de Pénalité d'Énergie Réactive (Tan φ = {summary.tanPhi} &gt; 0.40)
            </h4>
            <p className="text-red-300/90 mt-0.5 leading-relaxed">
              La puissance réactive dépasse le seuil contractuel de 40% de l'actif ({formatNumber(summary.excessReactifKvarh)} kVARh excédentaires). 
              Pénalité estimée sur la facture : <strong>{formatNumber(summary.costReactifPenalty)} {tariffs.currency}</strong>.
              Recommandation : Vérifier l'enclenchement des gradins de la batterie de condensateurs ou compenser les charges inductives.
            </p>
          </div>
        </div>
      )}

      {/* Navigation par Onglets Intuitifs */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Vue d'Ensemble & Fluides
        </button>
        <button
          onClick={() => setActiveTab('electricity')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'electricity'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Électricité & Tranches (HC/HP/Pointe)
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'water'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Eau & Débits Process
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'fuel'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Gazoil & Jauge Cuve
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'compare'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Comparateur Multi-Mois
        </button>
      </div>

      {/* Contenu de l'onglet actif */}

      {/* VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique 1: Évolution Hebdomadaire Électricité (Stacked Bar) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Consommation Électrique par Semaine (kWh)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Détail hebdomadaire calculé par différence d'index selon le relevé
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
                  {formatNumber(summary.totalActifKwh)} kWh total
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="semaine" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any, name: any) => [`${formatNumber(Number(val) || 0)} kWh`, String(name || '')]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="consoHcNuit" name="H. Creuses Nuit" fill="#38bdf8" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="consoHpJour" name="H. Pleines Jour" fill="#0284c7" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="consoHdePointe" name="H. de Pointe" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Répartition Électricité & Mix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Répartition Tarifaire
                </h3>
                <p className="text-xs text-slate-400">
                  Part de consommation par plage horaire
                </p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={elecDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {elecDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any) => [`${formatNumber(Number(val) || 0)} kWh`, 'Conso']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {formatNumber(summary.totalActifKwh)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {elecDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-mono text-slate-400 font-medium">
                      {summary.totalActifKwh > 0 ? Math.round((item.value / summary.totalActifKwh) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grille 2: Eau, Gazoil et Conditions Extérieures */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Suivi Eau m3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-amber-400" />
                  Consommation Eau (m³/semaine)
                </h4>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  {summary.totalEauM3} m³
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="semaine" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any) => [`${Number(val) || 0} m³`, 'Volume']}
                    />
                    <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moyenne', fill: '#f59e0b', fontSize: 10 }} />
                    <Bar dataKey="consoEauM3" name="Eau (m³)" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                <span>Pic en S31 : <strong>16 m³</strong></span>
                <span>Débit moyen : <strong>{summary.avgEauM3PerDay} m³/jour</strong></span>
              </div>
            </div>

            {/* Suivi Gazoil & Niveau Cuve */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-rose-400" />
                    Niveau de Cuve Gazoil
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {summary.currentTankLevelPct}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Capacité totale : {formatNumber(site.capaciteCuveGazoilL)} Litres
                </p>

                {/* Barre de progression visuelle de la cuve */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        summary.currentTankLevelPct > 40
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                          : summary.currentTankLevelPct > 20
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, summary.currentTankLevelPct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>0 L</span>
                    <span className="text-white font-bold">{formatNumber(summary.currentTankLevelL)} L disponibles</span>
                    <span>{formatNumber(site.capaciteCuveGazoilL)} L</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Consommation du mois :</span>
                  <span className="font-mono font-bold text-rose-400">{formatNumber(summary.totalGazoilL)} L ({summary.totalGazoilPct}%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Autonomie résiduelle :</span>
                  <span className="font-mono font-bold text-emerald-400">~{summary.estimatedAutonomyDays} jours</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Rythme de relevé :</span>
                  <span className="text-slate-400">Tous les 15 jours</span>
                </div>
              </div>
            </div>

            {/* Conditions Météo & Impact Usine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <ThermometerSun className="w-4 h-4 text-amber-400" />
                  Conditions Extérieures & Exploitation
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Notes relevées par les techniciens sur site
                </p>

                <div className="space-y-2">
                  {currentRecord.releves.map((r) => (
                    <div key={r.id} className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/50 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span className="text-cyan-400">{r.semaine}</span>
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5 truncate" title={r.conditionsExterieures}>
                        {r.conditionsExterieures || 'Conditions normales'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Constat : Le pic de chaleur (35°C en S31) corrèle avec la hausse d'électricité et d'eau de refroidissement.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE ÉLECTRICITÉ DÉTAILLÉE */}
      {activeTab === 'electricity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Détail Hebdomadaire des Tranches Électriques
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Courbe d'évolution des Heures Creuses (bleu clair), Pleines (bleu foncé), et Pointe (orange)
              </p>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPointe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="semaine" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any) => [`${formatNumber(Number(val) || 0)} kWh`, 'Conso']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="consoHcNuit" name="H. Creuses" stroke="#38bdf8" fillOpacity={1} fill="url(#colorHc)" />
                    <Area type="monotone" dataKey="consoHpJour" name="H. Pleines" stroke="#0284c7" fillOpacity={1} fill="url(#colorHp)" />
                    <Area type="monotone" dataKey="consoHdePointe" name="H. Pointe" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPointe)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Audit Tan Phi & Réactif */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-indigo-400" />
                  Surveillance Facteur Tan(φ)
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Rapport Énergie Réactive / Énergie Active
                </p>

                <div className="space-y-4">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>Valeur Actuelle Tan(φ) :</span>
                      <span className={`font-mono font-bold text-sm ${summary.tanPhi <= 0.4 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {summary.tanPhi}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${summary.tanPhi <= 0.4 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (summary.tanPhi / 0.8) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>0.00</span>
                      <span className="text-amber-400 font-bold">Seuil 0.40</span>
                      <span>0.80</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Énergie Active :</span>
                      <span className="font-mono font-bold text-white">{formatNumber(summary.totalActifKwh)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Énergie Réactive :</span>
                      <span className="font-mono font-bold text-indigo-300">{formatNumber(summary.totalReactifKvarh)} kVARh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Réactif Autorisé (40%) :</span>
                      <span className="font-mono text-slate-300">{formatNumber(Math.round(summary.totalActifKwh * 0.4))} kVARh</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Dépassement pénalisé :</span>
                      <span className={`font-mono font-bold ${summary.excessReactifKvarh > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatNumber(summary.excessReactifKvarh)} kVARh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <p>
                  <strong>Conseil ingénieur :</strong> En maintenant Tan(φ) ≤ 0.40, vous évitez 100% des pénalités de dépassement réactif sur le réseau Enedis/transporteur.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE EAU & DÉBITS */}
      {activeTab === 'water' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-amber-400" />
                Évolution de la Consommation d'Eau par Semaine
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Volumes calculés par différence d'index (m³) et projection quotidienne
              </p>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="semaine" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any) => [`${Number(val) || 0} m³ (${(Number(val) || 0) * 1000} L)`, 'Volume Eau']}
                    />
                    <ReferenceLine y={10.5} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Seuil cible (10.5 m³)', fill: '#38bdf8', fontSize: 11 }} />
                    <Bar dataKey="consoEauM3" name="Eau (m³)" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-3">Synthèse Eau</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Index Compteur :</span>
                    <div className="flex justify-between font-mono font-semibold text-slate-200">
                      <span>Initial : {formatNumber(currentRecord.releves[0]?.eau.ancienIndex || 0)} m³</span>
                      <span>Final : {formatNumber(currentRecord.releves[currentRecord.releves.length - 1]?.eau.nouvelIndex || 0)} m³</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Mensuel :</span>
                      <span className="font-mono font-bold text-amber-400">{summary.totalEauM3} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volume en Litres :</span>
                      <span className="font-mono text-slate-200">{formatNumber(summary.totalEauLitres)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Moyenne par jour :</span>
                      <span className="font-mono text-slate-200">{summary.avgEauM3PerDay} m³/jour</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Coût estimé :</span>
                      <span className="font-mono font-bold text-emerald-400">{formatNumber(summary.costEauTotal)} {tariffs.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pic détecté en S31
                </div>
                Consommation de 16 m³ (+60% vs semaine S30). Corrélation directe avec les chaleurs et l'appoint du circuit de refroidissement.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE GAZOIL & JAUGE */}
      {activeTab === 'fuel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-rose-400" />
                Historique des Relevés Cuve Gazoil (15J)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Consommation des groupes électrogènes de secours et chaudières
              </p>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="semaine" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val: any) => [`${Number(val) || 0} Litres`, 'Volume Gazoil']}
                    />
                    <Bar dataKey="consoGazoilL" name="Conso Gazoil (Litres)" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-3">État du Stock Cuve</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400">Jauge Cuve :</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">{summary.currentTankLevelPct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: `${summary.currentTankLevelPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacité Nominale :</span>
                      <span className="font-mono text-slate-200">{formatNumber(site.capaciteCuveGazoilL)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volume Restant :</span>
                      <span className="font-mono font-bold text-emerald-400">{formatNumber(summary.currentTankLevelL)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consommé Mensuel :</span>
                      <span className="font-mono font-bold text-rose-400">{formatNumber(summary.totalGazoilL)} L ({summary.totalGazoilPct}%)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Coût estimé carburant :</span>
                      <span className="font-mono font-bold text-emerald-400">{formatNumber(summary.costGazoilTotal)} {tariffs.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stock suffisant
                </div>
                Autonomie estimée de ~{summary.estimatedAutonomyDays} jours. Prochain approvisionnement conseillé à 30% de jauge.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE COMPARATEUR MULTI-MOIS */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Comparaison Mensuelle des Consommations (Historique 2026)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Évolution sur les mois enregistrés (Juillet, Août, Septembre, Octobre)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Électricité Multi-Mois */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">
                  Électricité Totale (kWh)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={multiMonthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="mois" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        formatter={(val: any) => [`${formatNumber(Number(val) || 0)} kWh`, 'Électricité']}
                      />
                      <Bar dataKey="actifKwh" name="Électricité" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Facture Totale Multi-Mois */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                  Coût Global Énergie ({tariffs.currency})
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={multiMonthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="mois" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        formatter={(val: any) => [`${formatNumber(Number(val) || 0)} ${tariffs.currency}`, 'Coût Total']}
                      />
                      <Line type="monotone" dataKey="coutTotal" name="Coût Total" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
