import React, { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: 'Elena Rostova',
    email: 'elena.rostova@couture-client.com',
    atelierLocation: 'Paris Rue Cambon',
    appointmentType: 'bespoke-fitting',
    notes: 'Inquiring about personal drape tailoring for Fall/Winter Minimalist collection, specifically Mulberry Silk pieces.',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div
      id="contact-atelier-modal"
      className="fixed inset-0 z-50 bg-[#0e0e10]/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#18181f] border border-[#ffd499]/40 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#27272a] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffd499] animate-pulse" />
              <span className="text-[10px] font-mono text-[#ffd499] uppercase font-bold tracking-wider">
                Bespoke Atelier Concierge
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#e5e1e4]">
              Private Consultation & Fitting
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Connect directly with our master couturiers and digital pattern engineers for custom physical garment creation.
            </p>
          </div>

          <button
            onClick={onClose}
            id="closeContactBtn"
            className="w-8 h-8 rounded-full bg-[#201f22] text-[#a1a1aa] hover:text-[#e5e1e4] hover:bg-[#2a2a2c] flex items-center justify-center transition-all shrink-0 active:scale-90"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#e2b87e]/20 text-[#ffd499] flex items-center justify-center border border-[#ffd499]/50 shadow-[0_0_24px_rgba(226,184,126,0.3)] animate-bounce">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h4 className="text-lg font-serif font-bold text-[#e5e1e4]">
              Consultation Dispatched
            </h4>
            <p className="text-xs text-[#d2c4b5]/80 max-w-xs leading-relaxed">
              Your bespoke atelier dossier has been transmitted to our Paris atelier. Our lead couturier will contact you within 24 hours.
            </p>
            <div className="text-[11px] font-mono text-[#ffd499] bg-[#3a2a14] px-3 py-1 rounded-full border border-[#ffd499]/30">
              REFERENCE: #REQ-{Date.now().toString().slice(-6)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#d2c4b5]/80 font-semibold block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e10] border border-[#3f3f46]/50 text-xs text-[#e5e1e4] placeholder-[#71717a] focus:outline-none focus:border-[#ffd499] focus:ring-1 focus:ring-[#ffd499]/40 transition-all font-sans"
                  placeholder="e.g. Elena Rostova"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#d2c4b5]/80 font-semibold block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e10] border border-[#3f3f46]/50 text-xs text-[#e5e1e4] placeholder-[#71717a] focus:outline-none focus:border-[#ffd499] focus:ring-1 focus:ring-[#ffd499]/40 transition-all font-sans"
                  placeholder="client@couture.com"
                />
              </div>
            </div>

            {/* Atelier Salon & Consultation Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#d2c4b5]/80 font-semibold block">
                  Atelier Salon
                </label>
                <select
                  value={formData.atelierLocation}
                  onChange={(e) => setFormData({ ...formData, atelierLocation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e10] border border-[#3f3f46]/50 text-xs text-[#e5e1e4] focus:outline-none focus:border-[#ffd499] focus:ring-1 focus:ring-[#ffd499]/40 transition-all font-sans"
                >
                  <option value="Paris Rue Cambon">Paris — Rue Cambon</option>
                  <option value="Milan Via Montenapoleone">Milan — Via Monte Napoleone</option>
                  <option value="Tokyo Ginza 6">Tokyo — Ginza 6</option>
                  <option value="New York Madison Ave">New York — Madison Ave</option>
                  <option value="London Bond Street">London — New Bond St</option>
                  <option value="Digital Virtual Fitting">Global Virtual Fitting Room</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#d2c4b5]/80 font-semibold block">
                  Service Requested
                </label>
                <select
                  value={formData.appointmentType}
                  onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e10] border border-[#3f3f46]/50 text-xs text-[#e5e1e4] focus:outline-none focus:border-[#ffd499] focus:ring-1 focus:ring-[#ffd499]/40 transition-all font-sans"
                >
                  <option value="bespoke-fitting">Bespoke Physical Fitting</option>
                  <option value="custom-material">Custom Textile & Drape Weaving</option>
                  <option value="runway-prototype">Runway Pattern Prototype</option>
                  <option value="gemini-tuning">Personalized AI LoRA Calibration</option>
                </select>
              </div>
            </div>

            {/* Inquiries & Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#d2c4b5]/80 font-semibold block">
                Bespoke Requirements / Drape Notes
              </label>
              <textarea
                rows={3}
                required
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-[#3f3f46]/50 text-xs text-[#e5e1e4] placeholder-[#71717a] focus:outline-none focus:border-[#ffd499] focus:ring-1 focus:ring-[#ffd499]/40 transition-all font-sans resize-none"
                placeholder="Specify preferred textile compositions, measurements, or event dates..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-[#27272a] gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#a1a1aa] hover:text-[#e5e1e4] bg-[#201f22] hover:bg-[#2a2a2c] transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                id="submitContactBtn"
                className="px-6 py-2.5 rounded-full bg-[#e2b87e] text-[#442b00] hover:bg-[#ffd499] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(226,184,126,0.3)] hover:shadow-[0_0_28px_rgba(226,184,126,0.5)] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSubmitting ? 'progress_activity' : 'send'}
                </span>
                <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
