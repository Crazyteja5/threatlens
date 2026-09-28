import React from 'react';

interface FooterProps {
  onOpenDocs: () => void;
  onSelectTab: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onSelectTab }) => {
  return (
    <footer className="w-full bg-[#181b25] border-t border-white/5">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans font-bold text-sm text-[#dfe2ef] tracking-wider uppercase">
                ThreatLens
              </span>
              <span className="font-mono text-[9px] tracking-wider px-1.5 py-0.5 bg-[#1c1f29] text-[#70ffe3] rounded border border-white/5 uppercase font-semibold">
                SEC-OPS v4.2
              </span>
            </div>
            <p className="font-sans text-xs text-[#b9cac5]">
              ThreatLens — Autonomous AI Security &amp; Leak Prevention Engine for Next-Gen Enterprises.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[#b9cac5]">
            <button
              onClick={() => onSelectTab('overview')}
              className="hover:text-[#70ffe3] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-[#70ffe3] transition-colors cursor-pointer"
            >
              API Docs
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-[#70ffe3] transition-colors cursor-pointer"
            >
              SOC 2 Type II Compliance
            </button>
            <button
              onClick={() => onSelectTab('threat-engine')}
              className="hover:text-[#70ffe3] transition-colors cursor-pointer"
            >
              Threat Intelligence Feed
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#70ffe3] transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={() => onSelectTab('audit-stream')}
              className="hover:text-[#70ffe3] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c7]"></span>
              <span>Status Page</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-[#b9cac5]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#70ffe3]">
              verified_user
            </span>
            <span className="font-mono text-[11px]">
              Zero-Egress Isolation Verified • 256-bit Post-Quantum Guard • SOC2 Certified
            </span>
          </div>

          <div className="flex items-center gap-6">
            <p className="font-sans">© 2025 ThreatLens Systems Inc. All rights reserved.</p>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security Disclosures
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
