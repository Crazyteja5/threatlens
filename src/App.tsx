/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { OverviewScreen } from './components/OverviewScreen';
import { LiveIncidentScreen } from './components/LiveIncidentScreen';
import { AuditStreamView } from './components/AuditStreamView';
import { Footer } from './components/Footer';
import { EnterpriseDocsModal } from './components/EnterpriseDocsModal';
import { BriefingModal } from './components/BriefingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [briefingModal, setBriefingModal] = useState<{
    isOpen: boolean;
    type: 'briefing' | 'api';
  }>({
    isOpen: false,
    type: 'briefing',
  });

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'live-scanner') {
      setActiveTab('overview');
      setTimeout(() => {
        const el = document.getElementById('live-demo-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (tab === 'architecture') {
      setActiveTab('overview');
      setTimeout(() => {
        const el = document.getElementById('pipeline-architecture');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLiveDemo = () => {
    setActiveTab((prev) => (prev === 'threat-engine' ? 'overview' : 'threat-engine'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#dfe2ef] flex flex-col selection:bg-[#00e5c7] selection:text-[#00201b]">
      {/* Fixed Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenLiveDemo={handleOpenLiveDemo}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main View Area with Top Padding for Fixed Nav */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {activeTab === 'threat-engine' && <LiveIncidentScreen />}
        {activeTab === 'audit-stream' && <AuditStreamView />}
        {activeTab !== 'threat-engine' && activeTab !== 'audit-stream' && (
          <OverviewScreen
            onOpenLiveDemo={() => {
              setActiveTab('threat-engine');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenScheduleModal={() => setBriefingModal({ isOpen: true, type: 'briefing' })}
            onOpenApiModal={() => setBriefingModal({ isOpen: true, type: 'api' })}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenDocs={() => setIsDocsOpen(true)}
        onSelectTab={(tab) => handleSelectTab(tab)}
      />

      {/* Enterprise Documentation Modal */}
      <EnterpriseDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Briefing / API Access Modal */}
      <BriefingModal
        isOpen={briefingModal.isOpen}
        type={briefingModal.type}
        onClose={() => setBriefingModal({ isOpen: false, type: 'briefing' })}
      />
    </div>
  );
}
