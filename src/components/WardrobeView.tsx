import React, { useState } from 'react';
import { WardrobeItem } from '../types';

interface WardrobeViewProps {
  wardrobe: WardrobeItem[];
  onToggleItem: (id: string) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  wardrobe,
  onToggleItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectingItem, setInspectingItem] = useState<WardrobeItem | null>(null);
  const [splitPosition, setSplitPosition] = useState<number>(50);

  const categories = [
    { id: 'all', label: 'All Silhouettes' },
    { id: 'tops', label: 'Tops & Blouses' },
    { id: 'trousers', label: 'Tailored Trousers' },
    { id: 'outerwear', label: 'Coats & Trenches' },
  ];

  const filteredItems = wardrobe.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-6 pb-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#e5e1e4] tracking-tight">
            Digital Wardrobe Atelier
          </h2>
          <div className="px-3 py-1 rounded-full bg-[#1c1b1d] border border-[#ffd499]/30 text-xs font-mono text-[#ffd499]">
            {wardrobe.filter((i) => i.activeInLook).length} EQUIPPED
          </div>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Archival garments and bespoke pattern pieces available for real-time live synthesis and drape simulation.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-[#e2b87e] text-[#442b00] border-[#e2b87e] shadow-[0_0_12px_rgba(226,184,126,0.3)]'
                : 'bg-[#18181f] text-[#a1a1aa] border-[#27272a] hover:text-[#e5e1e4]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isEquipped = item.activeInLook;

          return (
            <div
              key={item.id}
              id={`wardrobe-card-${item.id}`}
              className={`rounded-2xl bg-[#18181f]/90 backdrop-blur-xl border transition-all duration-300 p-4 flex flex-col justify-between space-y-4 shadow-xl ${
                isEquipped
                  ? 'border-[#e2b87e]/80 shadow-[0_0_20px_rgba(226,184,126,0.15)]'
                  : 'border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              <div className="space-y-3">
                {/* Top image banner & badges */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#0e0e10] border border-[#3f3f46]/30 group">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Code badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#0e0e10]/80 backdrop-blur-md border border-[#4e453a]/40 font-mono text-[10px] text-[#ffd499] font-bold">
                    {item.code} • {item.material}
                  </div>

                  {/* Equipped status chip */}
                  {isEquipped && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#e2b87e] text-[#442b00] text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      ACTIVE IN LOOK
                    </div>
                  )}

                  {/* Fabric GSM and Drape badge */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[10px] font-mono text-[#e5e1e4] bg-[#0e0e10]/70 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <span>GSM: {item.gsm}</span>
                    <span className="text-[#b2e1ff]">{item.drapeType}</span>
                  </div>
                </div>

                {/* Garment Title and Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#e5e1e4]">
                      {item.name}
                    </h3>
                    <span className="text-xs font-mono text-[#ffd499]">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#27272a]">
                <button
                  onClick={() => setInspectingItem(item)}
                  className="flex-1 py-2 px-3 rounded-full bg-[#201f22] hover:bg-[#2a2a2c] text-[#e5e1e4] hover:text-[#ffd499] text-xs font-semibold transition-all border border-[#3f3f46]/40 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Inspect Drape</span>
                </button>

                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isEquipped
                      ? 'bg-[#3a2a14] text-[#ffd499] border border-[#ffd499]/60 hover:bg-[#4a3a24]'
                      : 'bg-[#ffd499] text-[#442b00] hover:bg-[#e2b87e] shadow-md'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isEquipped ? 'remove_done' : 'add'}
                  </span>
                  <span>{isEquipped ? 'Equipped' : 'Equip to Look'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fabric Weave & Virtual Drape Inspector Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-[#0e0e10]/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#18181f] border border-[#4e453a] rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#ffd499] uppercase font-bold tracking-wider">
                  ATELIER FABRIC & DRAPE ANALYSIS
                </span>
                <h3 className="text-xl font-serif font-bold text-[#e5e1e4]">
                  {inspectingItem.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="w-8 h-8 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#e5e1e4] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Virtual Drape Split Comparison */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold text-[#d2c4b5]/80 font-mono">
                Interactive Drape Split (Render vs Physical Drape)
              </span>
              <div className="relative w-full h-56 rounded-2xl overflow-hidden select-none border border-[#3f3f46]">
                {/* Background 1 */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${inspectingItem.imageUrl}')` }}
                />

                {/* Left side clipped */}
                <div
                  className="absolute inset-0 bg-cover bg-center border-r-2 border-[#ffd499] filter contrast-125"
                  style={{
                    backgroundImage: `url('${inspectingItem.imageUrl}')`,
                    clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
                  }}
                />

                {/* Split Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#ffd499] cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${splitPosition}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-[#e2b87e] text-[#442b00] flex items-center justify-center shadow-lg font-bold text-xs">
                    ↔
                  </div>
                </div>

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#ffd499]">
                  Physical Drape
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#b2e1ff]">
                  Neural Reconstruction
                </div>
              </div>

              {/* Slider Controller */}
              <input
                type="range"
                min="10"
                max="90"
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="w-full accent-[#ffd499] cursor-pointer"
              />
            </div>

            {/* Textile Specification Matrix */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-[#27272a]">
              <div>
                <span className="text-[10px] font-mono text-[#a1a1aa] block uppercase">
                  Material Weight
                </span>
                <span className="text-sm font-semibold text-[#e5e1e4] font-mono">
                  {inspectingItem.gsm} g/m² (GSM)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#a1a1aa] block uppercase">
                  Drape Behavior
                </span>
                <span className="text-sm font-semibold text-[#b2e1ff]">
                  {inspectingItem.drapeType}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#a1a1aa] block uppercase">
                  Textile Composition
                </span>
                <span className="text-xs text-[#d2c4b5]">
                  {inspectingItem.composition}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#a1a1aa] block uppercase">
                  Atelier Care
                </span>
                <span className="text-xs text-[#d2c4b5]">
                  {inspectingItem.careLabel}
                </span>
              </div>
            </div>

            {/* Modal Bottom Equip */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-[#ffd499]">
                Bespoke Atelier Inventory # {inspectingItem.code}
              </span>
              <button
                onClick={() => {
                  onToggleItem(inspectingItem.id);
                  setInspectingItem(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold ${
                  inspectingItem.activeInLook
                    ? 'bg-[#3a2a14] text-[#ffd499] border border-[#ffd499]'
                    : 'bg-[#ffd499] text-[#442b00]'
                }`}
              >
                {inspectingItem.activeInLook ? 'Remove from Mirror' : 'Equip to Mirror'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
