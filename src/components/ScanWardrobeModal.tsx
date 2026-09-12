import React, { useState } from 'react';
import { WardrobeItem, DetectedGarment } from '../types';
import { ASSETS } from '../data/fashionData';

interface ScanWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedGarments: DetectedGarment[];
  snapshotUrl?: string;
  generalDiagnosis?: string;
  aestheticMatchPercent?: number;
  recommendationQuote?: string;
  onStockItem: (item: WardrobeItem) => void;
  onStockAll: (items: WardrobeItem[]) => void;
  onNavigateToWardrobe: () => void;
  isScanning: boolean;
  existingWardrobe: WardrobeItem[];
}

export const ScanWardrobeModal: React.FC<ScanWardrobeModalProps> = ({
  isOpen,
  onClose,
  detectedGarments,
  snapshotUrl,
  generalDiagnosis,
  aestheticMatchPercent,
  recommendationQuote,
  onStockItem,
  onStockAll,
  onNavigateToWardrobe,
  isScanning,
  existingWardrobe,
}) => {
  const [stockedIds, setStockedIds] = useState<Set<string>>(new Set());
  const [useSnapshotAsImage, setUseSnapshotAsImage] = useState<boolean>(true);
  const [justStockedMessage, setJustStockedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to get an image for a garment
  const resolveGarmentImage = (garment: DetectedGarment, index: number): string => {
    if (useSnapshotAsImage && snapshotUrl) {
      return snapshotUrl;
    }
    if (garment.imageUrl) {
      return garment.imageUrl;
    }
    const categoryKey = garment.category as keyof typeof ASSETS.categoryImages;
    const catImages = ASSETS.categoryImages?.[categoryKey];
    if (catImages && catImages.length > 0) {
      return catImages[index % catImages.length];
    }
    return ASSETS.modelLook1;
  };

  // Convert a DetectedGarment into a complete WardrobeItem
  const convertToWardrobeItem = (garment: DetectedGarment, index: number): WardrobeItem => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = garment.id || `item-scanned-${Date.now()}-${index}`;
    const codeNumber = Math.floor(20 + (index * 7) + (Date.now() % 70));

    return {
      id,
      code: `#SC-${codeNumber}`,
      name: garment.name,
      category: garment.category,
      material: garment.material,
      colorName: garment.colorName,
      colorHex: garment.colorHex || '#18181b',
      gsm: garment.gsm || 220,
      drapeType: garment.drapeType || 'Liquid Fluid',
      imageUrl: resolveGarmentImage(garment, index),
      activeInLook: false,
      price: garment.price || '€1,250',
      description: garment.description,
      composition: garment.composition || '100% Curated Atelier Fabric',
      careLabel: garment.careLabel || 'Specialist Dry Clean Only',
      source: 'mirror_scan',
      scannedAt: `Today • ${timestampStr}`,
      snapshotUrl: snapshotUrl,
    };
  };

  const handleStockSingle = (garment: DetectedGarment, index: number) => {
    const key = garment.id || `${garment.name}-${index}`;
    if (stockedIds.has(key)) return;

    const wardrobeItem = convertToWardrobeItem(garment, index);
    onStockItem(wardrobeItem);

    setStockedIds((prev) => new Set(prev).add(key));
    setJustStockedMessage(`“${garment.name}” stocked in Wardrobe!`);
    setTimeout(() => setJustStockedMessage(null), 3000);
  };

  const handleStockAllItems = () => {
    const itemsToStock: WardrobeItem[] = [];
    const newStockedIds = new Set(stockedIds);

    detectedGarments.forEach((garment, idx) => {
      const key = garment.id || `${garment.name}-${idx}`;
      if (!newStockedIds.has(key)) {
        itemsToStock.push(convertToWardrobeItem(garment, idx));
        newStockedIds.add(key);
      }
    });

    if (itemsToStock.length > 0) {
      onStockAll(itemsToStock);
      setStockedIds(newStockedIds);
      setJustStockedMessage(`All ${itemsToStock.length} garment(s) successfully stocked to your Wardrobe!`);
      setTimeout(() => setJustStockedMessage(null), 3500);
    }
  };

  const allStocked = detectedGarments.length > 0 &&
    detectedGarments.every((g, idx) => stockedIds.has(g.id || `${g.name}-${idx}`));

  return (
    <div
      id="scan-wardrobe-modal"
      className="fixed inset-0 z-50 bg-[#0e0e10]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#18181f] border border-[#ffd499]/30 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#141418]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3a2a14] text-[#ffd499] flex items-center justify-center border border-[#ffd499]/40 shadow-inner">
              <span className="material-symbols-outlined text-[20px]">checkroom</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#e5e1e4]">
                  Mirror Garment Analysis
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ffd499]/15 text-[#ffd499] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#ffd499]/30">
                  {detectedGarments.length} Pieces Found
                </span>
              </div>
              <p className="text-[11px] text-[#a1a1aa]">
                Analyze clothes in the mirror and stock directly into your Digital Wardrobe Atelier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#e5e1e4] hover:bg-[#2a2a2c] flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Just Stocked Alert Banner */}
        {justStockedMessage && (
          <div className="bg-[#3a2a14] border-b border-[#ffd499]/40 px-6 py-2.5 flex items-center justify-between text-xs text-[#ffd499] font-medium transition-all animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#22c55e]">check_circle</span>
              <span>{justStockedMessage}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToWardrobe();
              }}
              className="text-[11px] underline font-bold uppercase tracking-wider hover:text-white cursor-pointer"
            >
              Open Wardrobe →
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Top Vision & Silhouette Diagnosis Card */}
          <div className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-[#3f3f46]/40 flex flex-col sm:flex-row items-center gap-4">
            {/* Mirror Frame Snapshot */}
            {snapshotUrl ? (
              <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-[#18181f] shrink-0 border border-[#ffd499]/40 shadow-md">
                <img
                  src={snapshotUrl}
                  alt="Mirror Snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#0e0e10]/80 font-mono text-[9px] text-[#ffd499] font-semibold uppercase">
                  MIRROR
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-[#201f22] border border-[#3f3f46]/30 flex flex-col items-center justify-center text-[#a1a1aa] shrink-0">
                <span className="material-symbols-outlined text-[28px] text-[#ffd499]">videocam</span>
                <span className="text-[10px] font-mono mt-1">Live Feed</span>
              </div>
            )}

            {/* Diagnosis Content */}
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#d2c4b5]/80 uppercase tracking-widest font-semibold">
                  Textile & Drape Calibration
                </span>
                {aestheticMatchPercent && (
                  <span className="px-2 py-0.5 rounded-full bg-[#3a2a14] border border-[#ffd499]/40 text-[#ffd499] font-mono text-xs font-bold">
                    {aestheticMatchPercent}% Archive Match
                  </span>
                )}
              </div>

              <p className="text-xs text-[#e5e1e4] leading-relaxed font-sans">
                {generalDiagnosis || 'Garments identified through optical silhouette scanning and textile drape mapping.'}
              </p>

              {recommendationQuote && (
                <p className="text-xs text-[#ffd499] italic font-serif border-l-2 border-[#ffd499]/50 pl-2.5 py-0.5">
                  {recommendationQuote}
                </p>
              )}

              {/* Toggle snapshot vs editorial image */}
              {snapshotUrl && (
                <div className="pt-1 flex items-center gap-2">
                  <label className="text-[11px] text-[#a1a1aa] flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useSnapshotAsImage}
                      onChange={(e) => setUseSnapshotAsImage(e.target.checked)}
                      className="rounded accent-[#e2b87e] cursor-pointer"
                    />
                    <span>Use my real mirror camera snapshot for wardrobe cards</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* List of Detected Garments to Stock */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d2c4b5] font-sans">
                Detected Garments to Stock in Wardrobe
              </h4>
              <span className="text-xs text-[#a1a1aa] font-mono">
                {stockedIds.size} of {detectedGarments.length} Stocked
              </span>
            </div>

            <div className="space-y-3">
              {detectedGarments.map((garment, idx) => {
                const key = garment.id || `${garment.name}-${idx}`;
                const isStocked = stockedIds.has(key);
                const garmentImg = resolveGarmentImage(garment, idx);

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl bg-[#201f22]/80 border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isStocked
                        ? 'border-[#22c55e]/50 bg-[#162118]/60 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                        : 'border-[#3f3f46]/40 hover:border-[#ffd499]/50'
                    }`}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#0e0e10] shrink-0 border border-[#4e453a]/40 shadow-inner">
                        <img
                          src={garmentImg}
                          alt={garment.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Color dot swatch */}
                        <div
                          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-[#ffffff]/40 shadow-sm"
                          style={{ backgroundColor: garment.colorHex }}
                          title={garment.colorName}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-semibold text-[#e5e1e4] truncate">
                            {garment.name}
                          </h5>
                          <span className="px-2 py-0.5 rounded-md bg-[#2a2a2c] text-[#ffd499] text-[10px] font-mono font-bold uppercase">
                            {garment.category}
                          </span>
                          <span className="text-[10px] font-mono text-[#d2c4b5]/70">
                            {garment.material}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-relaxed">
                          {garment.description}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#d2c4b5]/60 pt-0.5 flex-wrap">
                          <span>Drape: <strong className="text-[#b2e1ff]">{garment.drapeType}</strong></span>
                          <span>•</span>
                          <span>GSM: {garment.gsm}</span>
                          <span>•</span>
                          <span>Color: {garment.colorName}</span>
                          {garment.price && (
                            <>
                              <span>•</span>
                              <span className="text-[#ffd499] font-bold">{garment.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Stock Action */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStockSingle(garment, idx)}
                        disabled={isStocked}
                        className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          isStocked
                            ? 'bg-[#15803d]/30 text-[#4ade80] border border-[#22c55e]/60 cursor-default'
                            : 'bg-[#e2b87e] hover:bg-[#ffd499] text-[#442b00] active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isStocked ? 'check_circle' : 'add_circle'}
                        </span>
                        <span>{isStocked ? 'Stocked ✓' : 'Stock in Wardrobe'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#27272a] bg-[#141418] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
            <span className="material-symbols-outlined text-[18px] text-[#ffd499]">inventory_2</span>
            <span>Current Atelier: <strong>{existingWardrobe.length}</strong> items in wardrobe</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Stock All Button */}
            <button
              type="button"
              onClick={handleStockAllItems}
              disabled={allStocked}
              className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                allStocked
                  ? 'bg-[#2a2a2c] text-[#a1a1aa] border border-[#3f3f46]/40 opacity-60 cursor-not-allowed'
                  : 'bg-[#e2b87e] hover:bg-[#ffd499] text-[#442b00] active:scale-95 shadow-[0_0_20px_rgba(226,184,126,0.3)]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {allStocked ? 'done_all' : 'inventory'}
              </span>
              <span>{allStocked ? 'All Garments Stocked' : `Stock All (${detectedGarments.length}) to Wardrobe`}</span>
            </button>

            {/* View In Wardrobe Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToWardrobe();
              }}
              className="py-2.5 px-4 rounded-full bg-[#2a2a2c] hover:bg-[#353538] text-[#ffd499] border border-[#ffd499]/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>View Wardrobe</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
