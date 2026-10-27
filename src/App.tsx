import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExcelTableView } from './components/ExcelTableView';
import { AddReadingModal } from './components/AddReadingModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { 
  INITIAL_SITES, 
  INITIAL_MONTH_RECORDS, 
  DEFAULT_TARIFFS, 
  MONTH_NAMES 
} from './data/initialData';
import { Site, MonthRecord, EnergyTariffs, WeeklyReading } from './types/energy';
import { 
  Sparkles, 
  PlusCircle, 
  Table, 
  BarChart3, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const STORAGE_KEYS = {
  SITES: 'enertrack_sites_v2',
  RECORDS: 'enertrack_records_v2',
  TARIFFS: 'enertrack_tariffs_v2',
  ACTIVE_MONTH: 'enertrack_month_v2',
  ACTIVE_SITE: 'enertrack_site_v2',
};

export default function App() {
  // Chargement depuis localStorage avec fallback
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITES);
      return saved ? JSON.parse(saved) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SITE);
      return saved || 'site-1';
    } catch {
      return 'site-1';
    }
  });

  const [records, setRecords] = useState<MonthRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_MONTH_RECORDS;
    } catch {
      return INITIAL_MONTH_RECORDS;
    }
  });

  // Le mois par défaut est "AOUT" (celui de l'image de l'utilisateur)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH);
      return saved || 'AOUT';
    } catch {
      return 'AOUT';
    }
  });

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeView, setActiveView] = useState<'dashboard' | 'excel' | 'analytics'>('dashboard');

  const [tariffs, setTariffs] = useState<EnergyTariffs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARIFFS);
      return saved ? JSON.parse(saved) : DEFAULT_TARIFFS;
    } catch {
      return DEFAULT_TARIFFS;
    }
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sauvegardes automatiques
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(tariffs));
  }, [tariffs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SITE, selectedSiteId);
  }, [selectedSiteId]);

  // Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Site actif
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Records pour le site actif
  const siteRecords = records.filter((r) => r.siteId === currentSite.id);
  const availableMonths = siteRecords.map((r) => r.mois.toUpperCase());

  // Enregistrement actif pour le mois sélectionné
  let currentRecord = siteRecords.find((r) => r.mois.toUpperCase() === selectedMonth.toUpperCase() && r.annee === selectedYear);

  // Si le mois n'existe pas encore pour ce site, on crée une structure propre
  if (!currentRecord) {
    const newRecord: MonthRecord = {
      id: `rec-${currentSite.id}-${selectedYear}-${selectedMonth}`,
      mois: selectedMonth.toUpperCase(),
      annee: selectedYear,
      siteId: currentSite.id,
      releves: [],
    };
    currentRecord = newRecord;
  }

  // Mettre à jour un relevé
  const handleUpdateRecord = (updated: MonthRecord) => {
    const existingIndex = records.findIndex((r) => r.id === updated.id);
    if (existingIndex >= 0) {
      const nextRecords = [...records];
      nextRecords[existingIndex] = updated;
      setRecords(nextRecords);
    } else {
      setRecords([...records, updated]);
    }
    showToast('Modifications enregistrées !');
  };

  // Ajouter un nouveau relevé
  const handleAddReading = (newReading: WeeklyReading) => {
    const updatedReleves = [...(currentRecord?.releves || []), newReading];
    const updatedRecord: MonthRecord = {
      ...currentRecord,
      releves: updatedReleves,
    };
    handleUpdateRecord(updatedRecord);
    showToast(`Relevé ${newReading.semaine} ajouté avec succès !`);
  };

  // Réinitialiser les données au modèle de base (avec l'image)
  const handleResetToOriginal = () => {
    if (confirm('Voulez-vous recharger les données originales du tableau Excel (Août avec S30-S33) ?')) {
      setRecords(INITIAL_MONTH_RECORDS);
      setSelectedMonth('AOUT');
      setSelectedSiteId('site-1');
      showToast('Données originales du tableau Excel rechargées !');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400 text-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Entête de navigation */}
      <Header
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onSelectMonth={(m) => setSelectedMonth(m)}
        availableMonths={availableMonths}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={(id) => setSelectedSiteId(id)}
        activeView={activeView}
        onChangeView={(v) => setActiveView(v)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Si aucun relevé sur le mois sélectionné */}
        {currentRecord.releves.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Aucun relevé pour {selectedMonth} {selectedYear}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Ce mois ne contient pas encore de relevé hebdomadaire pour le site <strong>{currentSite.nom}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md transition-colors cursor-pointer"
              >
                + Créer le premier relevé
              </button>
              <button
                onClick={() => setSelectedMonth('AOUT')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Aller au mois d'Août (Données Excel)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vue Tableau de Bord Intuitif */}
            {activeView === 'dashboard' && (
              <DashboardView
                currentRecord={currentRecord}
                allRecords={siteRecords}
                site={currentSite}
                tariffs={tariffs}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onSwitchToExcel={() => setActiveView('excel')}
              />
            )}

            {/* Vue Tableau Excel Fidèle */}
            {activeView === 'excel' && (
              <ExcelTableView
                currentRecord={currentRecord}
                site={currentSite}
                onUpdateRecord={handleUpdateRecord}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer sobre et professionnel */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">EnerTrack Industrial</span>
            <span>·</span>
            <span>Suivi énergétique conforme aux normes ISO 50001</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetToOriginal}
              className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer transition-colors"
              title="Restaurer les relevés d'Août de l'image"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurer données Excel initiales</span>
            </button>
            <span>·</span>
            <span className="text-slate-400">Site actif : <strong className="text-slate-300">{currentSite.nom}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentRecord={currentRecord}
        site={currentSite}
        onAddReading={handleAddReading}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tariffs={tariffs}
        onSaveTariffs={(t) => {
          setTariffs(t);
          showToast('Tarifs et seuils mis à jour !');
        }}
        currentSite={currentSite}
        onSaveSite={(s) => {
          setSites(sites.map((st) => (st.id === s.id ? s : st)));
          showToast('Configuration du site mise à jour !');
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentRecord={currentRecord}
        site={currentSite}
        tariffs={tariffs}
      />
    </div>
  );
}
