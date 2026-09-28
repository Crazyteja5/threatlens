import React, { useState } from 'react';

export type NavTab =
  | 'overview'
  | 'threat-engine'
  | 'live-scanner'
  | 'audit-stream'
  | 'architecture'
  | 'enterprise-docs';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLiveDemo: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenLiveDemo,
  onOpenDocs,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    setMobileMenuOpen(false);
    if (tab === 'enterprise-docs') {
      onOpenDocs();
    } else {
      onSelectTab(tab);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            {/* ThreatLens Shield SVG Icon */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-[#00e5c7]" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L6 6V14C6 21 10.5 27.5 16 30C21.5 27.5 26 21 26 14V6L16 2Z"
                  fill="#181b25"
                  stroke="#00e5c7"
                  strokeWidth="1.5"
                />
                <circle cx="16" cy="15" r="4" fill="#00e5c7" />
                <path
                  d="M16 8V11M16 19V22M9 15H12M20 15H23"
                  stroke="#70ffe3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="16"
                  cy="15"
                  r="7"
                  stroke="#70ffe3"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base tracking-wider uppercase text-[#dfe2ef] group-hover:text-[#70ffe3] transition-colors">
                ThreatLens
              </span>
              <span className="font-mono text-[9px] font-semibold text-[#00e5c7] px-1.5 py-0.5 rounded border border-[#00e5c7]/30 bg-[#00e5c7]/10 tracking-widest">
                SOC-AI
              </span>
            </div>
          </button>

          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#181b25] border border-white/5 rounded">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5c7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70ffe3]"></span>
            </span>
            <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
              ALL SYSTEMS SECURE // REAL-TIME PROTECTION ACTIVE
            </span>
            <span className="font-mono text-[10px] text-[#b9cac5] px-1.5 py-0.2 bg-[#1c1f29] rounded border border-white/5">
              1.2ms
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px]">
          <button
            onClick={() => handleNavClick('overview')}
            className={`transition-colors font-medium ${
              activeTab === 'overview'
                ? 'text-[#70ffe3] font-semibold drop-shadow-[0_0_8px_rgba(0,229,199,0.4)]'
                : 'text-[#b9cac5] hover:text-[#dfe2ef]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNavClick('threat-engine')}
            className={`transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'threat-engine'
                ? 'text-[#70ffe3] font-semibold drop-shadow-[0_0_8px_rgba(0,229,199,0.4)]'
                : 'text-[#b9cac5] hover:text-[#dfe2ef]'
            }`}
          >
            <span>Threat Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4757] animate-pulse"></span>
          </button>

          <button
            onClick={() => handleNavClick('live-scanner')}
            className={`transition-colors font-medium ${
              activeTab === 'live-scanner'
                ? 'text-[#70ffe3] font-semibold drop-shadow-[0_0_8px_rgba(0,229,199,0.4)]'
                : 'text-[#b9cac5] hover:text-[#dfe2ef]'
            }`}
          >
            Live Scanner
          </button>

          <button
            onClick={() => handleNavClick('audit-stream')}
            className={`transition-colors font-medium ${
              activeTab === 'audit-stream'
                ? 'text-[#70ffe3] font-semibold drop-shadow-[0_0_8px_rgba(0,229,199,0.4)]'
                : 'text-[#b9cac5] hover:text-[#dfe2ef]'
            }`}
          >
            Audit Stream
          </button>

          <button
            onClick={() => handleNavClick('architecture')}
            className={`transition-colors font-medium ${
              activeTab === 'architecture'
                ? 'text-[#70ffe3] font-semibold drop-shadow-[0_0_8px_rgba(0,229,199,0.4)]'
                : 'text-[#b9cac5] hover:text-[#dfe2ef]'
            }`}
          >
            Architecture
          </button>

          <button
            onClick={() => handleNavClick('enterprise-docs')}
            className="transition-colors font-medium text-[#b9cac5] hover:text-[#dfe2ef]"
          >
            Enterprise Docs
          </button>
        </nav>

        {/* Action Buttons Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLiveDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all text-xs font-mono font-medium ${
              activeTab === 'threat-engine'
                ? 'bg-[#00e5c7] text-[#00382f] border-[#00e5c7] shadow-[0_0_16px_rgba(0,229,199,0.4)] font-bold'
                : 'bg-[#181b25] text-[#70ffe3] border-[#00e5c7]/30 shadow-[0_0_12px_rgba(0,229,199,0.2)] hover:bg-[#1c1f29] hover:border-[#00e5c7]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">terminal</span>
            <span className="uppercase tracking-wider">
              {activeTab === 'threat-engine' ? 'Viewing Incident' : 'Live SOC Demo'}
            </span>
          </button>

          {/* Profile / SecOps avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#00e5c7] flex items-center justify-center hover:ring-2 hover:ring-[#00e5c7]/50 transition-all text-[#00382f]"
              title="SOC Operator Account"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#181b25] border border-white/10 rounded-lg shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-semibold text-white">Tier-3 Lead Analyst</span>
                  <span className="font-mono text-[10px] text-[#00e5c7]">ID: #SEC-984</span>
                </div>
                <div className="py-2 space-y-1 font-mono text-[11px] text-[#b9cac5]">
                  <div>Node: US-EAST-01 (eBPF active)</div>
                  <div>Enclave: Air-Gapped Ready</div>
                  <div>Cryptographic Keys: Loaded</div>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between">
                  <button
                    onClick={() => {
                      onOpenLiveDemo();
                      setShowProfileMenu(false);
                    }}
                    className="text-[#00e5c7] hover:underline"
                  >
                    Launch Incident Triage
                  </button>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="text-[#94a3b8] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#b9cac5] hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f131c] border-b border-white/10 px-4 py-3 space-y-2 text-sm">
          <button
            onClick={() => handleNavClick('overview')}
            className="block w-full text-left py-2 text-[#dfe2ef] hover:text-[#00e5c7]"
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('threat-engine')}
            className="block w-full text-left py-2 text-[#ffb3b2] hover:text-[#ff4757] flex items-center justify-between"
          >
            <span>Threat Engine (Live Incident)</span>
            <span className="text-[10px] font-mono bg-red-950 text-red-400 px-1.5 py-0.5 rounded">
              CRITICAL
            </span>
          </button>
          <button
            onClick={() => handleNavClick('live-scanner')}
            className="block w-full text-left py-2 text-[#dfe2ef] hover:text-[#00e5c7]"
          >
            Live Scanner
          </button>
          <button
            onClick={() => handleNavClick('audit-stream')}
            className="block w-full text-left py-2 text-[#dfe2ef] hover:text-[#00e5c7]"
          >
            Audit Stream
          </button>
          <button
            onClick={() => handleNavClick('architecture')}
            className="block w-full text-left py-2 text-[#dfe2ef] hover:text-[#00e5c7]"
          >
            Architecture
          </button>
          <button
            onClick={() => handleNavClick('enterprise-docs')}
            className="block w-full text-left py-2 text-[#dfe2ef] hover:text-[#00e5c7]"
          >
            Enterprise Docs
          </button>
        </div>
      )}
    </header>
  );
};
