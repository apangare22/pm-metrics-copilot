import type { AnalysisOutput, InsightPanel, PanelKey } from '../../types';

interface PanelTabsProps {
  activeTab: PanelKey;
  onTabChange: (tab: PanelKey) => void;
  panels: AnalysisOutput;
}

interface TabConfig {
  key: PanelKey;
  label: string;
  activeClass: string;
  inactiveClass: string;
  dotColor: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    key: 'churn_retention',
    label: 'Churn & Retention',
    activeClass: 'bg-red-600 text-white border-red-600',
    inactiveClass: 'text-slate-600 border-transparent hover:border-red-300 hover:text-red-600',
    dotColor: 'bg-red-500',
  },
  {
    key: 'ab_tests',
    label: 'A/B Tests',
    activeClass: 'bg-blue-600 text-white border-blue-600',
    inactiveClass: 'text-slate-600 border-transparent hover:border-blue-300 hover:text-blue-600',
    dotColor: 'bg-blue-500',
  },
  {
    key: 'funnel_dropoff',
    label: 'Funnel Drop-off',
    activeClass: 'bg-orange-500 text-white border-orange-500',
    inactiveClass: 'text-slate-600 border-transparent hover:border-orange-300 hover:text-orange-500',
    dotColor: 'bg-orange-500',
  },
  {
    key: 'leading_lagging',
    label: 'Leading vs Lagging',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    inactiveClass: 'text-slate-600 border-transparent hover:border-emerald-300 hover:text-emerald-600',
    dotColor: 'bg-emerald-500',
  },
];

function getSeverityCount(panel: InsightPanel): { high: number; medium: number; low: number } {
  return {
    high: panel.insights.filter((i) => i.severity === 'High').length,
    medium: panel.insights.filter((i) => i.severity === 'Medium').length,
    low: panel.insights.filter((i) => i.severity === 'Low').length,
  };
}

export default function PanelTabs({ activeTab, onTabChange, panels }: PanelTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAB_CONFIG.map((tab) => {
        const panel = panels[tab.key];
        const counts = getSeverityCount(panel);
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
              isActive ? tab.activeClass : tab.inactiveClass + ' bg-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/80' : tab.dotColor}`} />
            <span>{tab.label}</span>
            {counts.high > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {counts.high} High
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
