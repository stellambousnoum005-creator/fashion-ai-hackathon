/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType, Inspiration, WardrobeItem, StylistVerdict, SavedLook, PipelineConfig } from './types';
import { INITIAL_INSPIRATIONS, INITIAL_WARDROBE, INITIAL_VERDICT, INITIAL_SAVED_LOOKS } from './data/fashionData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MirrorView } from './components/MirrorView';
import { MoodboardView } from './components/MoodboardView';
import { WardrobeView } from './components/WardrobeView';
import { PipelineView } from './components/PipelineView';
import { CoutureProfileModal } from './components/CoutureProfileModal';
import { ContactModal } from './components/ContactModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('mirror');
  const [inspirations, setInspirations] = useState<Inspiration[]>(INITIAL_INSPIRATIONS);
  const [currentInspiration, setCurrentInspiration] = useState<Inspiration>(INITIAL_INSPIRATIONS[0]);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE);
  const [verdict, setVerdict] = useState<StylistVerdict>(INITIAL_VERDICT);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>(INITIAL_SAVED_LOOKS);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
    activeModel: 'Gemini 1.5 Pro',
    loraWeight: 0.85,
    cfgScale: 7.5,
    denoisingSteps: 30,
    streamSource: 'vonage-editorial',
    resolution: '1080p',
    fps: 60,
    latentFitConfidence: 0.98,
  });

  // Toggle equipped garment
  const handleToggleWardrobeItem = (itemId: string) => {
    setWardrobe((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, activeInLook: !item.activeInLook } : item
      )
    );
  };

  // Re-Analyze with Gemini Vision simulation
  const handleReanalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const quotes = [
        `“Harmonizing the ${currentInspiration.name} canon: pair the structured drape trench with satin wide-leg trousers to balance proportions and emphasize vertical geometry.”`,
        `“Anatomical Clavicle axis locked at 14.8°. Fluid silk drape introduces kinetic tension against the matte wool trousers.”`,
        `“Optimal golden ratio alignment detected. High-density gabardine collar frames neck geometry while bias-cut silk lengthens torso stride.”`,
        `“Sculptural volume calibrated to 96% fit threshold. Monochromatic palette achieves crisp chiaroscuro against obsidian runway staging.”`,
      ];

      const matchScores = [92, 94, 96, 97, 95];
      const randomScore = matchScores[Math.floor(Math.random() * matchScores.length)];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const randomAxis = (14.0 + Math.random() * 1.5).toFixed(1) + '°';

      setVerdict({
        quote: randomQuote,
        model: pipelineConfig.activeModel,
        aestheticMatchPercent: randomScore,
        drapeAssessment: randomScore > 94 ? 'RIGID' : 'SEMISTIFF',
        postureAxis: randomAxis,
        latentFitLock: parseFloat((0.96 + Math.random() * 0.03).toFixed(2)),
        recommendedItemIds: ['item-silk-slip', 'item-onyx-tailored'],
        notes: [
          `Shoulder axis dynamically aligned at ${randomAxis} inclination`,
          'Kinetic drape simulation verified on ASTM deflection index',
          'Aesthetic match calculated against ' + currentInspiration.name + ' archival vectors',
        ],
      });

      setIsAnalyzing(false);
    }, 1100);
  };

  // Switch inspiration
  const handleSelectInspiration = (insp: Inspiration) => {
    setCurrentInspiration(insp);
    // Update match score and quote to match chosen aesthetic
    setVerdict((prev) => ({
      ...prev,
      aestheticMatchPercent: insp.aestheticMatch,
      quote: `“Curating ${insp.name} canon: utilize ${insp.silhouettes[0]} silhouettes with ${insp.fabrics[0]} to preserve authentic archive proportions.”`,
    }));
    setActiveTab('mirror');
  };

  const handleAddNewInspiration = (newInsp: Inspiration) => {
    setInspirations((prev) => [newInsp, ...prev]);
  };

  const handleSaveLook = (newLook: SavedLook) => {
    setSavedLooks((prev) => [newLook, ...prev]);
  };

  const handleRemoveLook = (lookId: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col selection:bg-[#e2b87e] selection:text-[#442b00] font-sans">
      {/* Fixed Luxury Top Header */}
      <Header
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        isStreamActive={true}
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-20 pb-24 px-4 max-w-7xl mx-auto w-full">
        {activeTab === 'mirror' && (
          <MirrorView
            currentInspiration={currentInspiration}
            onSelectInspirationClick={() => setActiveTab('moodboard')}
            wardrobe={wardrobe}
            onToggleItem={handleToggleWardrobeItem}
            verdict={verdict}
            onReanalyze={handleReanalyze}
            isAnalyzing={isAnalyzing}
            onSaveLook={handleSaveLook}
          />
        )}

        {activeTab === 'moodboard' && (
          <MoodboardView
            inspirations={inspirations}
            activeInspirationId={currentInspiration.id}
            onSelectInspiration={handleSelectInspiration}
            onAddNewInspiration={handleAddNewInspiration}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeView
            wardrobe={wardrobe}
            onToggleItem={handleToggleWardrobeItem}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            config={pipelineConfig}
            onChangeConfig={(newCfg) =>
              setPipelineConfig((prev) => ({ ...prev, ...newCfg }))
            }
          />
        )}
      </main>

      {/* Couture Client Dossier Modal */}
      <CoutureProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        savedLooks={savedLooks}
        onRemoveLook={handleRemoveLook}
      />

      {/* Atelier Concierge & Fitting Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Fixed Bottom Dock Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
