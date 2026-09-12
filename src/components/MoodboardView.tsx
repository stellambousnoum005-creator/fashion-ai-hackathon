import React, { useState } from 'react';
import { Inspiration } from '../types';

interface MoodboardViewProps {
  inspirations: Inspiration[];
  activeInspirationId: string;
  onSelectInspiration: (insp: Inspiration) => void;
  onAddNewInspiration: (newInsp: Inspiration) => void;
}

export const MoodboardView: React.FC<MoodboardViewProps> = ({
  inspirations,
  activeInspirationId,
  onSelectInspiration,
  onAddNewInspiration,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filteredInspirations = inspirations.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.silhouettes.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const carouselItems = inspirations.slice(0, 5);

  const handlePrevCarousel = () => {
    setIsAutoPlaying(false);
    setCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    setIsAutoPlaying(false);
    setCarouselIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const currentCarouselItem = carouselItems[carouselIndex] || carouselItems[0];

  const handleSynthesizeAesthetic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsSynthesizing(true);
    setTimeout(() => {
      const generated: Inspiration = {
        id: 'insp-custom-' + Date.now(),
        name: customPrompt.length > 22 ? customPrompt.slice(0, 20) + '...' : customPrompt,
        era: 'Algorithmic Atelier 2026',
        subtitle: 'Generative prompt synthesis with bespoke textile draping',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop',
        palette: ['#0d0d11', '#e2b87e', '#ddb8ff', '#63caff', '#353437'],
        paletteNames: ['Obsidian Void', 'Champagne Glaze', 'Synthetic Lavender', 'Electric Azure', 'Raw Slate'],
        silhouettes: ['Sculpted Hourglass', 'Asymmetric Mantle', 'Knife-Pleat Flare'],
        fabrics: ['Liquid Lamé', 'Bonded Neoprene Silk', 'Technical Organza'],
        aestheticMatch: 95,
        description: `Procedural haute couture aesthetic rendered from: "${customPrompt}". Balances sculptural rigid lines with fluid textile physics.`,
        promptSignature: `${customPrompt}, haute couture fashion editorial, 35mm grain, luxury runway atmospheric lighting`,
      };

      onAddNewInspiration(generated);
      onSelectInspiration(generated);
      setIsSynthesizing(false);
      setCustomPrompt('');
      setShowGenerator(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-6 pb-6">
      {/* Header & Section Title */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#e5e1e4] tracking-tight">
            Haute Couture Moodboards
          </h2>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            id="toggleGeneratorBtn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3a2a14] border border-[#ffd499]/40 text-[#ffd499] text-xs font-semibold hover:bg-[#e2b87e] hover:text-[#442b00] transition-all shadow-[0_0_12px_rgba(226,184,126,0.2)]"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Synthesize New</span>
          </button>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Curated aesthetic canons loaded into the Gemini Vision engine for real-time silhouette and textile alignment.
        </p>
      </div>

      {/* Synthesis Prompt Drawer */}
      {showGenerator && (
        <form
          onSubmit={handleSynthesizeAesthetic}
          className="p-4 rounded-2xl bg-[#201f22]/90 backdrop-blur-xl border border-[#ffd499]/40 shadow-2xl flex flex-col space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#ffd499] tracking-wider font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd499] animate-ping" />
              Generative Moodboard Synthesizer
            </span>
            <button
              type="button"
              onClick={() => setShowGenerator(false)}
              className="text-[#a1a1aa] hover:text-[#e5e1e4]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Blade Runner 2049 architectural trench in liquid titanium..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0e0e10] border border-[#4e453a]/60 text-sm text-[#e5e1e4] placeholder-[#9b8f81] focus:outline-none focus:border-[#ffd499] font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#a1a1aa]">
              Generates colorways, fabric physics & silhouette nodes
            </span>
            <button
              type="submit"
              disabled={isSynthesizing || !customPrompt.trim()}
              className="px-4 py-1.5 rounded-full bg-[#e2b87e] text-[#442b00] text-xs font-semibold hover:bg-[#ffd499] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isSynthesizing ? 'progress_activity' : 'sparkles'}
              </span>
              <span>{isSynthesizing ? 'Curating...' : 'Generate Aesthetic'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Interactive Featured Atelier Moodboard Carousel */}
      {carouselItems.length > 0 && !searchQuery && (
        <div className="relative w-full rounded-3xl overflow-hidden border border-[#ffd499]/40 bg-[#18181f] shadow-[0_12px_40px_rgba(0,0,0,0.6)] group">
          {/* Main Carousel Stage */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden">
            <img
              src={currentCarouselItem.imageUrl}
              alt={currentCarouselItem.name}
              className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-102"
              crossOrigin="anonymous"
            />
            {/* Dark & Gold Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/40 to-transparent pointer-events-none" />

            {/* Top Carousel Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e0e10]/80 backdrop-blur-md border border-[#ffd499]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd499] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffd499] font-bold">
                  Featured Runway Canon • {carouselIndex + 1}/{carouselItems.length}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#d2c4b5] bg-[#0e0e10]/80 px-2.5 py-1 rounded-full border border-[#4e453a]">
                {currentCarouselItem.era}
              </span>
            </div>

            {/* Prev / Next Interactive Floating Controls with visual feedback */}
            <div className="absolute inset-y-0 left-3 flex items-center z-20">
              <button
                type="button"
                onClick={handlePrevCarousel}
                id="carouselPrevBtn"
                className="w-10 h-10 rounded-full bg-[#0e0e10]/85 hover:bg-[#e2b87e] text-[#ffd499] hover:text-[#442b00] border border-[#ffd499]/40 hover:border-[#ffd499] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg hover:shadow-[0_0_16px_rgba(226,184,126,0.6)] cursor-pointer"
                title="Previous runway inspiration"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
            </div>

            <div className="absolute inset-y-0 right-3 flex items-center z-20">
              <button
                type="button"
                onClick={handleNextCarousel}
                id="carouselNextBtn"
                className="w-10 h-10 rounded-full bg-[#0e0e10]/85 hover:bg-[#e2b87e] text-[#ffd499] hover:text-[#442b00] border border-[#ffd499]/40 hover:border-[#ffd499] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg hover:shadow-[0_0_16px_rgba(226,184,126,0.6)] cursor-pointer"
                title="Next runway inspiration"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Bottom Details Overlay inside Carousel */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="max-w-md">
                <span className="text-[11px] font-mono text-[#ffd499] uppercase tracking-wider block font-semibold">
                  Match Score: {currentCarouselItem.aestheticMatch}%
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#e5e1e4] leading-tight">
                  {currentCarouselItem.name}
                </h3>
                <p className="text-xs text-[#d2c4b5] line-clamp-1 mt-0.5 font-medium">
                  {currentCarouselItem.subtitle}
                </p>
              </div>

              {/* Action Button inside Carousel */}
              <button
                type="button"
                onClick={() => onSelectInspiration(currentCarouselItem)}
                id="carouselApplyBtn"
                className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(226,184,126,0.3)] shrink-0 cursor-pointer ${
                  currentCarouselItem.id === activeInspirationId
                    ? 'bg-[#3a2a14] text-[#ffd499] border border-[#ffd499]/70 ring-1 ring-[#ffd499]/40'
                    : 'bg-[#e2b87e] text-[#442b00] hover:bg-[#ffd499] hover:shadow-[0_0_24px_rgba(226,184,126,0.6)]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {currentCarouselItem.id === activeInspirationId ? 'check' : 'view_in_ar'}
                </span>
                <span>
                  {currentCarouselItem.id === activeInspirationId
                    ? 'Active in Mirror'
                    : 'Equip To Mirror'}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Thumbnails Strip Bar below Carousel */}
          <div className="p-3 bg-[#131315] border-t border-[#27272a] flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {carouselItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCarouselIndex(idx);
                  }}
                  id={`carouselThumb-${item.id}`}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer group active:scale-95 ${
                    carouselIndex === idx
                      ? 'border-[#ffd499] shadow-[0_0_12px_rgba(226,184,126,0.4)] scale-105 ring-1 ring-[#ffd499]/60'
                      : 'border-[#3f3f46]/60 opacity-60 hover:opacity-100 hover:border-[#ffd499]/50'
                  }`}
                  title={`View ${item.name}`}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    crossOrigin="anonymous"
                  />
                </button>
              ))}
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5 px-2">
              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCarouselIndex(idx);
                  }}
                  className={`transition-all rounded-full ${
                    carouselIndex === idx
                      ? 'w-6 h-1.5 bg-[#ffd499]'
                      : 'w-1.5 h-1.5 bg-[#4e453a] hover:bg-[#d2c4b5]'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b8f81] text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter aesthetics, silhouettes, or eras..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-[#1c1b1d] border border-[#3f3f46]/40 text-xs text-[#e5e1e4] placeholder-[#9b8f81] focus:outline-none focus:border-[#ffd499]/60"
        />
      </div>

      {/* Moodboard Cards Grid */}
      <div className="space-y-5">
        {filteredInspirations.map((insp) => {
          const isActive = insp.id === activeInspirationId;

          return (
            <div
              key={insp.id}
              id={`moodboard-card-${insp.id}`}
              className={`rounded-2xl overflow-hidden bg-[#18181f]/80 backdrop-blur-xl border transition-all duration-300 shadow-xl flex flex-col md:flex-row ${
                isActive
                  ? 'border-[#ffd499] shadow-[0_0_24px_rgba(226,184,126,0.2)]'
                  : 'border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden bg-[#0e0e10] shrink-0">
                <img
                  src={insp.imageUrl}
                  alt={insp.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Match Score Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0e0e10]/80 backdrop-blur-md border border-[#ffd499]/30 flex items-center gap-1.5">
                  <span className="text-[10px] text-[#d2c4b5] uppercase font-mono">
                    CANON MATCH
                  </span>
                  <span className="font-mono text-xs text-[#ffd499] font-bold">
                    {insp.aestheticMatch}%
                  </span>
                </div>

                {/* Active Indicator Pin */}
                {isActive && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#e2b87e] text-[#442b00] text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#442b00] animate-ping" />
                    LIVE IN MIRROR
                  </div>
                )}
              </div>

              {/* Content Panel */}
              <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xl font-serif font-bold text-[#e5e1e4]">
                      {insp.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#ffd499]/90 shrink-0">
                      {insp.era}
                    </span>
                  </div>
                  <p className="text-xs text-[#d2c4b5]/80 mt-0.5 font-medium">
                    {insp.subtitle}
                  </p>
                  <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed">
                    {insp.description}
                  </p>
                </div>

                {/* Palette Swatches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#d2c4b5]/70 font-mono">
                      Curated Palette
                    </span>
                    <span className="text-[10px] font-mono text-[#a1a1aa]">
                      {insp.palette.length} tones
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {insp.palette.map((colorHex, idx) => (
                      <div
                        key={idx}
                        className="group relative w-7 h-7 rounded-full border border-[#4e453a]/60 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: colorHex }}
                        title={`${insp.paletteNames[idx] || colorHex}: ${colorHex}`}
                      >
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-0.5 rounded bg-[#0e0e10] text-[9px] font-mono text-[#e5e1e4] whitespace-nowrap z-20 border border-[#3f3f46]">
                          {insp.paletteNames[idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Silhouettes & Fabrics */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#d2c4b5]/70 font-mono">
                    Silhouette Vectors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {insp.silhouettes.map((sil, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-[#201f22] text-[10px] text-[#e5e1e4] border border-[#3f3f46]/40"
                      >
                        {sil}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#27272a]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
                    <span className="material-symbols-outlined text-[14px] text-[#ffd499]">
                      fingerprint
                    </span>
                    <span className="truncate max-w-[180px] font-mono">
                      {insp.promptSignature.slice(0, 30)}...
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectInspiration(insp)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#3a2a14] text-[#ffd499] border border-[#ffd499]/60 cursor-default'
                        : 'bg-[#ffd499] text-[#442b00] hover:bg-[#e2b87e] active:scale-95 shadow-[0_0_16px_rgba(226,184,126,0.3)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isActive ? 'check' : 'view_in_ar'}
                    </span>
                    <span>{isActive ? 'Active in Mirror' : 'Apply to Mirror'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
