import React from 'react';
import { ASSETS } from '../data/fashionData';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenContact?: () => void;
  activeTabTitle?: string;
  isStreamActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onOpenContact,
  isStreamActive = true,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#131315]/80 backdrop-blur-xl border-b border-[#27272a]/60 shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
      <div className="h-16 px-4 max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo & Haute Couture label */}
        <div className="flex items-center gap-2.5">
          <img
            src={ASSETS.emblem}
            alt="MorphoMix Emblem"
            className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(226,184,126,0.4)]"
            crossOrigin="anonymous"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-[#e5e1e4] leading-tight font-sans">
              MorphoMix
            </span>
            <span className="text-[10px] tracking-[0.09em] uppercase text-[#d2c4b5]/80 font-bold font-sans">
              Haute Couture AI
            </span>
          </div>
        </div>

        {/* Live Mirror Badge, Concierge Contact Button & Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Atelier Concierge Contact trigger */}
          {onOpenContact && (
            <button
              onClick={onOpenContact}
              id="headerContactBtn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201f22] hover:bg-[#2a2a2c] text-[#ffd499] hover:text-[#fff0db] text-xs font-semibold border border-[#ffd499]/30 hover:border-[#ffd499] transition-all shadow-[0_0_12px_rgba(226,184,126,0.15)] hover:shadow-[0_0_20px_rgba(226,184,126,0.3)] active:scale-95 cursor-pointer"
              title="Book bespoke atelier fitting or contact couture atelier"
            >
              <span className="material-symbols-outlined text-[15px]">mail</span>
              <span className="font-sans">Atelier Concierge</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2c]/80 backdrop-blur-md border border-[#4e453a]/40 shadow-[0_0_12px_rgba(226,184,126,0.15)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreamActive ? 'bg-[#ffd499] animate-pulse' : 'bg-[#9b8f81]'
              }`}
            />
            <span className="text-[11px] font-mono text-[#ffd499] uppercase tracking-wider font-semibold">
              LIVE MIRROR
            </span>
          </div>

          <button
            onClick={onOpenProfile}
            id="couture-profile-btn"
            className="w-10 h-10 rounded-full p-0.5 border border-[#4e453a]/60 hover:border-[#ffd499] transition-colors overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#ffd499]/50 cursor-pointer"
            title="Open Couture Profile"
          >
            <img
              src={ASSETS.profile}
              alt="Couture Profile"
              className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
              crossOrigin="anonymous"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
