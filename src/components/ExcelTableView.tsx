import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Info, 
  FileSpreadsheet, 
  Save, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MonthRecord, WeeklyReading, Site } from '../types/energy';
import { calculateMonthSummary, formatNumber } from '../utils/calculations';

interface ExcelTableViewProps {
  currentRecord: MonthRecord;
  site: Site;
  onUpdateRecord: (updated: MonthRecord) => void;
  onOpenAddModal: () => void;
}

export const ExcelTableView: React.FC<ExcelTableViewProps> = ({
  currentRecord,
  site,
  onUpdateRecord,
  onOpenAddModal,
}) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Sommaire calculé à partir des données
  const dummyTariffs = {
    elecCostHcNuit: 0.12,
    elecCostHpJour: 0.19,
    elecCostPointe: 0.28,
    elecCostReactifPenalty: 0.035,
    eauCostM3: 3.8,
    gazoilCostL: 1.68,
    currency: '€',
    co2ElecKgPerKwh: 0.055,
    co2FuelKgPerL: 2.68,
  };
  const summary = calculateMonthSummary(currentRecord, dummyTariffs, site);

  const releves = currentRecord.releves || [];

  const handleCellChange = (
    readingId: string, 
    field: string, 
    value: string | number
  ) => {
    const updatedReleves = releves.map((r) => {
      if (r.id !== readingId) return r;

      if (field === 'semaine') return { ...r, semaine: String(value) };
      if (field === 'conditionsExterieures') return { ...r, conditionsExterieures: String(value) };

      // Electricité
      if (field === 'actifHcNuit') {
        return { ...r, electricite: { ...r.electricite, actifHcNuit: Number(value) || 0 } };
      }
      if (field === 'actifHpJour') {
        return { ...r, electricite: { ...r.electricite, actifHpJour: Number(value) || 0 } };
      }
      if (field === 'actifHdePointe') {
        return { ...r, electricite: { ...r.electricite, actifHdePointe: Number(value) || 0 } };
      }
      if (field === 'reactifTriphase') {
        return { ...r, electricite: { ...r.electricite, reactifTriphase: Number(value) || 0 } };
      }

      // Eau
      if (field === 'eauAncien') {
        const anc = Number(value) || 0;
        const nouv = r.eau.nouvelIndex;
        return { ...r, eau: { ...r.eau, ancienIndex: anc, consoM3: Math.max(0, nouv - anc) } };
      }
      if (field === 'eauNouvel') {
        const nouv = Number(value) || 0;
        const anc = r.eau.ancienIndex;
        return { ...r, eau: { ...r.eau, nouvelIndex: nouv, consoM3: Math.max(0, nouv - anc) } };
      }

      // Gazoil
      if (field === 'gazoilAncien') {
        return { ...r, gazoil: { ...r.gazoil, ancienIndex: Number(value) || 0 } };
      }
      if (field === 'gazoilNouvel') {
        return { ...r, gazoil: { ...r.gazoil, nouvelIndex: Number(value) || 0 } };
      }
      if (field === 'gazoilConso') {
        return { ...r, gazoil: { ...r.gazoil, consoLitre: Number(value) || 0 } };
      }

      return r;
    });

    onUpdateRecord({
      ...currentRecord,
      releves: updatedReleves,
    });
  };

  const handleDeleteRow = (id: string) => {
    if (confirm('Voulez-vous supprimer ce relevé ?')) {
      const updated = releves.filter((r) => r.id !== id);
      onUpdateRecord({
        ...currentRecord,
        releves: updated,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'information & mode d'emploi */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              <span>Feuille de Relevé Hebdomadaire</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                Modèle Excel Conforme
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Reproduction exacte de votre tableau Excel. Les index sont cumulatifs, et la ligne verte 
              <strong> « Conso »</strong> en bas calcule automatiquement les consommations réelles du mois.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une semaine</span>
          </button>
        </div>
      </div>

      {/* Conteneur Tableau Excel avec style authentique */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-300">
        {/* Titre Rouge Centralisé (identique à l'image 'AOUT') */}
        <div className="py-2.5 bg-slate-100 border-b border-slate-300 flex justify-center items-center">
          <div className="bg-red-600 text-white font-black tracking-widest text-lg sm:text-xl px-12 py-1 shadow-sm uppercase rounded-xs">
            {currentRecord.mois}
          </div>
        </div>

        {/* Tableau défilable */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm font-sans select-none">
            {/* Super En-têtes */}
            <thead>
              <tr className="border-b border-slate-400 text-center font-bold">
                {/* SITE */}
                <th
                  rowSpan={2}
                  className="bg-[#ffc000] text-slate-900 border-r border-slate-400 px-4 py-2.5 min-w-[120px] uppercase font-black"
                >
                  SITE
                </th>

                {/* DATE */}
                <th
                  rowSpan={2}
                  className="bg-[#b3ecff] text-slate-900 border-r border-slate-400 px-3 py-2.5 min-w-[80px] uppercase font-black"
                >
                  DATE
                </th>

                {/* Conditions extérieures */}
                <th
                  rowSpan={2}
                  className="bg-[#ffff00] text-slate-900 border-r border-slate-400 px-3 py-2.5 min-w-[170px] uppercase font-black"
                >
                  Conditions extérieures
                </th>

                {/* Compteur d'électricité */}
                <th
                  colSpan={4}
                  className="bg-[#00c5cd] text-slate-950 border-r border-slate-400 px-4 py-2 uppercase font-black tracking-tight"
                >
                  Compteur d'electricite en kw/h /7j
                </th>

                {/* Compteur d'eau */}
                <th
                  colSpan={3}
                  className="bg-[#f8cbad] text-slate-950 border-r border-slate-400 px-3 py-2 uppercase font-black tracking-tight"
                >
                  Compteur d'eau en m3 /7j
                </th>

                {/* Compteur gazoil */}
                <th
                  colSpan={3}
                  className="bg-[#f8b9d4] text-slate-950 border-r border-slate-400 px-3 py-2 uppercase font-black tracking-tight"
                >
                  Compteur gazoil en litre / 15J
                </th>

                {/* Actions */}
                <th
                  rowSpan={2}
                  className="bg-slate-200 text-slate-700 px-2 py-2 min-w-[50px] font-semibold"
                >
                  Actions
                </th>
              </tr>

              {/* Sous En-têtes */}
              <tr className="border-b-2 border-slate-500 text-center font-semibold text-[11px] sm:text-xs">
                {/* Électricité */}
                <th className="bg-[#ccf2ff] text-slate-900 border-r border-slate-400 px-2.5 py-1.5 font-bold">
                  Actif H. de Creuse<br />
                  <span className="font-normal text-[10px] text-slate-700">nuit</span>
                </th>
                <th className="bg-[#ccf2ff] text-slate-900 border-r border-slate-400 px-2.5 py-1.5 font-bold">
                  Actif H. Pleines<br />
                  <span className="font-normal text-[10px] text-slate-700">jour</span>
                </th>
                <th className="bg-[#ccf2ff] text-slate-900 border-r border-slate-400 px-2.5 py-1.5 font-bold">
                  Actif H. de<br />
                  <span className="font-normal text-[10px] text-slate-700">pointe</span>
                </th>
                <th className="bg-[#ccf2ff] text-slate-900 border-r border-slate-400 px-2.5 py-1.5 font-bold">
                  Réactif<br />
                  <span className="font-normal text-[10px] text-slate-700">triphasé</span>
                </th>

                {/* Eau */}
                <th className="bg-[#fce4d6] text-slate-900 border-r border-slate-400 px-2 py-1.5">
                  ancien index
                </th>
                <th className="bg-[#fce4d6] text-slate-900 border-r border-slate-400 px-2 py-1.5">
                  nouvel index
                </th>
                <th className="bg-[#fce4d6] text-slate-900 border-r border-slate-400 px-2 py-1.5 font-bold">
                  conso.en m3
                </th>

                {/* Gazoil */}
                <th className="bg-[#fce8f0] text-slate-900 border-r border-slate-400 px-2 py-1.5">
                  ancien index
                </th>
                <th className="bg-[#fce8f0] text-slate-900 border-r border-slate-400 px-2 py-1.5">
                  nouvel index
                </th>
                <th className="bg-[#fce8f0] text-slate-900 border-r border-slate-400 px-2 py-1.5 font-bold">
                  conso.en L
                </th>
              </tr>
            </thead>

            {/* Corps du tableau */}
            <tbody className="divide-y divide-slate-300">
              {releves.map((row, index) => {
                const isEditing = editingRowId === row.id;
                const waterDelta = row.eau.consoM3 !== undefined 
                  ? row.eau.consoM3 
                  : (row.eau.nouvelIndex - row.eau.ancienIndex);

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-amber-50/50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    {/* SITE (fusion visuelle ou première cellule) */}
                    <td className="border-r border-slate-400 px-3 py-2 text-center font-bold text-slate-800 bg-[#fffae6]/60">
                      {index === 0 ? (
                        <div className="font-semibold text-amber-900 leading-tight">
                          {site.nom.split('-')[0] || site.code}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">- " -</span>
                      )}
                    </td>

                    {/* DATE (ex: S30, S31...) */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-center font-bold text-blue-900 bg-[#eef9ff]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.semaine}
                          onChange={(e) => handleCellChange(row.id, 'semaine', e.target.value)}
                          className="w-16 text-center border border-blue-400 rounded px-1 py-0.5 bg-white font-bold"
                        />
                      ) : (
                        <div>
                          <div>{row.semaine}</div>
                          {row.date && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              {row.date}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Conditions extérieures */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-slate-800 bg-[#ffffe6]/70">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.conditionsExterieures}
                          onChange={(e) => handleCellChange(row.id, 'conditionsExterieures', e.target.value)}
                          className="w-full text-xs border border-amber-300 rounded px-1.5 py-0.5 bg-white"
                        />
                      ) : (
                        <div className="truncate max-w-[190px]" title={row.conditionsExterieures}>
                          {row.conditionsExterieures || <span className="text-slate-300 italic">-</span>}
                        </div>
                      )}
                    </td>

                    {/* Électricité : Actif Heures Creuses nuit */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono font-semibold text-cyan-950 bg-[#e0f7ff]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.electricite.actifHcNuit}
                          onChange={(e) => handleCellChange(row.id, 'actifHcNuit', e.target.value)}
                          className="w-24 text-right border border-cyan-400 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.electricite.actifHcNuit)}</span>
                      )}
                    </td>

                    {/* Électricité : Actif Heures Pleines jour */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono font-semibold text-cyan-950 bg-[#e0f7ff]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.electricite.actifHpJour}
                          onChange={(e) => handleCellChange(row.id, 'actifHpJour', e.target.value)}
                          className="w-24 text-right border border-cyan-400 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.electricite.actifHpJour)}</span>
                      )}
                    </td>

                    {/* Électricité : Actif Heures de Pointe */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono font-semibold text-cyan-950 bg-[#e0f7ff]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.electricite.actifHdePointe}
                          onChange={(e) => handleCellChange(row.id, 'actifHdePointe', e.target.value)}
                          className="w-24 text-right border border-cyan-400 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.electricite.actifHdePointe)}</span>
                      )}
                    </td>

                    {/* Électricité : Réactif Triphasé */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono font-semibold text-cyan-950 bg-[#e0f7ff]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.electricite.reactifTriphase}
                          onChange={(e) => handleCellChange(row.id, 'reactifTriphase', e.target.value)}
                          className="w-24 text-right border border-cyan-400 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.electricite.reactifTriphase)}</span>
                      )}
                    </td>

                    {/* Eau : Ancien index */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono text-slate-800 bg-[#fff2eb]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.eau.ancienIndex}
                          onChange={(e) => handleCellChange(row.id, 'eauAncien', e.target.value)}
                          className="w-20 text-right border border-orange-300 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.eau.ancienIndex)}</span>
                      )}
                    </td>

                    {/* Eau : Nouvel index */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono text-slate-800 bg-[#fff2eb]/40">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.eau.nouvelIndex}
                          onChange={(e) => handleCellChange(row.id, 'eauNouvel', e.target.value)}
                          className="w-20 text-right border border-orange-300 rounded px-1 py-0.5 bg-white font-mono"
                        />
                      ) : (
                        <span>{formatNumber(row.eau.nouvelIndex)}</span>
                      )}
                    </td>

                    {/* Eau : Conso calculée en m3 */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-right font-mono font-bold text-amber-950 bg-[#fdeee4]">
                      <span>{waterDelta}</span>
                    </td>

                    {/* Gazoil : Ancien index */}
                    <td className="border-r border-slate-400 px-2 py-2 text-center text-slate-700 bg-[#fff0f6]/40">
                      {row.gazoil.consoLitre > 0 ? (
                        <span className="font-mono">{row.gazoil.ancienIndex}%</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Gazoil : Nouvel index */}
                    <td className="border-r border-slate-400 px-2 py-2 text-center text-slate-700 bg-[#fff0f6]/40">
                      {row.gazoil.consoLitre > 0 ? (
                        <span className="font-mono">{row.gazoil.nouvelIndex}%</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Gazoil : Conso en L ou % */}
                    <td className="border-r border-slate-400 px-2.5 py-2 text-center font-bold text-rose-950 bg-[#fce8f0]">
                      {isEditing ? (
                        <input
                          type="number"
                          value={row.gazoil.consoLitre}
                          onChange={(e) => handleCellChange(row.id, 'gazoilConso', e.target.value)}
                          className="w-16 text-center border border-pink-400 rounded px-1 py-0.5 bg-white font-bold"
                        />
                      ) : (
                        <span>
                          {row.gazoil.consoLitre > 0 ? `${row.gazoil.consoLitre}%` : ''}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-2 text-center bg-slate-50">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setEditingRowId(isEditing ? null : row.id)}
                          className={`p-1 rounded transition-colors ${
                            isEditing 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                          title={isEditing ? 'Valider la saisie' : 'Éditer en direct'}
                        >
                          {isEditing ? <Save className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Ligne TOTAL CONSO (Vert pastel, exactement comme l'image) */}
              <tr className="bg-[#a9d08e] text-slate-950 font-black border-t-2 border-b-2 border-slate-600 text-xs sm:text-sm">
                <td colSpan={3} className="border-r border-slate-600 px-4 py-3 text-right uppercase tracking-wider font-extrabold text-slate-900">
                  Conso
                </td>

                {/* Électricité HC nuit totale */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-right font-mono font-black text-slate-950">
                  {formatNumber(summary.totalHcNuit)}
                </td>

                {/* Électricité HP jour totale */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-right font-mono font-black text-slate-950">
                  {formatNumber(summary.totalHpJour)}
                </td>

                {/* Électricité Pointe totale */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-right font-mono font-black text-slate-950">
                  {formatNumber(summary.totalHdePointe)}
                </td>

                {/* Réactif triphasé total */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-right font-mono font-black text-slate-950">
                  {formatNumber(summary.totalReactifKvarh)}
                </td>

                {/* Eau ancien et nouvel index vides pour la ligne de synthèse */}
                <td colSpan={2} className="border-r border-slate-600 px-2 py-3 text-center text-slate-700 italic text-xs">
                  Cumul mensuel
                </td>

                {/* Conso Eau totale m3 */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-right font-mono font-black text-slate-950">
                  {summary.totalEauM3}
                </td>

                {/* Gazoil ancien et nouvel index */}
                <td colSpan={2} className="border-r border-slate-600 px-2 py-3 text-center text-slate-700 italic text-xs">
                  Cumul 15j / mois
                </td>

                {/* Conso Gazoil totale */}
                <td className="border-r border-slate-600 px-2.5 py-3 text-center font-mono font-black text-slate-950">
                  {summary.totalGazoilPct > 0 ? `${summary.totalGazoilPct}%` : '0%'}
                </td>

                <td className="bg-[#9bc27a] px-2 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pied de tableau avec résumé et formules */}
        <div className="bg-slate-50 border-t border-slate-300 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>
              <strong>Formule de consommation électricité :</strong> Conso = Index Fin de Mois ({releves.length > 0 ? releves[releves.length - 1].semaine : '-'}) - Index Début de Mois ({releves.length > 0 ? releves[0].semaine : '-'}).
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
              <span>Actif Total : <strong>{formatNumber(summary.totalActifKwh)} kWh</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span>Eau : <strong>{summary.totalEauM3} m³</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
              <span>Gazoil : <strong>{summary.totalGazoilL} L ({summary.totalGazoilPct}%)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes explicatives des 3 fluides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Electricité Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Électricité (kWh)
            </h4>
            <span className="text-xs font-mono text-slate-400">{formatNumber(summary.totalActifKwh)} kWh</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">H. Creuses (nuit) :</span>
              <span className="font-mono font-medium">{formatNumber(summary.totalHcNuit)} kWh ({summary.totalActifKwh > 0 ? Math.round((summary.totalHcNuit / summary.totalActifKwh) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">H. Pleines (jour) :</span>
              <span className="font-mono font-medium">{formatNumber(summary.totalHpJour)} kWh ({summary.totalActifKwh > 0 ? Math.round((summary.totalHpJour / summary.totalActifKwh) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">H. de Pointe :</span>
              <span className="font-mono font-medium text-amber-400">{formatNumber(summary.totalHdePointe)} kWh ({summary.totalActifKwh > 0 ? Math.round((summary.totalHdePointe / summary.totalActifKwh) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Énergie Réactive :</span>
              <span className="font-mono font-medium text-cyan-300">{formatNumber(summary.totalReactifKvarh)} kVARh</span>
            </div>
          </div>
        </div>

        {/* Eau Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Eau Sanitaire & Process (m³)
            </h4>
            <span className="text-xs font-mono text-slate-400">{summary.totalEauM3} m³</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Index Début de Mois :</span>
              <span className="font-mono">{formatNumber(releves[0]?.eau.ancienIndex || 0)} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Index Fin de Mois :</span>
              <span className="font-mono">{formatNumber(releves[releves.length - 1]?.eau.nouvelIndex || 0)} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume Total :</span>
              <span className="font-mono font-semibold text-emerald-400">{formatNumber(summary.totalEauLitres)} Litres</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Moyenne Journalière :</span>
              <span className="font-mono">{summary.avgEauM3PerDay} m³/jour</span>
            </div>
          </div>
        </div>

        {/* Gazoil Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Gazoil Cuve / Groupes (L)
            </h4>
            <span className="text-xs font-mono text-slate-400">{summary.totalGazoilPct}% consommé</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Capacité Cuve :</span>
              <span className="font-mono">{formatNumber(site.capaciteCuveGazoilL)} Litres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consommé Mensuel :</span>
              <span className="font-mono font-medium text-rose-300">{formatNumber(summary.totalGazoilL)} L ({summary.totalGazoilPct}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Niveau Actuel Cuve :</span>
              <span className="font-mono font-semibold text-cyan-400">{summary.currentTankLevelPct}% ({formatNumber(summary.currentTankLevelL)} L)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Autonomie Estimée :</span>
              <span className="font-mono text-emerald-400">~{summary.estimatedAutonomyDays} jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
