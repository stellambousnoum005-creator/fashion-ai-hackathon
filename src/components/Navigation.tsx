import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'mirror', label: 'Mirror', icon: 'view_in_ar' },
    { id: 'moodboard', label: 'Moodboard', icon: 'auto_awesome_mosaic' },
    { id: 'wardrobe', label: 'Wardrobe', icon: 'checkroom' },
    { id: 'pipeline', label: 'Pipeline', icon: 'hub' },
  ];

  return (
    <nav
      id="main-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#131315]/90 backdrop-blur-xl border-t border-[#27272a]/70 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] px-2 py-1 transition-all rounded-xl ${
                isActive
                  ? 'text-[#ffd499] font-semibold'
                  : 'text-[#a1a1aa] hover:text-[#e5e1e4]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#e2b87e]/20 text-[#ffd499] shadow-[0_0_16px_rgba(226,184,126,0.35)] ring-1 ring-[#e2b87e]/40'
                    : 'bg-transparent text-inherit'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {tab.icon}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-[0.08em] font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
