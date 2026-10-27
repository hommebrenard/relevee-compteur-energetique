import React from 'react';
import { X, Download, FileSpreadsheet, FileJson, Printer, Check } from 'lucide-react';
import { MonthRecord, Site, EnergyTariffs } from '../types/energy';
import { calculateMonthSummary, formatNumber } from '../utils/calculations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: MonthRecord;
  site: Site;
  tariffs: EnergyTariffs;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  site,
  tariffs,
}) => {
  if (!isOpen) return null;

  const summary = calculateMonthSummary(currentRecord, tariffs, site);

  // Exporter en CSV compatible Excel français (séparateur point-virgule avec BOM UTF-8)
  const handleExportCsv = () => {
    let csv = '\uFEFF'; // BOM UTF-8 pour Excel
    csv += `RELEVE ENERGETIQUE MENSUEL - ${currentRecord.mois} ${currentRecord.annee}\n`;
    csv += `Site:;${site.nom} (${site.code})\n\n`;

    // Entêtes
    csv += 'SITE;DATE;Conditions exterieures;Actif HC nuit (kWh);Actif HP jour (kWh);Actif H. pointe (kWh);Reactif triphase (kVARh);Eau Ancien (m3);Eau Nouvel (m3);Eau Conso (m3);Gazoil Ancien;Gazoil Nouvel;Gazoil Conso\n';

    // Lignes
    currentRecord.releves.forEach((r) => {
      const waterDelta = r.eau.consoM3 !== undefined ? r.eau.consoM3 : (r.eau.nouvelIndex - r.eau.ancienIndex);
      csv += `"${site.nom}";"${r.semaine} - ${r.date}";"${r.conditionsExterieures || ''}";${r.electricite.actifHcNuit};${r.electricite.actifHpJour};${r.electricite.actifHdePointe};${r.electricite.reactifTriphase};${r.eau.ancienIndex};${r.eau.nouvelIndex};${waterDelta};${r.gazoil.ancienIndex}%;${r.gazoil.nouvelIndex}%;${r.gazoil.consoLitre}%\n`;
    });

    // Ligne Conso Totale
    csv += `\nCONSO DU MOIS;;;${summary.totalHcNuit};${summary.totalHpJour};${summary.totalHdePointe};${summary.totalReactifKvarh};;;${summary.totalEauM3};;;${summary.totalGazoilPct}%\n`;
    csv += `\nINDICATEURS GLOBAUX\n`;
    csv += `Total Actif (kWh);${summary.totalActifKwh}\n`;
    csv += `Total Reactif (kVARh);${summary.totalReactifKvarh}\n`;
    csv += `Facteur Tan(phi);${summary.tanPhi}\n`;
    csv += `Facteur Cos(phi);${summary.cosPhi}\n`;
    csv += `Conso Eau (m3);${summary.totalEauM3}\n`;
    csv += `Conso Gazoil (L);${summary.totalGazoilL}\n`;
    csv += `Cout Global Estime (${tariffs.currency});${summary.costGlobal}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EnerTrack_${site.code}_${currentRecord.mois}_${currentRecord.annee}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EnerTrack_Data_${currentRecord.mois}_${currentRecord.annee}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Exporter ou Imprimer le Relevé
              </h3>
              <p className="text-xs text-slate-400">
                {currentRecord.mois} {currentRecord.annee} · {site.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options d'export */}
        <div className="p-6 space-y-4">
          {/* Option 1: CSV Excel */}
          <div
            onClick={handleExportCsv}
            className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Exporter au format Excel (.CSV)
                </h4>
                <p className="text-xs text-slate-400">
                  Prêt à ouvrir dans Microsoft Excel ou Google Sheets avec séparateur point-virgule et encodage UTF-8.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
          </div>

          {/* Option 2: Impression / Rapport PDF */}
          <div
            onClick={handlePrint}
            className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Imprimer / Rapport Synthèse
                </h4>
                <p className="text-xs text-slate-400">
                  Imprimez ou enregistrez en PDF via la boîte de dialogue d'impression système.
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
          </div>

          {/* Option 3: JSON Backup */}
          <div
            onClick={handleExportJson}
            className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Sauvegarde Brut (.JSON)
                </h4>
                <p className="text-xs text-slate-400">
                  Télécharger les données structurées brutes pour archivage ou intégration API.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
          </div>
        </div>

        {/* Pied modal */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
