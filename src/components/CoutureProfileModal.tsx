import React from 'react';
import { SavedLook } from '../types';
import { ASSETS } from '../data/fashionData';

interface CoutureProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLooks: SavedLook[];
  onRemoveLook: (id: string) => void;
}

export const CoutureProfileModal: React.FC<CoutureProfileModalProps> = ({
  isOpen,
  onClose,
  savedLooks,
  onRemoveLook,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e10]/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#18181f] border border-[#4e453a] rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.profile}
              alt="Client Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ffd499] shadow-md"
              crossOrigin="anonymous"
            />
            <div>
              <span className="text-[10px] font-mono text-[#ffd499] uppercase font-bold tracking-wider">
                HAUTE COUTURE CLIENT DOSSIER
              </span>
              <h3 className="text-xl font-serif font-bold text-[#e5e1e4]">
                Elena Rostova
              </h3>
              <span className="text-xs text-[#a1a1aa] font-mono">
                ID: #ATELIER-PARIS-7749
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#e5e1e4] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Anatomical Specs & Measurement Grid */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-[#d2c4b5]/80 tracking-wider">
            Bespoke Atelier Anatomical Specs
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">BUST</span>
              <span className="text-sm font-semibold text-[#ffd499] font-mono">84 cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">WAIST</span>
              <span className="text-sm font-semibold text-[#ffd499] font-mono">62 cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">LOW HIP</span>
              <span className="text-sm font-semibold text-[#ffd499] font-mono">90 cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">T_AXIS DROP</span>
              <span className="text-sm font-semibold text-[#b2e1ff] font-mono">14.8°</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">VERTICAL DROP</span>
              <span className="text-sm font-semibold text-[#ffd499] font-mono">142 cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a]">
              <span className="text-[10px] font-mono text-[#a1a1aa] block">FIT LOCK</span>
              <span className="text-sm font-semibold text-[#b2e1ff] font-mono">0.98 Conf</span>
            </div>
          </div>
        </div>

        {/* Saved Looks Archive */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-[#d2c4b5]/80 tracking-wider">
              Archived Saved Looks ({savedLooks.length})
            </span>
            <span className="text-xs font-mono text-[#ffd499]">
              GEMINI CURATION
            </span>
          </div>

          {savedLooks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0e0e10] border border-dashed border-[#3f3f46] text-center text-xs text-[#a1a1aa]">
              No looks saved yet. Click "Save Look" in the Live Mirror to archive custom stylings.
            </div>
          ) : (
            <div className="space-y-3">
              {savedLooks.map((look) => (
                <div
                  key={look.id}
                  className="p-3 rounded-2xl bg-[#0e0e10] border border-[#27272a] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={look.modelImageUrl}
                      alt={look.inspirationName}
                      className="w-12 h-14 rounded-lg object-cover border border-[#4e453a]/40 shrink-0"
                      crossOrigin="anonymous"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#e5e1e4] truncate">
                          {look.inspirationName}
                        </span>
                        <span className="font-mono text-[10px] text-[#ffd499] bg-[#3a2a14] px-1.5 py-0.5 rounded">
                          {look.aestheticMatch}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a1a1aa] truncate italic mt-0.5">
                        {look.quote}
                      </p>
                      <span className="text-[10px] font-mono text-[#71717a] block mt-0.5">
                        {look.timestamp} • {look.equippedItems.length} items
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveLook(look.id)}
                    className="w-8 h-8 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#ffb4ab] flex items-center justify-center shrink-0"
                    title="Remove look"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry Footer */}
        <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
          <span>GPU Allocation: 16GB VRAM</span>
          <span className="text-[#ffd499]">PARIS ATELIER ONLINE</span>
        </div>
      </div>
    </div>
  );
};
