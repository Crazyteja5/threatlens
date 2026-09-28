import React, { useState } from 'react';

interface VectorItem {
  id: string;
  time: string;
  title: string;
  payload: string;
  status: 'QUARANTINED' | 'NEUTRALIZING' | 'ISOLATED' | 'STRIPPED' | 'PURGED';
  riskConfidence: string;
  entropy: string;
  mitigation: string;
  proofHash: string;
}

const INITIAL_VECTORS: VectorItem[] = [
  {
    id: '#9812-X',
    time: '14:02:19.411',
    title: 'VECTOR_ID #9812-X',
    payload: "' UNION SELECT null, table_name, column_name FROM information_schema.tables --",
    status: 'QUARANTINED',
    riskConfidence: '99.8%',
    entropy: '9.12 bits',
    mitigation: 'ZERO-KNOWLEDGE PARAMETERIZED ISOLATION & QUERY STRIPPING',
    proofHash: '0x8f4c2e19a7b399201f849b20e4f2019c8a99471f',
  },
  {
    id: '#4411-S',
    time: '14:02:18.902',
    title: 'SQLI_PROBE #4411-S',
    payload: "' OR 1=1 LIMIT 1 -- [SLEEP(5)]",
    status: 'NEUTRALIZING',
    riskConfidence: '96.4%',
    entropy: '7.85 bits',
    mitigation: 'SUB-KERNEL TIMEOUT RESTRICTION & EPHEMERAL SOCKET DROP',
    proofHash: '0x3b21901fa4e89125cc61099277102ccba109f291',
  },
  {
    id: '#8821-C',
    time: '14:02:17.145',
    title: 'UNION_BYPASS #8821-C',
    payload: '/*!50000 UNION*/ SELECT @@version, user(), database()',
    status: 'ISOLATED',
    riskConfidence: '98.1%',
    entropy: '8.44 bits',
    mitigation: 'DYNAMIC SQL TOKEN PARSER HEURISTIC DECONSTRUCTION',
    proofHash: '0x9912aa4f8810629b3109fcbbd4e20911ef628810',
  },
  {
    id: '#3119-A',
    time: '14:02:15.820',
    title: 'HEURISTIC_SCAN #3119-A',
    payload: 'SLEEP(10) -- stacked queries; DROP TABLE temp_sessions;',
    status: 'STRIPPED',
    riskConfidence: '94.2%',
    entropy: '6.90 bits',
    mitigation: 'STATEMENT SEGMENTATION & STACKED QUERY PRUNING',
    proofHash: '0x5c72e901aa72f091bc829910d512ef9012a95c72',
  },
];

interface ProofCard {
  id: string;
  name: string;
  hash: string;
  status: string;
  timestamp: string;
}

export const LiveIncidentScreen: React.FC = () => {
  const [vectors, setVectors] = useState<VectorItem[]>(INITIAL_VECTORS);
  const [selectedVector, setSelectedVector] = useState<VectorItem>(INITIAL_VECTORS[0]);
  const [customPayload, setCustomPayload] = useState<string>(INITIAL_VECTORS[0].payload);
  const [isPurged, setIsPurged] = useState(false);
  const [purgeToast, setPurgeToast] = useState<string | null>(null);
  const [zkpProofCount, setZkpProofCount] = useState<number>(1492);
  const [selectedProofCert, setSelectedProofCert] = useState<ProofCard | null>(null);

  const [proofs, setProofs] = useState<ProofCard[]>([
    {
      id: 'proof-1',
      name: 'SQLi Vector #9812-X',
      hash: '0x8f4c2e19a7b3...e4f2019c8a',
      status: 'Verified ZKP',
      timestamp: '14:02:19.412',
    },
    {
      id: 'proof-2',
      name: 'SQLi Probe #4411-S',
      hash: '0x3b21901fa4e8...77102ccba1',
      status: 'Verified ZKP',
      timestamp: '14:02:18.903',
    },
    {
      id: 'proof-3',
      name: 'Union Bypass #8821-C',
      hash: '0x9912aa4f8810...d4e20911ef',
      status: 'Verified ZKP',
      timestamp: '14:02:17.146',
    },
  ]);

  const handleSelectVector = (item: VectorItem) => {
    setSelectedVector(item);
    setCustomPayload(item.payload);
  };

  const handlePurgeVector = () => {
    setIsPurged(true);
    setPurgeToast('Vector neutralized: Memory pages zeroed & cryptographically locked.');

    // Update active vector state
    setVectors((prev) =>
      prev.map((v) =>
        v.id === selectedVector.id ? { ...v, status: 'PURGED' } : v
      )
    );

    setTimeout(() => {
      setPurgeToast(null);
    }, 4500);
  };

  const handleCommitProof = () => {
    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')
    ).join('');
    const newHash = `0x${randomHex.substring(0, 12)}...${randomHex.substring(12, 20)}`;

    const newProof: ProofCard = {
      id: `proof-${Date.now()}`,
      name: `Sandbox Proof ${selectedVector.id}`,
      hash: newHash,
      status: 'Verified ZKP',
      timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
    };

    setProofs([newProof, ...proofs]);
    setZkpProofCount((prev) => prev + 1);
    setPurgeToast(`ZKP Commitment committed to enclave: ${newHash}`);
    setTimeout(() => setPurgeToast(null), 3500);
  };

  const handleExportDump = () => {
    const dataStr = JSON.stringify(vectors, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threatlens-telemetry-stream-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPurgeToast('Exported telemetry stream dump as JSON');
    setTimeout(() => setPurgeToast(null), 2500);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ef] bg-[#0a0e17] pb-16">
      {/* Toast Notification */}
      {purgeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181b25] border border-[#00e5c7] text-[#70ffe3] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px] text-[#00e5c7]">
            verified_user
          </span>
          <span className="font-mono text-xs font-semibold">{purgeToast}</span>
        </div>
      )}

      {/* Top High-Priority Alert Banner */}
      <div className="w-full bg-[#93000a]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_4px_24px_rgba(255,180,171,0.15)] relative overflow-hidden border-b border-red-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,180,171,0.2),transparent_50%)] pointer-events-none"></div>

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-full bg-[#ffb4ab] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,180,171,0.5)]">
            <span
              className="material-symbols-outlined text-[#690005] text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              crisis_alert
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider bg-[#ffb4ab] text-[#690005] px-1.5 py-0.5 rounded font-bold uppercase">
                CRITICAL INCIDENT #8821-SQL
              </span>
              <span className="font-mono text-[10px] text-[#ffdad6] flex items-center gap-1 font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                LIVE STREAM
              </span>
            </div>
            <h2 className="font-sans font-semibold text-sm sm:text-base text-[#ffdad6] tracking-wide uppercase mt-0.5">
              {isPurged
                ? 'THREAT NEUTRALIZED: VECTOR QUARANTINED & SECURED BY ZERO-KNOWLEDGE PROOF ENGINE'
                : 'LIVE THREAT INJECTION IN PROGRESS: POLYMORPHIC SQL INJECTION (UNION-BASED EXFILTRATION) VECTOR DETECTED'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <div className="hidden xl:flex flex-col items-end">
            <span className="font-mono text-[11px] text-[#ffdad6]/80">ISOLATION LATENCY</span>
            <span className="font-mono text-sm font-bold text-[#ffb4ab]">0.41ms (REAL-TIME)</span>
          </div>

          <button
            onClick={handlePurgeVector}
            className={`px-4 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 uppercase shadow-[0_0_15px_rgba(255,180,171,0.4)] ${
              isPurged
                ? 'bg-[#181b25] text-[#00e5c7] border border-[#00e5c7]'
                : 'bg-[#ffb4ab] text-[#690005] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPurged ? 'check_circle' : 'security_update_warning'}
            </span>
            <span>{isPurged ? 'Vector Purged' : 'Purge Vector'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Analytical Metrics Bar (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-[#181b25] p-4 rounded-xl flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#00e5c7]/40 transition-all border border-white/5">
            <div className="absolute top-0 right-0 p-3 text-[#70ffe3]/20 group-hover:text-[#70ffe3]/40 transition-colors">
              <span className="material-symbols-outlined text-[32px]">block</span>
            </div>
            <span className="font-mono text-[11px] text-[#b9cac5] uppercase font-semibold tracking-wider">
              Blocked Egress Volume
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-sans text-2xl font-bold text-[#dfe2ef]">14.8 GB</span>
              <span className="font-mono text-xs text-[#70ffe3] font-semibold">+12.4% /min</span>
            </div>
            <div className="w-full bg-[#262a34] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#70ffe3] h-full w-[84%] rounded-full shadow-[0_0_8px_rgba(112,255,227,0.6)]"></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#181b25] p-4 rounded-xl flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-red-400/40 transition-all border border-white/5">
            <div className="absolute top-0 right-0 p-3 text-[#ffb3b2]/20 group-hover:text-[#ffb3b2]/40 transition-colors">
              <span className="material-symbols-outlined text-[32px]">security</span>
            </div>
            <span className="font-mono text-[11px] text-[#b9cac5] uppercase font-semibold tracking-wider">
              Token Leaks Neutralized
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-sans text-2xl font-bold text-[#ffb3b2]">0.00%</span>
              <span className="font-mono text-xs text-[#ffb3b2] font-semibold">ZERO LEAK</span>
            </div>
            <div className="w-full bg-[#262a34] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#ffb3b2] h-full w-[100%] rounded-full shadow-[0_0_8px_rgba(255,179,178,0.6)]"></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#181b25] p-4 rounded-xl flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#00e5c7]/40 transition-all border border-white/5">
            <div className="absolute top-0 right-0 p-3 text-[#70ffe3]/20 group-hover:text-[#70ffe3]/40 transition-colors">
              <span className="material-symbols-outlined text-[32px]">speed</span>
            </div>
            <span className="font-mono text-[11px] text-[#b9cac5] uppercase font-semibold tracking-wider">
              Avg Probe Latency
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-sans text-2xl font-bold text-[#dfe2ef]">0.72ms</span>
              <span className="font-mono text-xs text-[#70ffe3] font-semibold">OPTIMAL</span>
            </div>
            <div className="w-full bg-[#262a34] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#70ffe3] h-full w-[35%] rounded-full shadow-[0_0_8px_rgba(112,255,227,0.6)]"></div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#181b25] p-4 rounded-xl flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#00e5c7]/40 transition-all border border-white/5">
            <div className="absolute top-0 right-0 p-3 text-[#70ffe3]/20 group-hover:text-[#70ffe3]/40 transition-colors">
              <span className="material-symbols-outlined text-[32px]">hub</span>
            </div>
            <span className="font-mono text-[11px] text-[#b9cac5] uppercase font-semibold tracking-wider">
              Active ZKP Proofs
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-sans text-2xl font-bold text-[#70ffe3] tabular-nums">
                {zkpProofCount.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-[#70ffe3] font-semibold">VERIFIED</span>
            </div>
            <div className="w-full bg-[#262a34] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#70ffe3] h-full w-[92%] rounded-full shadow-[0_0_8px_rgba(112,255,227,0.6)]"></div>
            </div>
          </div>
        </div>

        {/* Main Grid: Live Telemetry Stream & Neural Payload Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Telemetry & Vector Stream (7 cols) */}
          <div className="lg:col-span-7 bg-[#181b25] rounded-xl p-5 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#70ffe3] text-[20px]">
                  radar
                </span>
                <h3 className="font-sans font-semibold text-sm text-[#dfe2ef] uppercase tracking-wider">
                  Live Telemetry &amp; Vector Stream
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1c1f29] rounded border border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70ffe3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70ffe3]"></span>
                </span>
                <span className="font-mono text-[9px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                  PACKET INSPECTION ACTIVE
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 overflow-x-auto">
              {vectors.map((vec) => {
                const isSelected = selectedVector.id === vec.id;
                let statusBadgeClass = 'bg-[#353943] text-[#b9cac5]';
                let borderClass = 'border-l-2 border-white/20';

                if (vec.status === 'QUARANTINED') {
                  statusBadgeClass = 'bg-[#93000a]/50 text-[#ffb4ab] border border-red-500/30';
                  borderClass = 'border-l-2 border-[#ffb4ab]';
                } else if (vec.status === 'NEUTRALIZING') {
                  statusBadgeClass = 'bg-[#b5032a]/40 text-[#ffb3b2] border border-[#ffb3b2]/30';
                  borderClass = 'border-l-2 border-[#ffb3b2]';
                } else if (vec.status === 'ISOLATED') {
                  statusBadgeClass = 'bg-[#00e5c7]/10 text-[#70ffe3] border border-[#00e5c7]/30';
                  borderClass = 'border-l-2 border-[#70ffe3]';
                } else if (vec.status === 'PURGED') {
                  statusBadgeClass = 'bg-[#00e5c7]/20 text-[#70ffe3] border border-[#00e5c7]';
                  borderClass = 'border-l-2 border-[#00e5c7]';
                }

                return (
                  <div
                    key={vec.id}
                    onClick={() => handleSelectVector(vec)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#262a34] ring-1 ring-[#00e5c7]/60'
                        : 'bg-[#1c1f29] hover:bg-[#262a34]'
                    } ${borderClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#b9cac5]">{vec.time}</span>
                      <div>
                        <div
                          className={`font-mono text-xs font-semibold ${
                            vec.status === 'NEUTRALIZING'
                              ? 'text-[#ffb3b2]'
                              : vec.status === 'QUARANTINED'
                              ? 'text-[#ffb4ab]'
                              : 'text-[#70ffe3]'
                          }`}
                        >
                          {vec.title}
                        </div>
                        <div className="font-sans text-xs text-[#b9cac5] truncate max-w-[280px] sm:max-w-md">
                          Payload: {vec.payload}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${statusBadgeClass}`}
                      >
                        {vec.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVector(vec);
                        }}
                        className="text-[#b9cac5] hover:text-[#70ffe3] transition-colors"
                        title="Detonate in sandbox"
                      >
                        <span className="material-symbols-outlined text-[16px]">terminal</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="font-mono text-[#b9cac5]">
                Showing active buffer stream ({vectors.length} vectors buffered)
              </span>
              <button
                onClick={handleExportDump}
                className="text-[#70ffe3] font-mono text-[10px] tracking-wider hover:underline uppercase flex items-center gap-1 font-semibold"
              >
                <span>Export Stream Dump</span>
                <span className="material-symbols-outlined text-[14px]">download</span>
              </button>
            </div>
          </div>

          {/* Neural Payload Sandbox (5 cols) */}
          <div className="lg:col-span-5 bg-[#181b25] rounded-xl p-5 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#70ffe3] text-[20px]">
                    psychology
                  </span>
                  <h3 className="font-sans font-semibold text-sm text-[#dfe2ef] uppercase tracking-wider">
                    Neural Payload Sandbox
                  </h3>
                </div>
                <span className="font-mono text-[9px] tracking-wider bg-[#00e5c7]/10 text-[#70ffe3] px-2 py-0.5 rounded border border-[#00e5c7]/30 uppercase font-semibold">
                  ZKP ISOLATED
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-mono text-[10px] tracking-wider text-[#b9cac5] uppercase mb-1 block font-semibold">
                    Inspected Raw Payload Vector ({selectedVector.id})
                  </label>
                  <textarea
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    rows={3}
                    className="w-full bg-[#1c1f29] p-3 rounded font-mono text-xs text-[#ffb3b2] border border-[#ffb3b2]/20 focus:outline-none focus:border-[#00e5c7] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1c1f29] p-3 rounded border border-white/5">
                    <span className="font-mono text-[10px] tracking-wider text-[#b9cac5] uppercase block font-semibold">
                      Risk Confidence
                    </span>
                    <span className="font-sans text-xl font-bold text-[#ffb4ab] mt-0.5 block">
                      {selectedVector.riskConfidence}
                    </span>
                    <span className="font-mono text-[9px] text-[#ffb4ab] uppercase mt-0.5 block font-semibold">
                      CRITICAL SEVERITY
                    </span>
                  </div>

                  <div className="bg-[#1c1f29] p-3 rounded border border-white/5">
                    <span className="font-mono text-[10px] tracking-wider text-[#b9cac5] uppercase block font-semibold">
                      Payload Entropy
                    </span>
                    <span className="font-sans text-xl font-bold text-[#70ffe3] mt-0.5 block">
                      {selectedVector.entropy}
                    </span>
                    <span className="font-mono text-[9px] text-[#70ffe3] uppercase mt-0.5 block font-semibold">
                      HIGH COMPLEXITY
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] tracking-wider text-[#b9cac5] uppercase mb-1 block font-semibold">
                    Autonomous Mitigation Applied
                  </label>
                  <div className="bg-[#1c1f29] p-3 rounded border border-[#00e5c7]/30 text-[#70ffe3] font-mono text-[11px] leading-relaxed">
                    {selectedVector.mitigation}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#70ffe3]">
                  verified
                </span>
                <span className="font-mono text-[11px] text-[#b9cac5]">
                  ZKP PROOF GENERATED
                </span>
              </div>
              <button
                onClick={handleCommitProof}
                className="px-4 py-2 bg-[#00e5c7] text-[#00382f] font-mono font-bold text-xs tracking-wider hover:bg-[#70ffe3] transition-all rounded shadow-[0_0_12px_rgba(112,255,227,0.3)] uppercase cursor-pointer"
              >
                Commit Proof
              </button>
            </div>
          </div>
        </div>

        {/* Active Mitigations & Cryptographic Proofs (Zero-Knowledge Audit Trail) */}
        <div className="w-full bg-[#181b25] rounded-xl p-5 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#70ffe3] text-[20px]">key</span>
              <h3 className="font-sans font-semibold text-sm text-[#dfe2ef] uppercase tracking-wider">
                Active Mitigations &amp; Cryptographic Proofs (Zero-Knowledge Audit Trail)
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-wider text-[#b9cac5] uppercase font-semibold">
                SHA-256 Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proofs.slice(0, 3).map((proof) => (
              <div
                key={proof.id}
                onClick={() => setSelectedProofCert(proof)}
                className="bg-[#1c1f29] p-3.5 rounded flex flex-col justify-between border border-white/5 hover:border-[#00e5c7]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-wider text-[#70ffe3] uppercase font-semibold">
                    {proof.name}
                  </span>
                  <span className="material-symbols-outlined text-[#70ffe3] text-[16px] group-hover:scale-110 transition-transform">
                    check_circle
                  </span>
                </div>
                <div className="font-mono text-xs text-[#b9cac5] break-all bg-[#0a0e17] p-2 rounded mb-3 border border-white/5">
                  {proof.hash}
                </div>
                <div className="flex items-center justify-between text-xs text-[#b9cac5] pt-2 border-t border-white/5">
                  <span>Status: {proof.status}</span>
                  <span className="text-[#70ffe3] font-mono font-bold text-[10px]">SECURE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proof Certificate Modal */}
      {selectedProofCert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b25] border border-[#00e5c7] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#70ffe3]">
                <span className="material-symbols-outlined text-[22px]">verified</span>
                <span className="font-sans font-bold text-sm tracking-wider uppercase">
                  Zero-Knowledge Proof Certificate
                </span>
              </div>
              <button
                onClick={() => setSelectedProofCert(null)}
                className="text-[#b9cac5] hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#b9cac5]">
              <div>
                <span className="text-white font-semibold">Audit Vector:</span>{' '}
                {selectedProofCert.name}
              </div>
              <div>
                <span className="text-white font-semibold">Cryptographic Hash:</span>{' '}
                <span className="text-[#00e5c7]">{selectedProofCert.hash}</span>
              </div>
              <div>
                <span className="text-white font-semibold">Timestamp:</span>{' '}
                {selectedProofCert.timestamp}
              </div>
              <div>
                <span className="text-white font-semibold">Enclave Verification:</span> HARDWARE
                SECURE (eBPF Kernel Ring 0)
              </div>
              <div className="p-3 bg-[#0a0e17] rounded border border-white/5 text-[11px] leading-relaxed text-[#70ffe3]">
                Verification Signature: [SHA-256: 7f83b1652410a8d...99b2]
                <br />
                Mathematical Invariant: ZERO_EGRESS_PRESERVED
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProofCert(null)}
                className="px-4 py-2 bg-[#00e5c7] text-[#00382f] font-mono text-xs font-bold rounded uppercase hover:bg-[#70ffe3]"
              >
                Dismiss Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
