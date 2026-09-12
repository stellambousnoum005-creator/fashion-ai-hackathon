import React, { useState, useEffect } from 'react';
import { PipelineConfig, VonageStatus } from '../types';

interface PipelineViewProps {
  config: PipelineConfig;
  onChangeConfig: (newConfig: Partial<PipelineConfig>) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  config,
  onChangeConfig,
}) => {
  const [techPackCopied, setTechPackCopied] = useState(false);
  const [showTechPackModal, setShowTechPackModal] = useState(false);
  const [vonageStatus, setVonageStatus] = useState<VonageStatus | null>(null);
  const [isSendingSignal, setIsSendingSignal] = useState(false);
  const [signalSuccessMsg, setSignalSuccessMsg] = useState<string | null>(null);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);

  // Load Vonage Video API status
  const fetchVonageStatus = async () => {
    try {
      const res = await fetch('/api/vonage/status');
      if (res.ok) {
        const data = await res.json();
        setVonageStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch Vonage status:', e);
    }
  };

  useEffect(() => {
    fetchVonageStatus();
    const interval = setInterval(fetchVonageStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestSignal = async () => {
    setIsSendingSignal(true);
    try {
      const res = await fetch('/api/vonage/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'couture_telemetry_ping',
          data: JSON.stringify({
            event: 'MIRROR_TELEMETRY_PING',
            timestamp: new Date().toISOString(),
            resolution: config.resolution,
            model: config.activeModel,
            loraWeight: config.loraWeight,
          }),
        }),
      });
      if (res.ok) {
        setSignalSuccessMsg('Signal dispatched successfully to Vonage Video session!');
        fetchVonageStatus();
        setTimeout(() => setSignalSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      console.warn('Signal test failed:', err);
    } finally {
      setIsSendingSignal(false);
    }
  };

  const handleCreateNewSession = async () => {
    setIsRefreshingSession(true);
    try {
      const res = await fetch('/api/vonage/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archiveMode: 'manual',
          p2pPreference: 'disabled',
        }),
      });
      if (res.ok) {
        setSignalSuccessMsg('New Vonage Video session created & locked to mirror!');
        fetchVonageStatus();
        setTimeout(() => setSignalSuccessMsg(null), 3500);
      }
    } catch (e) {
      console.warn('Failed creating new Vonage session:', e);
    } finally {
      setIsRefreshingSession(false);
    }
  };

  const pipelineStages = [
    {
      id: 'stream',
      name: 'Vonage Video Stream Ingest',
      type: '1080p • 60 FPS • WebRTC',
      status: 'ONLINE',
      metric: '18ms latency',
      icon: 'videocam',
      color: 'text-[#ffd499]',
      description: 'Zero-latency WebRTC ingest stream pipeline transmitting 60 frames/sec studio video feeds.',
    },
    {
      id: 'gemini',
      name: 'Gemini 1.5 Pro Vision Inference',
      type: 'Multimodal Neural Drape Analysis',
      status: 'ACTIVE',
      metric: '33 Body Landmarks',
      icon: 'smart_toy',
      color: 'text-[#ddb8ff]',
      description: 'Extracts 3D anatomy pose, garment drape stiffness vectors, and spinal curvature in real-time.',
    },
    {
      id: 'latent',
      name: 'Latent Fit Lock Engine',
      type: 'Topological Drape Mesh',
      status: 'LOCKED',
      metric: 'Confidence 0.98',
      icon: 'view_in_ar',
      color: 'text-[#63caff]',
      description: 'Constrains generative garment silhouettes to the golden ratio and model anatomical boundaries.',
    },
    {
      id: 'lora',
      name: 'Haute Couture LoRA Synthesizer',
      type: 'Archive Diffusion Model',
      status: 'HOT',
      metric: `Weight: ${config.loraWeight.toFixed(2)}`,
      icon: 'tune',
      color: 'text-[#ffd499]',
      description: 'Applies fine-tuned atelier weights (bias cuts, sharp lapels, fluid silk physics) to recommendations.',
    },
  ];

  const sampleTechPack = {
    atelier: 'MorphoMix Haute Couture AI',
    timestamp: new Date().toISOString(),
    silhouette: '90s Minimalist Bias-Cut Column',
    modelInference: {
      engine: config.activeModel,
      latency: '18ms',
      bodyLandmarks: 33,
      postureAngle: '14.8°',
      latentFitConfidence: config.latentFitConfidence,
      loraWeight: config.loraWeight,
      cfgScale: config.cfgScale,
    },
    garmentSpecifications: [
      {
        item: 'Silk Slip Blouse #04',
        material: '100% Mulberry Silk Crepe de Chine',
        gsm: 85,
        grainLine: '45° True Bias',
        seamAllowance: '0.6cm French Seam',
      },
      {
        item: 'Onyx Tailored Wool Trousers #12',
        material: 'Super 120s Worsted Wool',
        gsm: 280,
        pleatDepth: '3.2cm Knife Pleat',
        rise: 'Drop Rise 31cm',
      },
      {
        item: 'Architectural Trench #01',
        material: 'Treated Gabardine & Bonded Silk',
        gsm: 360,
        shoulderPadding: '1.8cm Sculpted High-Density Foam',
      }
    ]
  };

  const handleCopyTechPack = () => {
    navigator.clipboard?.writeText(JSON.stringify(sampleTechPack, null, 2));
    setTechPackCopied(true);
    setTimeout(() => setTechPackCopied(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#e5e1e4] tracking-tight">
            AI Pipeline & Telemetry
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181f] border border-[#38bdf8]/30 font-mono text-[11px] text-[#b2e1ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b2e1ff] animate-ping" />
            PIPELINE 60FPS
          </div>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Real-time neural computation routing from high-throughput video stream ingest to Gemini Vision stylist analysis.
        </p>
      </div>

      {/* Real-time Pipeline Nodes */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono uppercase font-bold text-[#d2c4b5]/80 tracking-wider">
          Active Inference Stages
        </span>
        <div className="space-y-2.5">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.id}
              className="p-4 rounded-2xl bg-[#18181f]/90 border border-[#27272a] hover:border-[#3f3f46] transition-all flex items-start justify-between gap-4 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#201f22] border border-[#3f3f46]/40 flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[20px] ${stage.color}`}>
                    {stage.icon}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#a1a1aa]">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-[#e5e1e4]">
                      {stage.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#d2c4b5]/70 font-mono">
                    {stage.type}
                  </p>
                  <p className="text-xs text-[#a1a1aa] pt-1 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-[#0e0e10] border border-[#3f3f46] font-mono text-[10px] text-[#ffd499]">
                  {stage.status}
                </span>
                <span className="text-[11px] font-mono text-[#b2e1ff]">
                  {stage.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Parameter Control Deck */}
      <div className="p-5 rounded-2xl bg-[#18181f]/90 border border-[#4e453a]/60 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffd499] text-[20px]">
              tune
            </span>
            <h3 className="text-sm font-semibold text-[#e5e1e4] uppercase font-mono tracking-wider">
              Generative Parametric Controls
            </h3>
          </div>
          <span className="text-xs font-mono text-[#ffd499]">
            HOT RELOAD
          </span>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#d2c4b5] uppercase block">
            Vision Inference Foundation
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Gemini 1.5 Pro', 'Gemini 2.0 Flash'] as const).map((model) => (
              <button
                key={model}
                onClick={() => onChangeConfig({ activeModel: model })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold font-mono transition-all border ${
                  config.activeModel === model
                    ? 'bg-[#3a2a14] text-[#ffd499] border-[#ffd499] shadow-[0_0_12px_rgba(226,184,126,0.25)]'
                    : 'bg-[#201f22] text-[#a1a1aa] border-[#27272a] hover:text-[#e5e1e4]'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* LoRA Strength Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#d2c4b5]">Haute Couture LoRA Weight</span>
            <span className="text-[#ffd499] font-bold">
              {config.loraWeight.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.loraWeight}
            onChange={(e) => onChangeConfig({ loraWeight: parseFloat(e.target.value) })}
            className="w-full accent-[#ffd499] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#a1a1aa]">
            <span>0.1 (Subtle Drapery)</span>
            <span>1.0 (Strict Architectural Atelier)</span>
          </div>
        </div>

        {/* Guidance Scale (CFG) Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#d2c4b5]">Guidance Scale (CFG Scale)</span>
            <span className="text-[#ffd499] font-bold">
              {config.cfgScale.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="15.0"
            step="0.5"
            value={config.cfgScale}
            onChange={(e) => onChangeConfig({ cfgScale: parseFloat(e.target.value) })}
            className="w-full accent-[#ffd499] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#a1a1aa]">
            <span>3.0 (Organic Flow)</span>
            <span>7.5 (Standard Couture)</span>
            <span>15.0 (Rigid Geometry)</span>
          </div>
        </div>

        {/* Export Tech Pack Action */}
        <div className="pt-2 flex items-center justify-between border-t border-[#27272a]">
          <span className="text-xs text-[#a1a1aa]">
            Generate CAD cut sheets & garment pattern tokens
          </span>
          <button
            onClick={() => setShowTechPackModal(true)}
            id="exportTechPackBtn"
            className="px-4 py-2 rounded-full bg-[#ffd499] text-[#442b00] text-xs font-semibold hover:bg-[#e2b87e] transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(226,184,126,0.3)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            <span>Inspect Tech Pack</span>
          </button>
        </div>
      </div>

      {/* Vonage Video API Real-Time Ingest & Signaling Hub */}
      <div className="p-5 rounded-2xl bg-[#18181f]/95 border border-[#38bdf8]/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e273a] text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/30">
              <span className="material-symbols-outlined text-[18px]">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#e5e1e4] uppercase font-mono tracking-wider">
                  Vonage Video API Ingest & Signaling
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] text-[9px] font-mono uppercase font-bold border border-[#38bdf8]/30">
                  OpenAPI v0.3.2
                </span>
              </div>
              <p className="text-[11px] text-[#a1a1aa]">
                WebRTC session management, garment detection signaling, and fashion archives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e10] border border-[#27272a] font-mono text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                vonageStatus?.isConfigured ? 'bg-[#22c55e] animate-pulse' : 'bg-[#e2b87e]'
              }`}
            />
            <span className={vonageStatus?.isConfigured ? 'text-[#22c55e]' : 'text-[#ffd499]'}>
              {vonageStatus?.isConfigured ? 'VONAGE LIVE' : 'SANDBOX / LOCAL'}
            </span>
          </div>
        </div>

        {/* Signal Status banner */}
        {signalSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-[#0f2e24] border border-[#22c55e]/40 text-xs text-[#86efac] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{signalSuccessMsg}</span>
          </div>
        )}

        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a] space-y-1">
            <span className="text-[10px] text-[#a1a1aa] uppercase tracking-wider block">
              Active Vonage Session ID
            </span>
            <span className="text-[#ffd499] break-all select-all font-semibold block text-[11px]">
              {vonageStatus?.activeSessionId || '2_MX4xMDBfjE0Mzc2NzY1NDgwMTJ-TjMzfn4'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0e0e10] border border-[#27272a] space-y-1">
            <span className="text-[10px] text-[#a1a1aa] uppercase tracking-wider block">
              Vonage Application ID
            </span>
            <span className="text-[#b2e1ff] break-all select-all font-semibold block text-[11px]">
              {vonageStatus?.applicationId || '93e36bb9-b72c-45b6-a9ea-5c37dbc49906'}
            </span>
          </div>
        </div>

        {/* OpenAPI 3.0.3 Endpoints Reference */}
        <div className="p-3 rounded-xl bg-[#0e0e10]/80 border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#d2c4b5]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#ffd499]">
              Bound Vonage Video REST Endpoints
            </span>
            <span className="text-[#a1a1aa] text-[10px]">https://video.api.vonage.com</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-[#a1a1aa]">
            <div className="flex items-center justify-between py-0.5 border-b border-[#1f1f23]">
              <span className="text-[#38bdf8]">POST /session/create</span>
              <span>Session Initializer (archiveMode=manual)</span>
            </div>
            <div className="flex items-center justify-between py-0.5 border-b border-[#1f1f23]">
              <span className="text-[#38bdf8]">POST /v2/project/.../signal</span>
              <span>Wearer Garments & Telemetry Broadcast</span>
            </div>
            <div className="flex items-center justify-between py-0.5 border-b border-[#1f1f23]">
              <span className="text-[#38bdf8]">GET /v2/project/.../connection</span>
              <span>Connected Studio Displays & Clients</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#38bdf8]">POST /v2/project/.../archive</span>
              <span>Haute Couture Runway MP4 Recording</span>
            </div>
          </div>
        </div>

        {/* Real-time Vonage Signals Log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#d2c4b5] tracking-wider">
              Signal Stream Monitor (Real-Time Garment Detection)
            </span>
            <span className="text-[10px] font-mono text-[#a1a1aa]">
              {vonageStatus?.recentSignals?.length || 0} Events Recorded
            </span>
          </div>

          <div className="rounded-xl bg-[#0e0e10] p-3 border border-[#27272a] max-h-36 overflow-y-auto space-y-1.5 font-mono text-[10px]">
            {vonageStatus?.recentSignals && vonageStatus.recentSignals.length > 0 ? (
              vonageStatus.recentSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between p-1.5 rounded bg-[#18181f]/80 border border-[#27272a]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                    <span className="text-[#ffd499] font-bold">{sig.type}</span>
                    <span className="text-[#a1a1aa] truncate max-w-xs">{sig.data}</span>
                  </div>
                  <span className="text-[#64748b] shrink-0 text-[9px]">
                    {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-[#71717a]">
                No signals yet. Tap "Scan Clothes to Wardrobe" in the Mirror to broadcast garment detections.
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#27272a]">
          <span className="text-[11px] text-[#a1a1aa]">
            Configured in <code className="text-[#ffd499]">.env</code>: <code className="text-[#b2e1ff]">VONAGE_APPLICATION_ID</code> & <code className="text-[#b2e1ff]">VONAGE_JWT</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewSession}
              disabled={isRefreshingSession}
              className="px-3 py-1.5 rounded-full bg-[#201f22] text-[#e5e1e4] text-xs font-mono font-semibold hover:bg-[#2a2a2c] transition-all flex items-center gap-1 border border-[#3f3f46] cursor-pointer disabled:opacity-60"
              title="Create new Vonage Video session via /session/create"
            >
              <span className={`material-symbols-outlined text-[14px] ${isRefreshingSession ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>New Session</span>
            </button>

            <button
              onClick={handleSendTestSignal}
              disabled={isSendingSignal}
              className="px-3.5 py-1.5 rounded-full bg-[#0e273a] text-[#38bdf8] text-xs font-mono font-semibold hover:bg-[#12334d] transition-all flex items-center gap-1.5 border border-[#38bdf8]/40 shadow-sm cursor-pointer disabled:opacity-60"
              title="Send a live test signal via /v2/project/.../signal"
            >
              <span className={`material-symbols-outlined text-[14px] ${isSendingSignal ? 'animate-spin' : ''}`}>
                cell_tower
              </span>
              <span>{isSendingSignal ? 'Transmitting...' : 'Broadcast Test Signal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tech Pack Modal */}
      {showTechPackModal && (
        <div className="fixed inset-0 z-50 bg-[#0e0e10]/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#18181f] border border-[#4e453a] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#ffd499] uppercase tracking-wider font-bold">
                  HAUTE COUTURE SPECIFICATION SHEET
                </span>
                <h3 className="text-lg font-serif font-bold text-[#e5e1e4]">
                  Atelier Generative Tech Pack
                </h3>
              </div>
              <button
                onClick={() => setShowTechPackModal(false)}
                className="w-8 h-8 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#e5e1e4] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-[#0e0e10] p-4 border border-[#27272a] font-mono text-xs text-[#d2c4b5]">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(sampleTechPack, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#a1a1aa] font-mono">
                JSON schema v2.4 • Ready for CLO3D / Browzwear
              </span>
              <button
                onClick={handleCopyTechPack}
                className="px-4 py-2 rounded-full bg-[#e2b87e] text-[#442b00] text-xs font-semibold hover:bg-[#ffd499] transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {techPackCopied ? 'check' : 'content_copy'}
                </span>
                <span>{techPackCopied ? 'Copied to Clipboard' : 'Copy Tech Pack'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
