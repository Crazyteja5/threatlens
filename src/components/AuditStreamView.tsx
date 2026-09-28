import React, { useState } from 'react';

interface AuditEvent {
  id: string;
  timestamp: string;
  source: string;
  dest: string;
  verdict: 'BLOCKED' | 'SAFE' | 'QUARANTINED' | 'STRIPPED';
  rule: string;
  payloadSample: string;
  hash: string;
  latency: string;
}

const STREAM_EVENTS: AuditEvent[] = [
  {
    id: 'EVT-9041',
    timestamp: '14:24:12.890',
    source: '10.244.3.18 (svc/chat-bridge)',
    dest: 'api.openai.com',
    verdict: 'BLOCKED',
    rule: 'DLP_OPENAI_API_KEY_LEAK',
    payloadSample: 'Bearer sk-proj-842910...941',
    hash: '0x94fa1029cba19024',
    latency: '0.62ms',
  },
  {
    id: 'EVT-9040',
    timestamp: '14:24:11.401',
    source: '10.244.1.92 (svc/web-gateway)',
    dest: 's3.us-east-1.amazonaws.com',
    verdict: 'SAFE',
    rule: 'S3_BUCKET_EGRESS_VERIFIED',
    payloadSample: 'GET /assets/ui_bundle.js HTTP/2',
    hash: '0x3100ba981fca0091',
    latency: '0.45ms',
  },
  {
    id: 'EVT-9039',
    timestamp: '14:24:09.112',
    source: '10.244.2.44 (ingress/envoy)',
    dest: 'svc/auth-core',
    verdict: 'QUARANTINED',
    rule: 'SQLI_UNION_POLYMORPHIC',
    payloadSample: "' UNION SELECT null, table_name FROM info_schema",
    hash: '0x8f4c2e19a7b39920',
    latency: '0.41ms',
  },
  {
    id: 'EVT-9038',
    timestamp: '14:24:07.720',
    source: '10.244.8.11 (worker/celery-04)',
    dest: '192.168.1.100 (db-cluster)',
    verdict: 'STRIPPED',
    rule: 'UNAUTHORIZED_SUBQUERY_PRUNE',
    payloadSample: 'SLEEP(10) -- stacked query execution attempt',
    hash: '0x5c72e901aa72f091',
    latency: '0.51ms',
  },
  {
    id: 'EVT-9037',
    timestamp: '14:24:05.210',
    source: '10.244.0.12 (k8s-apiserver)',
    dest: 'etcd-cluster',
    verdict: 'SAFE',
    rule: 'MUTUAL_TLS_HMAC_VERIFIED',
    payloadSample: 'Cert: spiffe://cluster.local/ns/kube-system',
    hash: '0x7129ac1059f10294',
    latency: '0.28ms',
  },
  {
    id: 'EVT-9036',
    timestamp: '14:24:02.991',
    source: '10.244.4.15 (svc/export-job)',
    dest: 'external-dropbox.com',
    verdict: 'BLOCKED',
    rule: 'PCI_DSS_CREDIT_CARD_LEAK',
    payloadSample: 'PAN pattern detected: 4111-2190-****-4910',
    hash: '0xbb2910fa7109281a',
    latency: '0.78ms',
  },
];

export const AuditStreamView: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'BLOCKED' | 'SAFE' | 'QUARANTINED'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filtered = STREAM_EVENTS.filter((e) => {
    if (filter !== 'ALL' && e.verdict !== filter) return false;
    if (
      search &&
      !e.rule.toLowerCase().includes(search.toLowerCase()) &&
      !e.source.toLowerCase().includes(search.toLowerCase()) &&
      !e.dest.toLowerCase().includes(search.toLowerCase()) &&
      !e.hash.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-[#70ffe3] mb-1">
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">
              IMMUTABLE APPEND-ONLY REPOSITORY
            </span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#dfe2ef]">
            Encrypted Audit Stream
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#b9cac5] mt-1">
            Real-time cryptographic trail with Merkle root validation and zero packet modification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#181b25] px-3 py-1.5 rounded border border-white/5 font-mono text-xs text-[#70ffe3]">
            <span className="w-2 h-2 rounded-full bg-[#00e5c7] animate-ping"></span>
            <span>MERKLE ROOT: 0x99e2f...1a4</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181b25] p-3 rounded-lg border border-white/5">
        <div className="flex items-center gap-1.5 bg-[#1c1f29] p-1 rounded border border-white/5">
          {(['ALL', 'BLOCKED', 'QUARANTINED', 'SAFE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#00e5c7] text-[#00382f] font-bold shadow'
                  : 'text-[#b9cac5] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px] flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#b9cac5] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by rule, IP, pod, or hash..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#1c1f29] border border-white/10 rounded font-mono text-xs text-[#dfe2ef] focus:outline-none focus:border-[#00e5c7]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181b25] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#1c1f29] text-[#b9cac5] uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Rule Triggered</th>
                <th className="py-3 px-4">Source &rarr; Destination</th>
                <th className="py-3 px-4">Payload Extract</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">ZKP Cryptogram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((evt) => {
                let badgeClass = 'text-[#70ffe3] bg-[#00e5c7]/10 border-[#00e5c7]/30';
                if (evt.verdict === 'BLOCKED') {
                  badgeClass = 'text-[#ffb3b2] bg-[#b5032a]/30 border-red-500/30';
                } else if (evt.verdict === 'QUARANTINED') {
                  badgeClass = 'text-[#ffb4ab] bg-[#93000a]/40 border-red-500/40';
                } else if (evt.verdict === 'STRIPPED') {
                  badgeClass = 'text-[#ffc070] bg-[#ffc070]/10 border-[#ffc070]/30';
                }

                return (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-[#262a34] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{evt.id}</div>
                      <div className="text-[11px] text-[#b9cac5]">{evt.timestamp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeClass}`}
                      >
                        {evt.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">{evt.rule}</td>
                    <td className="py-3 px-4 text-[#b9cac5]">
                      <div>{evt.source}</div>
                      <div className="text-[10px] text-[#70ffe3]">&darr; {evt.dest}</div>
                    </td>
                    <td className="py-3 px-4 text-[#dfe2ef] max-w-[200px] truncate">
                      {evt.payloadSample}
                    </td>
                    <td className="py-3 px-4 text-[#70ffe3] font-semibold">{evt.latency}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-[#0a0e17] px-2 py-1 rounded text-[11px] text-[#70ffe3] border border-white/5">
                        {evt.hash}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b25] border border-[#00e5c7] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#70ffe3] text-[20px]">
                  security
                </span>
                <span className="font-bold text-sm text-white">
                  Event Inspector: {selectedEvent.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#b9cac5] hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[#b9cac5]">Timestamp:</span>{' '}
                <span className="text-white">{selectedEvent.timestamp}</span>
              </div>
              <div>
                <span className="text-[#b9cac5]">Rule:</span>{' '}
                <span className="text-[#70ffe3] font-bold">{selectedEvent.rule}</span>
              </div>
              <div>
                <span className="text-[#b9cac5]">Verdict:</span>{' '}
                <span className="text-white font-bold">{selectedEvent.verdict}</span>
              </div>
              <div>
                <span className="text-[#b9cac5]">Source Node:</span>{' '}
                <span className="text-white">{selectedEvent.source}</span>
              </div>
              <div>
                <span className="text-[#b9cac5]">Target:</span>{' '}
                <span className="text-white">{selectedEvent.dest}</span>
              </div>
              <div>
                <span className="text-[#b9cac5]">Raw Payload Buffer:</span>
                <pre className="p-3 bg-[#0a0e17] rounded border border-white/10 text-[#ffb3b2] mt-1 break-all whitespace-pre-wrap">
                  {selectedEvent.payloadSample}
                </pre>
              </div>
              <div>
                <span className="text-[#b9cac5]">Cryptographic Hash:</span>{' '}
                <span className="text-[#00e5c7]">{selectedEvent.hash}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-[#00e5c7] text-[#00382f] font-bold rounded uppercase cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
