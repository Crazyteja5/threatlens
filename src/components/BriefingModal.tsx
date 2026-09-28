import React, { useState } from 'react';

interface BriefingModalProps {
  isOpen: boolean;
  type: 'briefing' | 'api';
  onClose: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({ isOpen, type, onClose }) => {
  const [email, setEmail] = useState('');
  const [clusterNodes, setClusterNodes] = useState('100-1000');
  const [submitted, setSubmitted] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (type === 'api') {
      const mockKey = `tl_secops_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
      setGeneratedKey(mockKey);
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181b25] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-[#70ffe3]">
            <span className="material-symbols-outlined text-[22px]">
              {type === 'api' ? 'key' : 'calendar_month'}
            </span>
            <h3 className="font-sans font-bold text-base text-white">
              {type === 'api' ? 'Request Enterprise API Access' : 'Schedule Enterprise SOC Briefing'}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#b9cac5] hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#00e5c7]/20 text-[#00e5c7] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">check</span>
            </div>
            <h4 className="font-sans font-bold text-lg text-white">
              {type === 'api' ? 'API Key Provisioned' : 'Briefing Requested'}
            </h4>
            <p className="font-sans text-xs text-[#b9cac5]">
              {type === 'api'
                ? 'Your zero-egress sandbox credentials have been generated.'
                : 'A ThreatLens senior security architect will contact your SecOps team within 2 hours.'}
            </p>

            {generatedKey && (
              <div className="p-3 bg-[#0a0e17] rounded border border-[#00e5c7]/40 font-mono text-xs text-[#70ffe3] break-all select-all">
                {generatedKey}
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#00e5c7] text-[#00382f] font-mono text-xs font-bold rounded uppercase cursor-pointer hover:bg-[#70ffe3]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-[#b9cac5] block mb-1">
                Enterprise Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@defense.enterprise.com"
                className="w-full bg-[#1c1f29] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00e5c7]"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#b9cac5] block mb-1">
                Cluster Nodes / Workload Scale
              </label>
              <select
                value={clusterNodes}
                onChange={(e) => setClusterNodes(e.target.value)}
                className="w-full bg-[#1c1f29] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00e5c7]"
              >
                <option value="10-100">10 – 100 Nodes (Edge / Dev)</option>
                <option value="100-1000">100 – 1,000 Nodes (Core Production)</option>
                <option value="1000-10000">1,000 – 10,000 Nodes (Enterprise Multi-Region)</option>
                <option value="10000+">10,000+ Nodes / Sovereign SCIF Air-Gap</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1c1f29] text-[#b9cac5] font-mono text-xs rounded hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00e5c7] text-[#00382f] font-mono text-xs font-bold rounded uppercase hover:bg-[#70ffe3] cursor-pointer"
              >
                {type === 'api' ? 'Generate API Key' : 'Confirm Briefing'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
