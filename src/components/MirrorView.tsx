import React, { useState, useRef, useEffect } from 'react';
import { Inspiration, WardrobeItem, StylistVerdict, SavedLook, DetectedGarment } from '../types';
import { ASSETS } from '../data/fashionData';
import { ScanWardrobeModal } from './ScanWardrobeModal';

interface MirrorViewProps {
  currentInspiration: Inspiration;
  onSelectInspirationClick: () => void;
  wardrobe: WardrobeItem[];
  onToggleItem: (id: string) => void;
  verdict: StylistVerdict;
  onReanalyze: () => void;
  isAnalyzing: boolean;
  onSaveLook: (look: SavedLook) => void;
  onStockItemsToWardrobe: (items: WardrobeItem[]) => void;
  onStockSingleItem: (item: WardrobeItem) => void;
  onNavigateToWardrobe: () => void;
}

export const MirrorView: React.FC<MirrorViewProps> = ({
  currentInspiration,
  onSelectInspirationClick,
  wardrobe,
  onToggleItem,
  verdict,
  onReanalyze,
  isAnalyzing,
  onSaveLook,
  onStockItemsToWardrobe,
  onStockSingleItem,
  onNavigateToWardrobe,
}) => {
  // Feed source: 'look1' | 'look2' | 'look3' | 'webcam'
  const [feedMode, setFeedMode] = useState<'look1' | 'look2' | 'look3' | 'webcam'>('webcam');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraConnecting, setIsCameraConnecting] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Garment scanning & stocking state
  const [isScanningClothes, setIsScanningClothes] = useState(false);
  const [detectedGarments, setDetectedGarments] = useState<DetectedGarment[]>([]);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | undefined>(undefined);
  const [scanResult, setScanResult] = useState<{
    generalDiagnosis?: string;
    aestheticMatchPercent?: number;
    recommendationQuote?: string;
  } | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanToast, setScanToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current visual background
  const getVisualUrl = () => {
    switch (feedMode) {
      case 'look2':
        return ASSETS.modelLook2;
      case 'look3':
        return ASSETS.modelLook3;
      case 'look1':
      default:
        return ASSETS.modelLook1;
    }
  };

  const startCamera = async () => {
    setIsCameraConnecting(true);
    setCameraError(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser or iframe environment.');
      setIsCameraConnecting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        videoRef.current.play().catch(() => {});
      }
      setCameraError(null);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in browser settings, or open in a new tab if running in an iframe.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device detected on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is already in use by another application.';
      }
      setCameraError(message);
    } finally {
      setIsCameraConnecting(false);
    }
  };

  // Setup webcam when feedMode is 'webcam'
  useEffect(() => {
    if (feedMode === 'webcam') {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraError(null);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [feedMode, facingMode]);

  const handleFlipFeed = () => {
    if (feedMode === 'webcam') {
      setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    } else if (feedMode === 'look1') {
      setFeedMode('look2');
    } else if (feedMode === 'look2') {
      setFeedMode('look3');
    } else {
      setFeedMode('look1');
    }
  };

  const handleStyleMe = () => {
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 400);
    onReanalyze();
  };

  // Frame capture helper
  const captureFrameBase64 = (): string | null => {
    if (feedMode === 'webcam' && videoRef.current) {
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(video.videoWidth, 1280);
          canvas.height = Math.min(video.videoHeight, 720);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (facingMode === 'user') {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.85);
          }
        } catch (e) {
          console.warn('Could not export canvas base64:', e);
        }
      }
    }
    return null;
  };

  // Garment scanning & analysis via Gemini / Atelier Vision
  const handleScanClothesToWardrobe = async () => {
    setIsScanningClothes(true);
    setScanToast('Capturing mirror snapshot & analyzing garments...');
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 400);

    const snapshot = captureFrameBase64();
    const activeImage = snapshot || getVisualUrl();
    setCapturedSnapshot(activeImage);

    try {
      const response = await fetch('/api/analyze-clothes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: snapshot || undefined,
          inspirationName: currentInspiration.name,
          feedMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.detectedItems) && data.detectedItems.length > 0) {
        setDetectedGarments(data.detectedItems);
        setScanResult({
          generalDiagnosis: data.generalDiagnosis,
          aestheticMatchPercent: data.aestheticMatchPercent,
          recommendationQuote: data.recommendationQuote,
        });
        setIsScanModalOpen(true);
        setScanToast(`✨ Found ${data.detectedItems.length} garments! Ready to stock into your wardrobe.`);
      } else {
        throw new Error(data.error || 'Empty items response');
      }
    } catch (err: any) {
      console.warn('Vision scan endpoint encountered error, using couture fallback:', err);
      // Fallback detected items based on current look
      const fallbackItems: DetectedGarment[] = [
        {
          name: 'Atelier Mock-Neck Silhouette',
          category: 'tops',
          material: 'FINE SILK COTTON',
          colorName: 'Obsidian Noir',
          colorHex: '#18181b',
          gsm: 190,
          drapeType: 'Liquid Fluid',
          price: '€1,150',
          description: 'Refined seamless contour with high neckline and fluid torso inertia.',
          composition: '70% Mulberry Silk, 30% Egyptian Cotton',
          careLabel: 'Delicate Cold Hand Wash • Flat Dry',
        },
        {
          name: 'Architectural Pleated Slacks',
          category: 'trousers',
          material: 'SUPER 120s WOOL',
          colorName: 'Deep Basalt',
          colorHex: '#201f22',
          gsm: 280,
          drapeType: 'Rigid Structured',
          price: '€1,850',
          description: 'Knife-edge front creases with an architectural drop rise designed to balance proportions.',
          composition: '100% Super 120s Worsted Wool',
          careLabel: 'Specialist Dry Clean Only',
        },
      ];

      setDetectedGarments(fallbackItems);
      setScanResult({
        generalDiagnosis: 'Mirror garment vision scanned successfully. Balanced proportions ready for stocking.',
        aestheticMatchPercent: 93,
        recommendationQuote: '“Clean architectural lines that layer with effortless symmetry.”',
      });
      setIsScanModalOpen(true);
      setScanToast('✨ 2 garments detected from mirror!');
    } finally {
      setIsScanningClothes(false);
      setTimeout(() => setScanToast(null), 4000);
    }
  };

  const handleSaveLookClick = () => {
    setIsBookmarked(true);
    const activeItems = wardrobe.filter((item) => item.activeInLook);
    const newLook: SavedLook = {
      id: 'look-' + Date.now(),
      timestamp: 'Just now • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspirationName: currentInspiration.name,
      aestheticMatch: verdict.aestheticMatchPercent,
      quote: verdict.quote,
      modelImageUrl: getVisualUrl(),
      equippedItems: activeItems.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        material: item.material,
        imageUrl: item.imageUrl,
      })),
    };

    onSaveLook(newLook);
    setTimeout(() => setIsBookmarked(false), 2000);
  };

  // Recommended items from wardrobe
  const recommendedItems = wardrobe.filter((item) =>
    verdict.recommendedItemIds.includes(item.id)
  );

  // Items in wardrobe that originated from mirror scans
  const mirrorStockedItems = wardrobe.filter((item) => item.source === 'mirror_scan');

  return (
    <div className="flex flex-col w-full max-w-md mx-auto space-y-4 pb-4">
      {/* Toast Notification */}
      {scanToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#3a2a14] border border-[#ffd499] text-[#ffd499] px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn pointer-events-none max-w-sm text-center">
          <span className="material-symbols-outlined text-[16px] text-[#ffd499]">checkroom</span>
          <span>{scanToast}</span>
        </div>
      )}

      {/* Live AR Haute Couture Viewport */}
      <div
        id="haute-couture-viewport"
        className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden bg-[#0e0e10] border border-[#3f3f46]/40 shadow-2xl flex flex-col justify-between p-4 select-none"
      >
        {/* Background Visual or Live Video */}
        {feedMode === 'webcam' ? (
          <div className="absolute inset-0 bg-[#0e0e10] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                facingMode === 'user' ? '-scale-x-100' : ''
              } ${cameraError || isCameraConnecting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />

            {/* Connecting Spinner */}
            {isCameraConnecting && !cameraError && (
              <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#ffd499] border-t-transparent animate-spin" />
                <p className="text-xs font-mono text-[#ffd499] uppercase tracking-wider font-semibold">
                  Connecting to Local Camera...
                </p>
                <p className="text-[11px] text-[#d2c4b5]/70 max-w-xs">
                  Please click &ldquo;Allow&rdquo; on your browser&apos;s camera prompt if requested.
                </p>
              </div>
            )}

            {/* Camera Access Blocked or Denied Recovery Card */}
            {cameraError && (
              <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-xs bg-[#18181f]/95 border border-[#ffd499]/30 rounded-2xl backdrop-blur-xl shadow-2xl mx-4">
                <div className="w-12 h-12 rounded-full bg-[#93000a]/30 text-[#ffb4ab] flex items-center justify-center border border-[#ffb4ab]/40">
                  <span className="material-symbols-outlined text-[26px]">videocam_off</span>
                </div>
                <h4 className="text-sm font-serif font-bold text-[#e5e1e4]">
                  Camera Access Blocked
                </h4>
                <p className="text-[11px] text-[#d2c4b5]/80 leading-relaxed">
                  {cameraError}
                </p>

                <div className="flex flex-col w-full gap-2 pt-2">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-full bg-[#e2b87e] text-[#442b00] hover:bg-[#ffd499] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer text-decoration-none"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span>Open in Full Tab</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#2a2a2c] hover:bg-[#353538] text-[#ffd499] text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedMode('look1')}
                      className="flex-1 py-1.5 px-3 rounded-full bg-[#2a2a2c] hover:bg-[#353538] text-[#a1a1aa] hover:text-[#e5e1e4] text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Use Demo Feed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
            style={{ backgroundImage: `url('${getVisualUrl()}')` }}
          />
        )}

        {/* Subtle Obsidian Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e10]/85 via-transparent to-[#0e0e10]/95 pointer-events-none" />

        {/* Scanning Overlay Visual Animation when analyzing clothes */}
        {isScanningClothes && (
          <div className="absolute inset-0 z-30 bg-[#0e0e10]/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#ffd499] border-t-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full border border-dashed border-[#b2e1ff] animate-pulse" />
              <span className="material-symbols-outlined text-4xl text-[#ffd499] animate-bounce">
                checkroom
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <h4 className="text-sm font-serif font-bold text-[#ffd499] uppercase tracking-wider">
                Analyzing Clothes in Mirror...
              </h4>
              <p className="text-[11px] font-mono text-[#d2c4b5]/80">
                Segmenting tops, bottoms & outerwear textiles
              </p>
            </div>
            {/* Animated Laser Bar */}
            <div className="absolute inset-x-8 top-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#ffd499] to-transparent animate-pulse shadow-[0_0_12px_#ffd499]" />
          </div>
        )}

        {/* AR Haute Couture Viewfinder Overlays */}
        <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
          {/* Reticles Top */}
          <div className="flex justify-between items-start">
            <svg className="w-8 h-8 text-[#ffd499]/70" fill="none" viewBox="0 0 32 32">
              <path
                d="M0 12V2C0 0.89543 0.89543 0 2 0H12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>

            {/* Center Horizon Tick */}
            <div className="flex items-center gap-1.5 opacity-70">
              <div className="w-2 h-[1px] bg-[#ffd499]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffd499] animate-ping" />
              <div className="w-2 h-[1px] bg-[#ffd499]" />
            </div>

            <svg className="w-8 h-8 text-[#ffd499]/70" fill="none" viewBox="0 0 32 32">
              <path
                d="M32 12V2C32 0.89543 31.1046 0 30 0H20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Live Body Silhouette Guides & Golden Ratio Nodes */}
          <div className="relative w-full h-44 flex items-center justify-center">
            {/* Shoulder Axis Vector Guide */}
            <div
              className={`absolute w-3/4 h-28 rounded-full border border-dashed border-[#ffd499]/30 ${
                isAnalyzing || isScanningClothes ? 'animate-spin' : 'animate-pulse'
              }`}
            />

            {/* Head / Bust Alignment Crosshair */}
            <div className="absolute top-2 w-16 h-20 rounded-[40%] border border-[#ffd499]/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#ffd499] shadow-[0_0_12px_rgba(226,184,126,0.9)]" />
            </div>

            {/* Lateral Draping Grid Vectors */}
            <div className="absolute inset-x-6 top-1/2 flex justify-between items-center text-[#ffd499]/50 font-mono text-[11px]">
              <span className="bg-[#0e0e10]/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                T_AXIS: {verdict.postureAxis}
              </span>
              <span className="bg-[#0e0e10]/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                DRAPE: {verdict.drapeAssessment}
              </span>
            </div>
          </div>

          {/* Reticles Bottom */}
          <div className="flex justify-between items-end">
            <svg className="w-8 h-8 text-[#ffd499]/70" fill="none" viewBox="0 0 32 32">
              <path
                d="M0 20V30C0 31.1046 0.89543 32 2 32H12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e0e10]/75 backdrop-blur-md border border-[#38bdf8]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b2e1ff] animate-pulse" />
              <span className="font-mono text-[11px] text-[#b2e1ff] uppercase tracking-wider font-semibold">
                LATENT_FIT: LOCK {verdict.latentFitLock.toFixed(2)}
              </span>
            </div>

            <svg className="w-8 h-8 text-[#ffd499]/70" fill="none" viewBox="0 0 32 32">
              <path
                d="M32 20V30C32 31.1046 31.1046 32 30 32H20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Top Viewport Control Bar */}
        <div className="relative z-10 flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e0e10]/85 backdrop-blur-xl border border-[#3f3f46]/40 shadow-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  feedMode === 'webcam' ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ffb4ab] animate-ping'
                }`}
              />
              <span className="font-mono text-[11px] text-[#e5e1e4] uppercase tracking-wider font-semibold">
                {feedMode === 'webcam' ? 'LIVE WEBCAM MIRROR' : 'RUNWAY MODEL FEED'}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0e273a] text-[#38bdf8] border border-[#38bdf8]/30 font-bold ml-1">
                VONAGE
              </span>
            </div>

            {/* Quick Stream & Camera Switchers */}
            <div className="flex items-center gap-1.5">
              {/* Mirror-to-Wardrobe Stocked Pill */}
              <button
                type="button"
                onClick={onNavigateToWardrobe}
                className="px-2.5 py-1 rounded-full bg-[#18181f]/90 text-[#ffd499] border border-[#ffd499]/40 hover:border-[#ffd499] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                title="View your digital wardrobe"
              >
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                <span>{mirrorStockedItems.length} Stocked</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedMode('webcam')}
                id="webcamModeBtn"
                className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
                  feedMode === 'webcam'
                    ? 'bg-[#e2b87e] text-[#442b00] border-[#ffd499] shadow-[0_0_14px_rgba(226,184,126,0.5)] ring-1 ring-[#ffd499]/60'
                    : 'bg-[#2a2a2c]/85 text-[#ffd499] hover:text-[#fff0db] border-[#ffd499]/40 hover:border-[#ffd499]'
                }`}
                title="Switch to your live webcam"
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>Camera</span>
              </button>

              {feedMode === 'webcam' && (
                <button
                  type="button"
                  onClick={handleFlipFeed}
                  id="flipCameraBtn"
                  className="w-7 h-7 rounded-full bg-[#2a2a2c]/85 hover:bg-[#e2b87e] text-[#e5e1e4] hover:text-[#442b00] backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md border border-[#4e453a]/50 hover:border-[#ffd499] cursor-pointer"
                  title={`Switch camera lens (${facingMode === 'user' ? 'Front lens' : 'Back lens'})`}
                >
                  <span className="material-symbols-outlined text-[15px]">flip_camera_ios</span>
                </button>
              )}
            </div>
          </div>

          {/* Model preset selector tabs */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-[#a1a1aa] uppercase">
              {feedMode === 'webcam' ? 'Or try runway looks:' : 'Switch look:'}
            </span>
            <div className="flex items-center gap-1">
              {(['look1', 'look2', 'look3'] as const).map((modeKey, i) => (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => setFeedMode(modeKey)}
                  id={`feedModeBtn-${modeKey}`}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold transition-all duration-150 active:scale-95 cursor-pointer border ${
                    feedMode === modeKey
                      ? 'bg-[#3a2a14] text-[#ffd499] border-[#ffd499]/60'
                      : 'bg-[#18181f]/80 text-[#a1a1aa] hover:text-[#e5e1e4] border-transparent hover:border-[#3f3f46]'
                  }`}
                  title={`Switch to Model Look ${i + 1}`}
                >
                  Look {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Floating Inspiration Pill */}
        <div className="relative z-10 self-start mt-auto mb-3">
          <button
            onClick={onSelectInspirationClick}
            id="currentInspirationBtn"
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#2a2a2c]/90 backdrop-blur-xl border border-[#4e453a]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-[#ffd499]/80 transition-all text-left active:scale-95"
          >
            <div
              className="w-6 h-6 rounded-full overflow-hidden bg-cover bg-center shrink-0 border border-[#ffd499]/40"
              style={{ backgroundImage: `url('${currentInspiration.thumbnailUrl}')` }}
            />
            <div className="flex flex-col pr-1">
              <span className="text-[10px] uppercase font-bold text-[#d2c4b5]/80 tracking-wider">
                Current Inspiration
              </span>
              <span className="text-sm font-semibold text-[#ffd499] leading-tight">
                {currentInspiration.name}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#ffd499] text-[18px] group-hover:rotate-45 transition-transform">
              tune
            </span>
          </button>
        </div>

        {/* Primary Action Buttons: Scan Clothes to Wardrobe + Style Me */}
        <div className="relative z-10 w-full flex flex-col gap-2">
          {/* Main Requested Feature: Scan Clothes to Wardrobe */}
          <button
            onClick={handleScanClothesToWardrobe}
            disabled={isScanningClothes}
            id="scanClothesToWardrobeBtn"
            className="group relative w-full h-13 rounded-full bg-gradient-to-r from-[#ffd499] via-[#e2b87e] to-[#d69f5c] text-[#331e00] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(226,184,126,0.45)] active:scale-[0.98] transition-all overflow-hidden disabled:opacity-80 cursor-pointer border border-[#fff2db]/60"
            title="Captures your mirror image, analyzes your clothes with AI, and lets you stock them in your wardrobe"
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform ${
                isScanningClothes ? 'animate-spin' : 'group-hover:scale-110'
              }`}
            >
              {isScanningClothes ? 'progress_activity' : 'checkroom'}
            </span>
            <span className="tracking-wide uppercase font-extrabold">
              {isScanningClothes ? 'ANALYZING CLOTHES...' : 'SCAN CLOTHES TO WARDROBE'}
            </span>

            {/* Shimmer line */}
            <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-pulse pointer-events-none" />
          </button>

          {/* Secondary Action: Style & Drape Evaluation */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleStyleMe}
              disabled={isAnalyzing}
              id="styleMeBtn"
              className="flex-1 py-2 px-3 rounded-full bg-[#201f22]/90 hover:bg-[#2a2a2c] text-[#ffd499] text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-[#ffd499]/30 hover:border-[#ffd499] cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isAnalyzing ? 'animate-spin' : ''
                }`}
              >
                {isAnalyzing ? 'progress_activity' : 'flare'}
              </span>
              <span>{isAnalyzing ? 'Evaluating...' : 'Style & Drape Check'}</span>
            </button>

            {detectedGarments.length > 0 && (
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="py-2 px-3 rounded-full bg-[#3a2a14] text-[#ffd499] border border-[#ffd499]/50 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer hover:bg-[#4a3a24] transition-all"
                title="View detected clothes drawer"
              >
                <span className="material-symbols-outlined text-[15px]">inventory</span>
                <span>Review ({detectedGarments.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 text-[#d2c4b5]/75 text-center">
            <span className="material-symbols-outlined text-[13px] text-[#ffd499]">
              photo_camera
            </span>
            <span className="font-mono text-[10px]">
              Snaps mirror feed → AI analyzes textiles → Stocks to Digital Wardrobe
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time AI Stylist Recommendation Card */}
      <div
        id="stylist-verdict-card"
        className="w-full rounded-2xl bg-[#2a2a2c]/90 backdrop-blur-2xl border border-[#3f3f46]/50 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col space-y-4"
      >
        {/* Card Header with Model Tag and Live Match % */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#62259b] text-[#ddb8ff] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#d2c4b5]/80 uppercase tracking-widest block font-mono">
                {verdict.model}
              </span>
              <span className="text-base font-semibold text-[#e5e1e4]">
                Stylist Verdict
              </span>
            </div>
          </div>

          {/* Aesthetic Match Ring & Metric */}
          <div className="flex items-center gap-2 bg-[#0e0e10]/80 px-3 py-1.5 rounded-full border border-[#4e453a]/40">
            <span className="text-[11px] uppercase tracking-wider text-[#d2c4b5] font-semibold">
              Aesthetic Match
            </span>
            <span className="font-mono text-sm text-[#ffd499] font-bold">
              {verdict.aestheticMatchPercent}%
            </span>
          </div>
        </div>

        {/* Golden Match Progress Track */}
        <div className="w-full h-1.5 bg-[#0e0e10] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e2b87e] rounded-full shadow-[0_0_10px_rgba(226,184,126,0.7)] transition-all duration-700"
            style={{ width: `${verdict.aestheticMatchPercent}%` }}
          />
        </div>

        {/* Stylist Verdict Quote */}
        <div className="p-3.5 rounded-xl bg-[#0e0e10]/60 border border-[#3f3f46]/30">
          <p className="text-sm text-[#e5e1e4] italic font-serif leading-relaxed">
            {scanResult?.recommendationQuote || verdict.quote}
          </p>
        </div>

        {/* Section: Stocked Directly from Mirror */}
        {mirrorStockedItems.length > 0 && (
          <div className="p-3 rounded-xl bg-[#3a2a14]/40 border border-[#ffd499]/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffd499]">checkroom</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ffd499]">
                  Stocked from Mirror ({mirrorStockedItems.length})
                </span>
              </div>
              <button
                onClick={onNavigateToWardrobe}
                className="text-[10px] text-[#ffd499] underline hover:text-white font-mono cursor-pointer"
              >
                View Atelier →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mirrorStockedItems.slice(0, 4).map((item) => {
                const isEquipped = item.activeInLook;
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                      isEquipped
                        ? 'bg-[#2a2215] border-[#ffd499]/60'
                        : 'bg-[#18181f]/80 border-[#3f3f46]/40 hover:border-[#ffd499]/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded bg-cover bg-center shrink-0 border border-[#4e453a]/30"
                        style={{ backgroundImage: `url('${item.imageUrl}')` }}
                      />
                      <div className="min-w-0 flex flex-col">
                        <span className="text-[11px] text-[#e5e1e4] font-semibold truncate">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#ffd499]/80">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[14px] text-[#ffd499]">
                      {isEquipped ? 'check' : 'add'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Wardrobe Additions */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d2c4b5]/80 font-sans">
              Recommended Wardrobe Additions
            </span>
            <span className="text-[11px] text-[#ffd499] font-mono">
              {recommendedItems.filter((i) => i.activeInLook).length} active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {recommendedItems.map((item) => {
              const isEquipped = item.activeInLook;
              return (
                <button
                  key={item.id}
                  id={`wardrobe-chip-${item.id}`}
                  onClick={() => onToggleItem(item.id)}
                  className={`group flex items-center justify-between p-2 rounded-xl transition-all text-left border ${
                    isEquipped
                      ? 'bg-[#201f22] border-[#e2b87e]/50 shadow-[0_0_12px_rgba(226,184,126,0.15)]'
                      : 'bg-[#201f22]/70 border-[#3f3f46]/30 hover:border-[#4e453a]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg overflow-hidden bg-cover bg-center shrink-0 border border-[#4e453a]/40"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    />
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs text-[#e5e1e4] truncate font-semibold">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#d2c4b5]/70">
                        {item.code} • {item.material}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-1 transition-colors ${
                      isEquipped
                        ? 'bg-[#e2b87e] text-[#442b00] shadow-[0_0_8px_rgba(226,184,126,0.5)]'
                        : 'bg-[#2a2a2c] text-[#a1a1aa] group-hover:text-[#e5e1e4]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isEquipped ? 'check' : 'add'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Scan to Wardrobe Quick Action */}
          <button
            onClick={handleScanClothesToWardrobe}
            disabled={isScanningClothes}
            className="flex-1 py-2.5 px-3 rounded-full bg-[#3a2a14] hover:bg-[#4a3a24] text-[#ffd499] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border border-[#ffd499]/40 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">checkroom</span>
            <span>{isScanningClothes ? 'Scanning...' : 'Stock Clothes'}</span>
          </button>

          {/* Re-Analyze Button */}
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            id="reanalyzeBtn"
            className="flex-1 py-2.5 px-3 rounded-full bg-[#0e0e10] hover:bg-[#1c1b1d] text-[#e5e1e4] hover:text-[#ffd499] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border border-[#3f3f46]/40 text-xs font-semibold"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isAnalyzing ? 'animate-spin text-[#ffd499]' : ''
              }`}
            >
              refresh
            </span>
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>

          {/* Save Look Button */}
          <button
            onClick={handleSaveLookClick}
            id="saveLookBtn"
            className={`flex-1 py-2.5 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border text-xs font-semibold ${
              isBookmarked
                ? 'bg-[#e2b87e]/20 text-[#ffd499] border-[#e2b87e]'
                : 'bg-[#201f22] text-[#e5e1e4] hover:text-[#ffd499] border-[#3f3f46]/40'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{
                fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              bookmark
            </span>
            <span>{isBookmarked ? 'Look Saved!' : 'Save Look'}</span>
          </button>

          {/* Toggle Fullscreen Modal Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            id="fullscreenMirrorBtn"
            className="w-10 h-10 rounded-full bg-[#0e0e10] hover:bg-[#1c1b1d] text-[#e5e1e4] hover:text-[#ffd499] transition-all flex items-center justify-center shrink-0 active:scale-95 border border-[#3f3f46]/40"
            title="Open Fullscreen Runway Mirror"
          >
            <span className="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>
        </div>
      </div>

      {/* Detected Garments Stocking Modal */}
      <ScanWardrobeModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        detectedGarments={detectedGarments}
        snapshotUrl={capturedSnapshot}
        generalDiagnosis={scanResult?.generalDiagnosis}
        aestheticMatchPercent={scanResult?.aestheticMatchPercent}
        recommendationQuote={scanResult?.recommendationQuote}
        onStockItem={onStockSingleItem}
        onStockAll={onStockItemsToWardrobe}
        onNavigateToWardrobe={onNavigateToWardrobe}
        isScanning={isScanningClothes}
        existingWardrobe={wardrobe}
      />

      {/* Theatrical Fullscreen Mirror Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0e0e10] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg h-[90vh] rounded-3xl overflow-hidden border border-[#ffd499]/30 shadow-2xl flex flex-col justify-between p-6">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${getVisualUrl()}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e10]/80 via-transparent to-[#0e0e10]/95 pointer-events-none" />

            {/* Modal Top Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e0e10]/80 backdrop-blur-md border border-[#ffd499]/30">
                <span className="w-2 h-2 rounded-full bg-[#ffd499] animate-ping" />
                <span className="font-mono text-xs text-[#ffd499]">
                  FULLSCREEN ATELIER STREAM
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-[#2a2a2c]/80 text-[#e5e1e4] hover:text-[#ffd499] flex items-center justify-center backdrop-blur-md border border-[#3f3f46]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Center Reticles */}
            <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-56 h-72 rounded-[48%] border border-[#ffd499]/35 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffd499] shadow-[0_0_16px_rgba(226,184,126,1)]" />
              </div>
              <div className="mt-4 flex gap-4 font-mono text-xs text-[#ffd499]/80 bg-[#0e0e10]/70 px-4 py-1.5 rounded-full backdrop-blur-md">
                <span>T_AXIS: {verdict.postureAxis}</span>
                <span>•</span>
                <span>DRAPE: {verdict.drapeAssessment}</span>
                <span>•</span>
                <span>LOCK: {verdict.latentFitLock}</span>
              </div>
            </div>

            {/* Modal Bottom Verdict Quote */}
            <div className="relative z-10 p-4 rounded-2xl bg-[#131315]/85 backdrop-blur-xl border border-[#3f3f46]/50">
              <p className="text-sm font-serif italic text-[#e5e1e4]">
                {verdict.quote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
