import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

import { supabase } from './lib/supabase';
import { analyzeMetrics } from './lib/claude';

import type { Metric, ProductContext, AnalysisOutput, Analysis, PanelKey } from './types';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import MagicLink from './components/auth/MagicLink';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ContextSelector from './components/input/ContextSelector';
import MetricForm from './components/input/MetricForm';
import CSVUpload from './components/input/CSVUpload';
import AnalysisPanel from './components/output/AnalysisPanel';
import PanelTabs from './components/output/PanelTabs';
import SeverityDonut from './components/output/SeverityDonut';
import SeverityByPanel from './components/output/SeverityByPanel';
import MetricsBarChart from './components/output/MetricsBarChart';
import ComparisonChart from './components/output/ComparisonChart';

import {
  Loader2,
  Sparkles,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react';

type InputMode = 'manual' | 'csv';

function createDefaultMetrics(): Metric[] {
  return [
    { id: crypto.randomUUID(), label: '', value: '' },
    { id: crypto.randomUUID(), label: '', value: '' },
    { id: crypto.randomUUID(), label: '', value: '' },
  ];
}

// ─── Main App Shell (requires auth) ───────────────────────────────────────────

function AppShell({ user }: { user: User }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [metrics, setMetrics] = useState<Metric[]>(createDefaultMetrics());
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('');

  // Output state
  const [currentOutput, setCurrentOutput] = useState<AnalysisOutput | null>(null);
  const [activePanel, setActivePanel] = useState<PanelKey>('churn_retention');

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(true);

  // Load analyses on mount
  const loadAnalyses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data as Analysis[]) ?? []);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    }
  }, [user.id]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleNewAnalysis = () => {
    setMetrics(createDefaultMetrics());
    setProductContext(null);
    setTimePeriod('');
    setCurrentOutput(null);
    setActivePanel('churn_retention');
    setSelectedAnalysisId(null);
    setShowSaveForm(false);
    setSaveTitle('');
    setAnalyzeError(null);
    setSaveError(null);
    setInputExpanded(true);
    setSidebarOpen(false);
  };

  const handleAnalyze = async () => {
    const validMetrics = metrics.filter((m) => m.label.trim() && m.value.trim());
    if (validMetrics.length === 0) {
      setAnalyzeError('Please add at least one metric with a name and value.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setCurrentOutput(null);
    setShowSaveForm(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired. Please log in again.');
      const output = await analyzeMetrics(validMetrics, productContext, timePeriod || null, session.access_token);
      setCurrentOutput(output);
      setActivePanel('churn_retention');
      setInputExpanded(false);
      setSelectedAnalysisId(null);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!currentOutput || !saveTitle.trim()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const validMetrics = metrics.filter((m) => m.label.trim() && m.value.trim());

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          title: saveTitle.trim(),
          product_context: productContext,
          time_period: timePeriod || null,
          input_data: { metrics: validMetrics },
          output: currentOutput,
        })
        .select()
        .single();

      if (error) throw error;

      const newAnalysis = data as Analysis;
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedAnalysisId(newAnalysis.id);
      setShowSaveForm(false);
      setSaveTitle('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save analysis.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAnalysis = (analysis: Analysis) => {
    setSelectedAnalysisId(analysis.id);
    setMetrics(analysis.input_data.metrics);
    setProductContext(analysis.product_context);
    setTimePeriod(analysis.time_period ?? '');
    setCurrentOutput(analysis.output);
    setActivePanel('churn_retention');
    setInputExpanded(false);
    setAnalyzeError(null);
    setSaveError(null);
    setShowSaveForm(false);
    setSidebarOpen(false);
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase.from('analyses').delete().eq('id', id);
      if (error) throw error;
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAnalysisId === id) {
        handleNewAnalysis();
      }
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  const handleCSVLoaded = (loadedMetrics: Metric[]) => {
    setMetrics(loadedMetrics);
    setInputMode('manual');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header user={user} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile, slide in */}
        <div
          className={`absolute lg:relative inset-y-0 left-0 z-30 lg:z-auto transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar
            analyses={analyses}
            onSelect={handleSelectAnalysis}
            onDelete={handleDeleteAnalysis}
            onNewAnalysis={handleNewAnalysis}
            selectedId={selectedAnalysisId}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg py-1.5 px-3 hover:bg-slate-50 transition-colors"
            >
              <Menu className="w-4 h-4" />
              History
            </button>
            <button
              onClick={handleNewAnalysis}
              className="text-sm text-indigo-600 font-medium bg-indigo-50 border border-indigo-200 rounded-lg py-1.5 px-3 hover:bg-indigo-100 transition-colors"
            >
              + New
            </button>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Input section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Input header */}
              <button
                onClick={() => setInputExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Input Metrics</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your product metrics manually or upload a CSV
                  </p>
                </div>
                {inputExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {inputExpanded && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-100">
                  {/* Context + period */}
                  <div className="pt-4">
                    <ContextSelector
                      productContext={productContext}
                      onProductContextChange={setProductContext}
                      timePeriod={timePeriod}
                      onTimePeriodChange={setTimePeriod}
                    />
                  </div>

                  {/* Input mode tabs */}
                  <div className="flex rounded-lg bg-slate-100 p-1 w-fit">
                    <button
                      onClick={() => setInputMode('manual')}
                      className={`py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'manual'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Manual Entry
                    </button>
                    <button
                      onClick={() => setInputMode('csv')}
                      className={`py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'csv'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      CSV Upload
                    </button>
                  </div>

                  {/* Input component */}
                  {inputMode === 'manual' ? (
                    <MetricForm metrics={metrics} onChange={setMetrics} />
                  ) : (
                    <CSVUpload onMetricsLoaded={handleCSVLoaded} />
                  )}

                  {/* Error */}
                  {analyzeError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700">{analyzeError}</p>
                    </div>
                  )}

                  {/* Analyze button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-6 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analyzing state */}
            {isAnalyzing && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full mb-4">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Analyzing your metrics...</h3>
                <p className="text-sm text-slate-500">
                  Claude is processing your data and generating insights. This may take 10-30 seconds.
                </p>
              </div>
            )}

            {/* Output section */}
            {currentOutput && !isAnalyzing && (
              <div className="space-y-4">
                {/* Output header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">Analysis Results</h2>
                  {!selectedAnalysisId && (
                    <button
                      onClick={() => setShowSaveForm((v) => !v)}
                      className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg py-1.5 px-3 hover:bg-slate-50 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  )}
                </div>

                {/* Save form */}
                {showSaveForm && !selectedAnalysisId && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">Save Analysis</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="Give this analysis a name..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      />
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !saveTitle.trim()}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { setShowSaveForm(false); setSaveTitle(''); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {saveError && (
                      <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{saveError}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Panel tabs */}
                <PanelTabs
                  activeTab={activePanel}
                  onTabChange={setActivePanel}
                  panels={currentOutput}
                />

                {/* Active panel */}
                <AnalysisPanel panel={currentOutput[activePanel]} />

                {/* Charts */}
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-3">Charts</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SeverityDonut output={currentOutput} />
                    <SeverityByPanel output={currentOutput} />
                  </div>
                  <div className="mt-4">
                    <MetricsBarChart metrics={metrics} />
                  </div>
                  {currentOutput.metric_targets?.length > 0 && (
                    <div className="mt-4">
                      <ComparisonChart targets={currentOutput.metric_targets} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!currentOutput && !isAnalyzing && (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full mb-4">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">Ready to analyze</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Enter your product metrics above and click "Analyze with AI" to get actionable
                  insights powered by Claude.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Auth Guard ────────────────────────────────────────────────────────────────

function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle magic link / email confirmation redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return <Login />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthRedirect />}
        />
        <Route
          path="/auth/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/auth/magic-link"
          element={user ? <Navigate to="/" replace /> : <MagicLink />}
        />
        <Route
          path="/"
          element={user ? <AppShell user={user} /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
