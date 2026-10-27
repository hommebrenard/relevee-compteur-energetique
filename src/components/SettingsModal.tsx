import React, { useState } from 'react';
import { X, Settings, Euro, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { EnergyTariffs, Site } from '../types/energy';
import { DEFAULT_TARIFFS } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffs: EnergyTariffs;
  onSaveTariffs: (tariffs: EnergyTariffs) => void;
  currentSite: Site;
  onSaveSite: (site: Site) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tariffs,
  onSaveTariffs,
  currentSite,
  onSaveSite,
}) => {
  if (!isOpen) return null;

  const [localTariffs, setLocalTariffs] = useState<EnergyTariffs>({ ...tariffs });
  const [tankCapacity, setTankCapacity] = useState<number>(currentSite.capaciteCuveGazoilL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTariffs(localTariffs);
    onSaveSite({
      ...currentSite,
      capaciteCuveGazoilL: Number(tankCapacity),
    });
    onClose();
  };

  const handleReset = () => {
    setLocalTariffs({ ...DEFAULT_TARIFFS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Paramètres des Tarifs & Seuils Industriels
              </h3>
              <p className="text-xs text-slate-400">
                Ajustez vos barèmes de facturation (€/kWh, €/m³, €/L)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tarifs Électricité */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Tarification Électricité ({localTariffs.currency}/kWh)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Heures Creuses (HC nuit)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={localTariffs.elecCostHcNuit}
                  onChange={(e) => setLocalTariffs({ ...localTariffs, elecCostHcNuit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Heures Pleines (HP jour)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={localTariffs.elecCostHpJour}
                  onChange={(e) => setLocalTariffs({ ...localTariffs, elecCostHpJour: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Heures de Pointe
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={localTariffs.elecCostPointe}
                  onChange={(e) => setLocalTariffs({ ...localTariffs, elecCostPointe: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Pénalité de Dépassement Réactif ({localTariffs.currency}/kVARh excédentaire)
              </label>
              <input
                type="number"
                step="0.001"
                value={localTariffs.elecCostReactifPenalty}
                onChange={(e) => setLocalTariffs({ ...localTariffs, elecCostReactifPenalty: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Facturé si le rapport Tan(φ) dépasse 0.40 (norme tarif vert / BT / HTA)
              </span>
            </div>
          </div>

          {/* Tarifs Eau & Gazoil */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Eau & Carburant
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Prix Eau ({localTariffs.currency}/m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localTariffs.eauCostM3}
                  onChange={(e) => setLocalTariffs({ ...localTariffs, eauCostM3: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Prix Gazoil ({localTariffs.currency}/Litre)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={localTariffs.gazoilCostL}
                  onChange={(e) => setLocalTariffs({ ...localTariffs, gazoilCostL: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Capacité Cuve Gazoil du Site (Litres)
              </label>
              <input
                type="number"
                value={tankCapacity}
                onChange={(e) => setTankCapacity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Utilisé pour convertir les relevés en % en litres réels et estimer l'autonomie.
              </span>
            </div>
          </div>

          {/* Devise */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Symbole Monétaire :</span>
            <div className="flex space-x-2">
              {['€', '$', 'DH', 'FCFA'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setLocalTariffs({ ...localTariffs, currency: curr })}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    localTariffs.currency === curr
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Boutons Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rétablir valeurs par défaut</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
