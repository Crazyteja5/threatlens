import React, { useState } from 'react';

interface EnterpriseDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseDocsModal: React.FC<EnterpriseDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'api' | 'ebpf' | 'zkp'>('quickstart');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181b25] border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1c1f29]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#70ffe3] text-[22px]">
              menu_book
            </span>
            <div>
              <h3 className="font-sans font-bold text-base text-white">
                ThreatLens Enterprise Documentation
              </h3>
              <p className="font-mono text-xs text-[#b9cac5]">
                API Specifications, eBPF Kernel Probes &amp; Zero-Knowledge Proofs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#b9cac5] hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-white/10 bg-[#0a0e17] px-6 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'quickstart'
                ? 'border-[#00e5c7] text-[#70ffe3]'
                : 'border-transparent text-[#b9cac5] hover:text-white'
            }`}
          >
            01. Quickstart &amp; Helm
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#00e5c7] text-[#70ffe3]'
                : 'border-transparent text-[#b9cac5] hover:text-white'
            }`}
          >
            02. REST &amp; gRPC API
          </button>
          <button
            onClick={() => setActiveTab('ebpf')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'ebpf'
                ? 'border-[#00e5c7] text-[#70ffe3]'
                : 'border-transparent text-[#b9cac5] hover:text-white'
            }`}
          >
            03. eBPF Kernel Ingress
          </button>
          <button
            onClick={() => setActiveTab('zkp')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'zkp'
                ? 'border-[#00e5c7] text-[#70ffe3]'
                : 'border-transparent text-[#b9cac5] hover:text-white'
            }`}
          >
            04. Zero-Knowledge Cryptography
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono text-[#dfe2ef]">
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-sm text-white">Kubernetes Helm Deployment</h4>
              <p className="text-[#b9cac5] font-sans">
                Deploy the ThreatLens sidecar or node daemonset into your cluster with zero pod restarts.
              </p>
              <div className="relative bg-[#0a0e17] p-4 rounded border border-white/10">
                <pre className="text-[#70ffe3] overflow-x-auto">
{`# Add ThreatLens Helm Repository
helm repo add threatlens https://charts.threatlens.io
helm repo update

# Install ThreatLens DaemonSet with eBPF Ring 0 support
helm install threatlens-operator threatlens/threatlens-agent \\
  --namespace secops-system --create-namespace \\
  --set enforceMode=true \\
  --set airGapped=false \\
  --set memoryIsolation=postQuantumZero`}
                </pre>
                <button
                  onClick={() =>
                    copyCode(
                      'helm repo add threatlens https://charts.threatlens.io && helm install threatlens-operator threatlens/threatlens-agent --namespace secops-system',
                      'helm'
                    )
                  }
                  className="absolute top-3 right-3 text-[#b9cac5] hover:text-[#70ffe3] bg-[#1c1f29] px-2 py-1 rounded text-[10px]"
                >
                  {copiedSnippet === 'helm' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-sm text-white">POST /v1/intercept/eval</h4>
              <p className="text-[#b9cac5] font-sans">
                Synchronously evaluate an outbound network stream or raw LLM inference payload.
              </p>
              <div className="relative bg-[#0a0e17] p-4 rounded border border-white/10">
                <pre className="text-[#70ffe3] overflow-x-auto">
{`curl -X POST https://api.threatlens.io/v1/intercept/eval \\
  -H "Authorization: Bearer secops_key_live_948a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trace_id": "req-98401",
    "vector_type": "OUTBOUND_EGRESS",
    "payload": "user_id=149&token=sk-proj-491...",
    "policy_matrix": "PCI_DSS_HIPAA_STRICT"
  }'`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'ebpf' && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-sm text-white">eBPF TC &amp; XDP Filter Hook</h4>
              <p className="text-[#b9cac5] font-sans">
                ThreatLens attaches directly to Linux TC egress filters to intercept raw Ethernet frames before they touch the wire.
              </p>
              <div className="bg-[#0a0e17] p-4 rounded border border-white/10 text-[#b9cac5]">
                <div>Hardware Ring: eBPF XDP Driver Mode</div>
                <div>Median Interception Latency: 0.18ms</div>
                <div>Memory Buffer Policy: Ephemeral RingBuffer (Zero Page Swap)</div>
              </div>
            </div>
          )}

          {activeTab === 'zkp' && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-sm text-white">Zero-Knowledge Proofs Architecture</h4>
              <p className="text-[#b9cac5] font-sans">
                Verify that data was inspected and neutralized without storing raw sensitive enterprise data in logs or third-party cloud vaults.
              </p>
              <div className="bg-[#0a0e17] p-4 rounded border border-white/10 text-[#70ffe3]">
                <div>Proof Protocol: Groth16 zk-SNARK / BLS12-381</div>
                <div>Circuit Size: 2^18 constraints</div>
                <div>Verification Cost: &lt; 0.05ms per proof</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#1c1f29] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00e5c7] text-[#00382f] font-mono text-xs font-bold rounded uppercase cursor-pointer hover:bg-[#70ffe3]"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
