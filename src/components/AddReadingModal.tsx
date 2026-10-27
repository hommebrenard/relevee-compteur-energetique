import React, { useState } from 'react';
import { X, Plus, Zap, Droplet, Fuel, Info, Check } from 'lucide-react';
import { WeeklyReading, Site, MonthRecord } from '../types/energy';
import { formatNumber } from '../utils/calculations';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: MonthRecord;
  site: Site;
  onAddReading: (reading: WeeklyReading) => void;
}

export const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  site,
  onAddReading,
}) => {
  if (!isOpen) return null;

  const releves = currentRecord.releves || [];
  const lastReading = releves.length > 0 ? releves[releves.length - 1] : null;

  // Déduire le prochain libellé de semaine (ex: S34 après S33)
  const defaultWeekName = (() => {
    if (!lastReading) return 'S01';
    const match = lastReading.semaine.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10) + 1;
      return `S${num < 10 ? '0' + num : num}`;
    }
    return `S${releves.length + 1}`;
  })();

  const [semaine, setSemaine] = useState(defaultWeekName);
  const [date, setDate] = useState(new Date().toLocaleDateString('fr-FR'));
  const [conditionsExterieures, setConditionsExterieures] = useState('Normal / 24°C');
  const [notes, setNotes] = useState('');

  // Electricité
  const [actifHcNuit, setActifHcNuit] = useState<number>(
    lastReading ? lastReading.electricite.actifHcNuit + 7800 : 6570095
  );
  const [actifHpJour, setActifHpJour] = useState<number>(
    lastReading ? lastReading.electricite.actifHpJour + 3200 : 2324288
  );
  const [actifHdePointe, setActifHdePointe] = useState<number>(
    lastReading ? lastReading.electricite.actifHdePointe + 1900 : 1557617
  );
  const [reactifTriphase, setReactifTriphase] = useState<number>(
    lastReading ? lastReading.electricite.reactifTriphase + 5800 : 4459622
  );

  // Eau
  const [eauAncien, setEauAncien] = useState<number>(
    lastReading ? lastReading.eau.nouvelIndex : 52886
  );
  const [eauNouvel, setEauNouvel] = useState<number>(
    lastReading ? lastReading.eau.nouvelIndex + 11 : 52896
  );

  // Gazoil
  const [gazoilAncien, setGazoilAncien] = useState<number>(
    lastReading ? lastReading.gazoil.nouvelIndex : 60
  );
  const [gazoilNouvel, setGazoilNouvel] = useState<number>(
    lastReading ? Math.max(0, lastReading.gazoil.nouvelIndex - 10) : 50
  );
  const [gazoilConso, setGazoilConso] = useState<number>(10);

  // Calculs en temps réel
  const deltaHc = lastReading ? Math.max(0, actifHcNuit - lastReading.electricite.actifHcNuit) : 0;
  const deltaHp = lastReading ? Math.max(0, actifHpJour - lastReading.electricite.actifHpJour) : 0;
  const deltaPointe = lastReading ? Math.max(0, actifHdePointe - lastReading.electricite.actifHdePointe) : 0;
  const deltaTotalElec = deltaHc + deltaHp + deltaPointe;
  const deltaEau = Math.max(0, eauNouvel - eauAncien);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReading: WeeklyReading = {
      id: `releve-${Date.now()}`,
      siteId: site.id,
      semaine,
      date,
      conditionsExterieures,
      electricite: {
        actifHcNuit: Number(actifHcNuit),
        actifHpJour: Number(actifHpJour),
        actifHdePointe: Number(actifHdePointe),
        reactifTriphase: Number(reactifTriphase),
      },
      eau: {
        ancienIndex: Number(eauAncien),
        nouvelIndex: Number(eauNouvel),
        consoM3: deltaEau,
      },
      gazoil: {
        ancienIndex: Number(gazoilAncien),
        nouvelIndex: Number(gazoilNouvel),
        consoLitre: Number(gazoilConso),
        unite: '%',
      },
      notes,
    };

    onAddReading(newReading);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Nouveau Relevé Énergétique Hebdomadaire
              </h3>
              <p className="text-xs text-slate-400">
                Mois : <span className="text-amber-400 font-semibold">{currentRecord.mois}</span> · Site : <span className="text-cyan-400 font-semibold">{site.nom}</span>
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Identifiants Relevé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Semaine
              </label>
              <input
                type="text"
                required
                value={semaine}
                onChange={(e) => setSemaine(e.target.value)}
                placeholder="ex: S34"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date du Relevé
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Conditions Extérieures & Exploitation
              </label>
              <input
                type="text"
                value={conditionsExterieures}
                onChange={(e) => setConditionsExterieures(e.target.value)}
                placeholder="ex: 28°C / Climatisation active"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 1: Compteur Électricité */}
          <div className="bg-slate-850 p-4 rounded-xl border border-cyan-950/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Compteur d'Électricité (kWh cumulatif)
              </h4>
              {lastReading && (
                <span className="text-[11px] text-slate-400">
                  Précédent ({lastReading.semaine}) : {formatNumber(lastReading.electricite.actifHcNuit)} HC
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Actif HC nuit (index)
                </label>
                <input
                  type="number"
                  required
                  value={actifHcNuit}
                  onChange={(e) => setActifHcNuit(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                  +{formatNumber(deltaHc)} kWh
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Actif HP jour (index)
                </label>
                <input
                  type="number"
                  required
                  value={actifHpJour}
                  onChange={(e) => setActifHpJour(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                  +{formatNumber(deltaHp)} kWh
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Actif H. de pointe (index)
                </label>
                <input
                  type="number"
                  required
                  value={actifHdePointe}
                  onChange={(e) => setActifHdePointe(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">
                  +{formatNumber(deltaPointe)} kWh
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Réactif triphasé (kVARh)
                </label>
                <input
                  type="number"
                  required
                  value={reactifTriphase}
                  onChange={(e) => setReactifTriphase(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300 flex justify-between">
              <span>Consommation hebdomadaire active estimée :</span>
              <strong className="font-mono">+{formatNumber(deltaTotalElec)} kWh</strong>
            </div>
          </div>

          {/* Section 2: Compteur Eau */}
          <div className="bg-slate-850 p-4 rounded-xl border border-amber-950/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                Compteur d'Eau (m³ / 7j)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Ancien Index (m³)
                </label>
                <input
                  type="number"
                  required
                  value={eauAncien}
                  onChange={(e) => setEauAncien(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Nouvel Index (m³)
                </label>
                <input
                  type="number"
                  required
                  value={eauNouvel}
                  onChange={(e) => setEauNouvel(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Conso calculée (m³)
                </label>
                <div className="w-full bg-slate-800/60 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold text-sm">
                  {deltaEau} m³ ({deltaEau * 1000} L)
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Gazoil Cuve */}
          <div className="bg-slate-850 p-4 rounded-xl border border-rose-950/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-4 h-4" />
                Compteur Gazoil (15J)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Ancien Index / Niveau (%)
                </label>
                <input
                  type="number"
                  value={gazoilAncien}
                  onChange={(e) => setGazoilAncien(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Nouvel Index / Niveau (%)
                </label>
                <input
                  type="number"
                  value={gazoilNouvel}
                  onChange={(e) => setGazoilNouvel(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Consommation (% ou L)
                </label>
                <input
                  type="number"
                  value={gazoilConso}
                  onChange={(e) => setGazoilConso(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observations / Notes de maintenance
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Essai groupe électrogène hebdomadaire, arrêt compresseur ligne 2..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Boutons Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer le Relevé</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
