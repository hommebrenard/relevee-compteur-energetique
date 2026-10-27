import React from 'react';
import { 
  Zap, 
  BarChart3, 
  Table, 
  PlusCircle, 
  Settings, 
  Download, 
  Building2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Site } from '../types/energy';
import { MONTH_NAMES } from '../data/initialData';

interface HeaderProps {
  currentMonth: string;
  currentYear: number;
  onSelectMonth: (month: string) => void;
  availableMonths: string[];
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  activeView: 'dashboard' | 'excel' | 'analytics';
  onChangeView: (view: 'dashboard' | 'excel' | 'analytics') => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  currentYear,
  onSelectMonth,
  availableMonths,
  sites,
  selectedSiteId,
  onSelectSite,
  activeView,
  onChangeView,
  onOpenAddModal,
  onOpenSettings,
  onOpenExport,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ligne principale */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Titre */}
          <div className="flex items-center space-x-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  EnerTrack
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Relevés & Suivi Énergétique Mensuel
              </p>
            </div>
          </div>

          {/* Sélecteur de Site */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedSiteId}
              onChange={(e) => onSelectSite(e.target.value)}
              className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer pr-2 font-medium"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                  {s.nom} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation des Vues */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/70">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeView === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>
            <button
              onClick={() => onChangeView('excel')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeView === 'excel'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tableau Excel</span>
            </button>
          </nav>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
              title="Ajouter un nouveau relevé hebdomadaire"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau Relevé</span>
            </button>

            <button
              onClick={onOpenExport}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/70 transition-colors"
              title="Exporter ou Imprimer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/70 transition-colors"
              title="Paramètres & Tarifs"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barre de sélection des mois (Navigation temporelle) */}
        <div className="py-2.5 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center space-x-1 text-xs text-slate-400 shrink-0 mr-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">{currentYear}</span>
            <span>:</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {MONTH_NAMES.map((m) => {
              const isSelected = currentMonth.toUpperCase() === m;
              const hasData = availableMonths.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => onSelectMonth(m)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/50'
                      : hasData
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  {m}
                  {hasData && (
                    <span className={`ml-1 w-1.5 h-1.5 inline-block rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center text-xs text-slate-400 pl-4 border-l border-slate-800 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            <span>Mois actif : <strong className="text-white">{currentMonth} {currentYear}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
